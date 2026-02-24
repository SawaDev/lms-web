import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile, useStats, useAttendance, useUpdateAvatar } from "../hooks/useStudent";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, LogOut, Camera, Loader2, Users, GraduationCap, Phone, BookOpen, UserCheck } from "lucide-react";
import { AttendanceSection } from "../components/AttendanceSection";
import { getUploadUrl, uploadFileToS3 } from "../api/student";
import { toast } from "sonner";

export const ProfilePage = () => {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  const handleLogout = () => {
    queryClient.clear();
    logout();
  };
  const { data: stats, isLoading: isStatsLoading } = useStats();
  const { data: attendance } = useAttendance(10);
  const updateAvatarMutation = useUpdateAvatar();
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const extension = file.type.split("/")[1] || "jpg";
      const fileName = `avatar_${Date.now()}.${extension}`;

      const { uploadUrl, key } = await getUploadUrl(
        fileName,
        file.type,
        "avatars"
      );

      await uploadFileToS3(uploadUrl, file);
      await updateAvatarMutation.mutateAsync(key);

      toast.success("Profile photo updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (isProfileLoading || isStatsLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-[#4F46E5]" size={40} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-10">
      {/* Profile Header — match app: text-2xl name, Phone icon, green-50 status badge */}
      <div className="flex flex-col items-center pt-8 pb-6">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-white shadow-sm bg-indigo-100">
            <AvatarImage src={profile.avatar_url || ""} className="object-cover" />
            <AvatarFallback className="bg-indigo-100 text-[#4F46E5] text-4xl font-bold">
              {profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarSelect} />
          <Button
            size="icon"
            className="absolute bottom-0 right-0 h-9 w-9 rounded-full border-2 border-white shadow-sm bg-[#4F46E5] hover:bg-indigo-700"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="animate-spin text-white" size={18} /> : <Camera size={18} className="text-white" />}
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-4">{profile.full_name}</h1>
        <div className="flex items-center mt-1">
          <Phone size={14} className="text-[#64748B] mr-2 shrink-0" />
          <span className="text-slate-500 font-medium">{profile.phone_number}</span>
        </div>
        <div className="bg-green-50 px-4 py-1.5 rounded-full mt-3 border border-green-100">
          <span className={`text-sm font-bold ${profile.status === "Active" ? "text-green-600" : "text-red-600"}`}>
            {profile.status === "Active" ? "Access Active" : "Access Expired"}
          </span>
        </div>
      </div>

      {/* Info Section — Group, Main Teacher, Assistant (same as app) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <div className="flex flex-row items-center mb-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-4 shrink-0">
            <Users size={20} className="text-[#4F46E5]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Group</p>
            <p className="text-slate-900 font-bold text-lg">{profile.level || "Not assigned"}</p>
          </div>
        </div>
        <div className="flex flex-row items-center mb-4">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-4 shrink-0">
            <GraduationCap size={20} className="text-[#4F46E5]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Main Teacher</p>
            <p className="text-slate-900 font-bold text-lg">{profile.main_teacher || "None"}</p>
          </div>
        </div>
        <div className="flex flex-row items-center">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-4 shrink-0">
            <GraduationCap size={20} className="text-[#4F46E5]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Assistant Teacher</p>
            <p className="text-slate-900 font-bold text-lg">{profile.assistant_teacher || "None"}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid — match app: rounded-3xl p-5, text-2xl font-bold, text-xs font-bold */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center">
          <Trophy size={24} className="text-[#4F46E5]" />
          <p className="text-slate-900 text-2xl font-bold mt-2">#{stats?.group_rank || "-"}</p>
          <p className="text-slate-400 text-xs font-bold">Group Rank</p>
        </div>
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center">
          <Calendar size={24} className="text-[#4F46E5]" />
          <p className="text-slate-900 text-2xl font-bold mt-2">{stats?.total_points}</p>
          <p className="text-slate-400 text-xs font-bold">Total Pts</p>
        </div>
      </div>

      {/* Access Expires On — match app: green-50, text-2xl font-black */}
      <div className="bg-green-50 p-5 rounded-3xl border border-green-100">
        <p className="text-green-800 font-bold">Access Expires On</p>
        <p className="text-green-600 text-2xl font-black mt-1">
          {profile.payment_expiry ? new Date(profile.payment_expiry).toISOString().split("T")[0] : "Not Set"}
        </p>
      </div>

      {/* Your Scores — match app ScoresSection */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center mb-6">
          <Trophy size={20} className="text-[#4F46E5] mr-2" />
          <h2 className="text-slate-900 text-xl font-bold">Your Scores</h2>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-center">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-4 shrink-0">
              <BookOpen size={18} className="text-[#4F46E5]" />
            </div>
            <span className="flex-1 text-slate-600 font-bold">Assignments</span>
            <span className="text-slate-900 font-black text-lg">{stats?.average_assignment_score ?? 0}</span>
          </div>
          <div className="flex flex-row items-center">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-4 shrink-0">
              <Users size={18} className="text-[#4F46E5]" />
            </div>
            <span className="flex-1 text-slate-600 font-bold">Participation</span>
            <span className="text-slate-900 font-black text-lg">{stats?.total_lessons_attended ?? 0}</span>
          </div>
          <div className="flex flex-row items-center">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-4 shrink-0">
              <UserCheck size={18} className="text-[#4F46E5]" />
            </div>
            <span className="flex-1 text-slate-600 font-bold">Attendance</span>
            <span className="text-slate-900 font-black text-lg">{stats?.attendance_rate ?? 0}</span>
          </div>
          <div className="h-px bg-slate-100 my-2" />
          <div className="flex flex-row items-center">
            <span className="flex-1 text-slate-900 text-lg font-black">Total Score</span>
            <span className="text-[#4F46E5] text-2xl font-black">{profile.total_points}</span>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="space-y-4">
        <AttendanceSection 
          attendance={attendance} 
          attendanceRate={stats?.attendance_rate || 0} 
        />
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full flex flex-row items-center justify-center p-5 rounded-3xl bg-slate-100 hover:bg-slate-200 transition-colors"
      >
        <LogOut size={20} className="text-red-500" />
        <span className="text-red-500 font-bold text-lg ml-2">Log Out</span>
      </button>
    </div>
  );
};
