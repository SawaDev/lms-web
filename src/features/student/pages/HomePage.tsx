import { useProfile } from "../hooks/useStudent";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCap, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const HomePage = () => {
  const { data: profile, isLoading, error } = useProfile();

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
          <h1 className="text-3xl font-bold text-slate-900">Hello, {profile.full_name.split(' ')[0]}!</h1>
          <div className="flex flex-wrap gap-2">
            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm font-bold">
              {profile.level}
            </span>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-bold">
              {profile.group_name}
            </span>
          </div>
        </div>
      </div>

      {/* Access Status */}
      <Card className={cn(
        "border-none shadow-sm",
        profile.status === "Active" ? "bg-green-50" : "bg-red-50"
      )}>
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className={cn(
              "font-bold",
              profile.status === "Active" ? "text-green-800" : "text-red-800"
            )}>
              {profile.status === "Active" ? "Account Active" : "Account Blocked"}
            </p>
            <p className={cn(
              "text-sm opacity-80",
              profile.status === "Active" ? "text-green-700" : "text-red-700"
            )}>
              {profile.payment_expiry ? `Expires on ${new Date(profile.payment_expiry).toLocaleDateString()}` : "No expiry set"}
            </p>
          </div>
          <div className={cn(
            "p-3 rounded-2xl",
            profile.status === "Active" ? "bg-green-100" : "bg-red-100"
          )}>
            <div className={cn(
              "w-3 h-3 rounded-full",
              profile.status === "Active" ? "bg-green-500" : "bg-red-500"
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
      </div>

      {/* Video Lessons */}
      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-16 rounded-2xl text-lg font-bold shadow-md">
        <ExternalLink className="mr-2" size={20} />
        Open Video Lessons
      </Button>
      <p className="text-slate-400 text-center text-sm">
        Lessons will open on an external platform
      </p>
    </div>
  );
};
