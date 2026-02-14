import React, { useState } from "react";
import { useAssignments, useSubmitAssignment } from "../hooks/useStudent";
import { Assignment, getUploadUrl, uploadFileToS3 } from "../api/student";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Calendar, ChevronRight, Loader2, AlertCircle, Ban, CalendarX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useProfile } from "../hooks/useStudent";
import { Sheet } from "@/components/ui/sheet";
import { AssignmentDetailSheet } from "../components/AssignmentDetailSheet";
import { toast } from "sonner";

export const AssignmentsPage = () => {
  const { data: assignments, isLoading, error } = useAssignments();
  const { data: profile } = useProfile();
  const user = useAuthStore((state) => state.user);
  const submitMutation = useSubmitAssignment();

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [responseContent, setResponseContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isPaymentExpired = () => {
    if (!profile?.payment_expiry) return false;
    const expiryDate = new Date(profile.payment_expiry);
    const now = new Date();
    return expiryDate < now;
  };

  const isBlocked = user?.status === "Blocked" || isPaymentExpired();

  const handleAssignmentPress = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setResponseContent("");
    setSelectedImage(null);
    setSelectedFile(null);
    setIsSheetOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) return;
    if (!responseContent.trim() && !selectedImage && !selectedFile) {
      toast.error("Please provide some content or attach a file.");
      return;
    }

    try {
      setIsUploading(true);
      let imageUrl = null;
      let fileUrl = null;

      if (selectedImage) {
        // We need to convert dataURL back to File for upload if we want to use the same logic
        // But for S3 presigned URL we usually upload the blob
        // Here we'll simplify and assume we upload whatever we have
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const file = new File([blob], `img_${Date.now()}.jpg`, { type: "image/jpeg" });
        
        const { uploadUrl, key } = await getUploadUrl(file.name, file.type);
        await uploadFileToS3(uploadUrl, file);
        imageUrl = key;
      }

      if (selectedFile) {
        const { uploadUrl, key } = await getUploadUrl(selectedFile.name, selectedFile.type);
        await uploadFileToS3(uploadUrl, selectedFile);
        fileUrl = key;
      }

      await submitMutation.mutateAsync({
        assignment_id: selectedAssignment.id,
        submission_content: responseContent,
        submission_image_url: imageUrl,
        submission_file_url: fileUrl,
      });

      toast.success("Assignment submitted successfully!");
      setIsSheetOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit assignment. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Failed to load assignments</h2>
        <p className="text-slate-500 mt-2">Please check your connection and try again.</p>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
        <div className="bg-red-50 p-6 rounded-full mb-6">
          {user?.status === "Blocked" ? (
            <Ban size={64} className="text-red-500" />
          ) : (
            <CalendarX size={64} className="text-orange-500" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          {user?.status === "Blocked" ? "Access Restricted" : "Payment Expired"}
        </h2>
        <p className="text-slate-600 mt-4 max-w-md">
          {user?.status === "Blocked"
            ? "Your account has been blocked. You cannot access assignments at this time."
            : "Your payment has expired. Please renew your subscription to access assignments."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="bg-indigo-100 p-3 rounded-2xl">
          <FileText size={28} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Assignments</h1>
          <p className="text-slate-500 font-medium">{assignments?.length || 0} tasks available</p>
        </div>
      </div>

      {assignments?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[40vh] text-center">
          <FileText size={64} className="text-slate-200 mb-4" />
          <h2 className="text-xl font-bold text-slate-400">No Assignments Yet</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments?.map((assignment) => (
            <Card 
              key={assignment.id} 
              className="border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => handleAssignmentPress(assignment)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    assignment.status === "graded" ? "bg-green-100 text-green-700" :
                    assignment.status === "submitted" ? "bg-slate-100 text-slate-600" :
                    "bg-orange-100 text-orange-700"
                  )}>
                    {assignment.status}
                  </div>
                  <div className="flex items-center text-slate-400 text-xs font-bold">
                    <Calendar size={14} className="mr-1" />
                    {new Date(assignment.due_date).toLocaleDateString()}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {assignment.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                  {assignment.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                   {assignment.status === "graded" ? (
                     <div className="text-indigo-600 font-black text-xl">
                       {assignment.grade}%
                     </div>
                   ) : (
                     <div className="text-slate-300 text-sm font-bold">
                       Not graded
                     </div>
                   )}
                   <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-indigo-50 transition-colors">
                     <ChevronRight size={20} className="text-slate-400 group-hover:text-indigo-600" />
                   </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        {selectedAssignment && (
          <AssignmentDetailSheet
            assignment={selectedAssignment}
            responseContent={responseContent}
            setResponseContent={setResponseContent}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            isUploading={isUploading}
            onSubmit={handleSubmit}
          />
        )}
      </Sheet>
    </div>
  );
};
