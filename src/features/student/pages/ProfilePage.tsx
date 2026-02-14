import { useRef, useState } from "react";
import { useProfile, useStats, useAttendance, useUpdateAvatar } from "../hooks/useStudent";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, LogOut, Camera, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AttendanceSection } from "../components/AttendanceSection";
import { getUploadUrl, uploadFileToS3 } from "../api/student";
import { toast } from "sonner";

export const ProfilePage = () => {
  const logout = useAuthStore((state) => state.logout);
  const { data: profile, isLoading: isProfileLoading } = useProfile();
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
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <Avatar className="w-32 h-32 border-4 border-white shadow-md">
            <AvatarImage src={profile.avatar_url || ""} className="object-contain mix-blend-multiply" />
            <AvatarFallback className="bg-indigo-100 text-indigo-600 text-4xl font-bold">
              {profile.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleAvatarSelect}
          />
          
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-0 right-0 rounded-full shadow-md border-2 border-white hover:bg-slate-100"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="animate-spin text-indigo-600" size={18} />
            ) : (
              <Camera size={18} className="text-slate-700" />
            )}
          </Button>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{profile.full_name}</h1>
          <p className="text-slate-500 font-medium">{profile.phone_number}</p>
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-black uppercase">
            {profile.status}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="bg-indigo-50 p-3 rounded-2xl mb-3">
              <Trophy size={24} className="text-indigo-600" />
            </div>
            <p className="text-3xl font-black text-slate-900">#{stats?.group_rank || "-"}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Group Rank</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="bg-indigo-50 p-3 rounded-2xl mb-3">
              <Calendar size={24} className="text-indigo-600" />
            </div>
            <p className="text-3xl font-black text-slate-900">{stats?.total_points}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Points</p>
          </CardContent>
        </Card>
      </div>

      {/* Expiry */}
      <Card className="bg-green-50 border-none shadow-sm">
        <CardContent className="p-6">
          <p className="text-green-800 font-bold">Access Expires On</p>
          <p className="text-3xl font-black text-green-600 mt-1">
            {profile.payment_expiry
              ? new Date(profile.payment_expiry).toLocaleDateString()
              : "Not Set"}
          </p>
        </CardContent>
      </Card>

      {/* Performance */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Performance</h2>
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-500">Assignment Score</span>
                <span className="text-slate-900">{stats?.average_assignment_score || 0}%</span>
              </div>
              <Progress value={stats?.average_assignment_score || 0} className="h-2 bg-slate-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-500">Attendance Rate</span>
                <span className="text-slate-900">{stats?.attendance_rate || 0}%</span>
              </div>
              <Progress value={stats?.attendance_rate || 0} className="h-2 bg-slate-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance */}
      <div className="space-y-4">
        <AttendanceSection 
          attendance={attendance} 
          attendanceRate={stats?.attendance_rate || 0} 
        />
      </div>

      <Button
        variant="destructive"
        className="w-full h-14 rounded-2xl font-bold text-lg"
        onClick={logout}
      >
        <LogOut className="mr-2" size={20} />
        Log Out
      </Button>
    </div>
  );
};
