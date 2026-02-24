import { useProfile } from "../hooks/useStudent";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCap, ExternalLink, Loader2, AlertCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import * as studentApi from "../api/student";

const IS_ONLINE_LESSON_ENABLED = true;

const VROOM_APP_URL = (import.meta as any).env?.VITE_VROOM_APP_URL || "http://localhost:5173";

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const COURSES_URL = 'https://myenglishuz.perfectlyspoken.team/app/courses';

export const HomePage = () => {
  const { data: profile, isLoading, error } = useProfile();
  const user = useAuthStore((s) => s.user);
  const [isJoiningLesson, setIsJoiningLesson] = useState(false);

  const handleOpenVideoLessons = () => {
    window.open(COURSES_URL, "_blank", "noopener,noreferrer");
  }

  const handleJoinOnlineLesson = async () => {
    if (!profile?.group_id || !user?.id) {
      console.warn("[handleJoinOnlineLesson] Missing profile.group_id or user.id", {
        group_id: profile?.group_id,
        user_id: user?.id
      });
      return;
    }

    setIsJoiningLesson(true);
    try {
      console.log("[handleJoinOnlineLesson] Fetching active lessons for group:", profile.group_id);

      // Fetch active lessons for the student's group from backend
      const activeLessons = await studentApi.getActiveLessons();

      console.log("[handleJoinOnlineLesson] Received active lessons:", activeLessons);

      // Find lessons for the student's group
      const expectedGroupId = `group_${profile.group_id}`;
      const lessonsForGroup = activeLessons.filter((lesson: any) => {
        const matches = String(lesson.groupId) === String(expectedGroupId);
        console.log("[handleJoinOnlineLesson] Checking lesson:", {
          lessonId: lesson.id,
          lessonGroupId: lesson.groupId,
          expectedGroupId,
          matches
        });
        return matches;
      });

      // If multiple lessons exist, pick the most recent one (by startedAt)
      const lessonForGroup = lessonsForGroup.length > 0
        ? lessonsForGroup.sort((a: any, b: any) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        )[0]
        : null;

      if (lessonForGroup && user?.id && user?.full_name) {
        console.log("[handleJoinOnlineLesson] Found matching lesson, attempting to join:", lessonForGroup.id);

        // Auto-join by calling the backend join endpoint
        try {
          const joinData = await studentApi.joinOnlineLesson(lessonForGroup.id);
          console.log("[handleJoinOnlineLesson] Join successful, received data:", joinData);

          const { token, livekitUrl, lessonId } = joinData;

          if (!token || !livekitUrl || !lessonId) {
            throw new Error("Missing required join data (token, livekitUrl, or lessonId)");
          }

          // Redirect to student room with token data
          const params = new URLSearchParams();
          params.set("token", token);
          params.set("livekitUrl", livekitUrl);
          params.set("lessonId", lessonId);
          params.set("userId", String(user.id));
          params.set("displayName", user.full_name);
          params.set("isTeacher", "false");

          const redirectUrl = `${VROOM_APP_URL}/student?${params.toString()}`;
          console.log("[handleJoinOnlineLesson] Opening lesson in new tab:", redirectUrl);

          // Open in new tab to avoid replacing current page
          window.open(redirectUrl, "_blank", "noopener,noreferrer");
          return;
        } catch (joinError: any) {
          console.error("[handleJoinOnlineLesson] Failed to join lesson:", {
            error: joinError,
            message: joinError?.message,
            response: joinError?.response?.data
          });
          // Fallback to join page
        }
      } else {
        console.log("[handleJoinOnlineLesson] No active lesson found for group", {
          expectedGroupId,
          activeLessonsCount: activeLessons.length,
          hasUser: !!user?.id,
          hasDisplayName: !!user?.full_name
        });
      }

      // No active lesson or join failed - redirect to join page with user info pre-filled
      const params = new URLSearchParams();
      if (user?.id != null) params.set("userId", String(user.id));
      if (user?.full_name) params.set("displayName", user.full_name);
      if (lessonForGroup) params.set("lessonId", lessonForGroup.id);
      const url = `${VROOM_APP_URL}/join?${params.toString()}`;
      console.log("[handleJoinOnlineLesson] Redirecting to join page:", url);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error: any) {
      console.error("[handleJoinOnlineLesson] Error fetching active lessons:", {
        error,
        message: error?.message,
        response: error?.response?.data
      });
      // Fallback: redirect to join page with user info pre-filled
      const params = new URLSearchParams();
      if (user?.id != null) params.set("userId", String(user.id));
      if (user?.full_name) params.set("displayName", user.full_name);
      const url = `${VROOM_APP_URL}/join?${params.toString()}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setIsJoiningLesson(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Failed to load profile</h2>
        <p className="text-slate-500 mt-2">Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-row items-center gap-6">
        <Avatar className="w-24 h-24 border-4 border-white shadow-sm">
          <AvatarImage src={profile.avatar_url || ""} className="object-contain mix-blend-multiply" />
          <AvatarFallback className="bg-indigo-100 text-indigo-600 text-2xl font-bold">
            {profile.full_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">{getTimeBasedGreeting()}, {profile.full_name}!</h1>
          {!profile.group_name ? (
            <span className="text-sm font-medium text-slate-500">No level assigned</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.level && (
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm font-bold">
                  {profile.level}
                </span>
              )}
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-bold">
                {profile.group_name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Access Status */}
      <Card className={cn(
        "border-none shadow-sm",
        profile.status === "Active" ? "bg-green-50" : profile.status === "New" ? "bg-yellow-50" : "bg-red-50"
      )}>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className={cn(
              "font-bold",
              profile.status === "Active" ? "text-green-800" : profile.status === "New" ? "text-yellow-800" : "text-red-800"
            )}>
              {profile.status === "Active" ? "Account Active" : profile.status === "New" ? "Account New" : "Account Blocked"}
            </p>
            {!!profile.payment_expiry && (
              <p className={cn(
                "text-sm opacity-80",
                profile.status === "Active" ? "text-green-700" : profile.status === "New" ? "text-yellow-700" : "text-red-700"
              )}>
                Expires on {new Date(profile.payment_expiry).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-2xl",
            profile.status === "Active" ? "bg-green-100" : profile.status === "New" ? "bg-yellow-100" : "bg-red-100"
          )}>
            <div className={cn(
              "w-3 h-3 rounded-full",
              profile.status === "Active" ? "bg-green-500" : profile.status === "New" ? "bg-yellow-500" : "bg-red-500"
            )} />
          </div>
        </CardContent>
      </Card>

      {/* Teachers */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-indigo-600" size={24} />
          <h2 className="text-2xl font-bold text-slate-900">Your Teachers</h2>
        </div>
        {!profile.main_teacher && !profile.assistant_teacher ? (
          <Card className="border-slate-100 shadow-sm">
            <CardContent className="p-6">
              <p className="text-slate-400 italic text-center py-4">
                No teachers assigned yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.main_teacher && (
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                    {profile.main_teacher.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{profile.main_teacher}</p>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Main Teacher</p>
                  </div>
                </CardContent>
              </Card>
            )}
            {profile.assistant_teacher && (
              <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                    {profile.assistant_teacher.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{profile.assistant_teacher}</p>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Assistant Teacher</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Video Lessons — open vroom join page with student id/name prefilled */}
      <Button
        className="w-full bg-indigo-600 hover:bg-indigo-700 h-16 rounded-2xl text-lg font-bold shadow-md mb-4"
        onClick={handleOpenVideoLessons}
      >
        <ExternalLink className="mr-2" size={20} />
        Open Video Lessons
      </Button>

      {/* Join Online Lesson */}
      {IS_ONLINE_LESSON_ENABLED && (
        <Button
          className="w-full bg-green-600 hover:bg-green-700 h-16 rounded-2xl text-lg font-bold shadow-md"
          onClick={handleJoinOnlineLesson}
          disabled={isJoiningLesson || !profile?.group_name}
        >
          {isJoiningLesson ? (
            <>
              <Loader2 className="mr-2 animate-spin" size={20} />
              Joining...
            </>
          ) : (
            <>
              <Video className="mr-2" size={20} />
              Join Online Lesson
            </>
          )}
        </Button>
      )}
      <p className="text-slate-400 text-center text-sm mt-2">
        {profile?.group_name
          ? "Join your group's active online lesson"
          : "You need to be assigned to a group to join online lessons"}
      </p>
    </div>
  );
};
