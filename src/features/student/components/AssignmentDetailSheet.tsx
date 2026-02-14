import { useState, useRef } from "react";
import { Assignment, downloadFile } from "../api/student";
import { Button } from "@/components/ui/button";
import {
  X,
  CheckCircle2,
  Image as ImageIcon,
  File,
  Send,
  Download,
  Maximize2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface AssignmentDetailSheetProps {
  assignment: Assignment;
  responseContent: string;
  setResponseContent: (text: string) => void;
  selectedImage: string | null;
  setSelectedImage: (uri: string | null) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  isUploading: boolean;
  onSubmit: () => void;
}

export const AssignmentDetailSheet: React.FC<AssignmentDetailSheetProps> = ({
  assignment,
  responseContent,
  setResponseContent,
  selectedImage,
  setSelectedImage,
  selectedFile,
  setSelectedFile,
  isUploading,
  onSubmit,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "graded":
        return "bg-green-100 text-green-700";
      case "submitted":
        return "bg-slate-100 text-slate-600";
      case "not submitted":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const handleDownloadFile = async (fileUrl: string) => {
    if (!fileUrl) return;

    try {
      setIsDownloading(true);
      const fileName = fileUrl.split("/").pop() || `assignment_file_${assignment.id}`;
      await downloadFile(fileUrl, fileName);
      toast.success("File downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
      <SheetHeader className="mb-6">
        <SheetTitle className="text-xl font-bold text-slate-900">
          {assignment.title}
        </SheetTitle>
        <div className="flex items-center mt-2">
          <div
            className={`px-3 py-1 rounded-full mr-3 ${
              getStatusColor(assignment.status).split(" ")[0]
            }`}
          >
            <span
              className={`text-xs font-bold uppercase ${
                getStatusColor(assignment.status).split(" ")[1]
              }`}
            >
              {assignment.status}
            </span>
          </div>
          <span className="text-slate-400 font-medium text-sm">
            Due: {new Date(assignment.due_date).toLocaleDateString()}
          </span>
        </div>
      </SheetHeader>

      <div className="space-y-6 pb-10">
        <div>
          <h3 className="text-slate-900 font-bold text-lg mb-2">Instructions</h3>
          <p className="text-slate-500 leading-6">{assignment.description}</p>
        </div>

        {(assignment.image_url || assignment.file_url) && (
          <div>
            <h3 className="text-slate-900 font-bold text-lg mb-3">Attachments</h3>
            <div className="flex flex-col gap-3">
              {assignment.image_url && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center mb-3">
                    <ImageIcon size={20} className="text-indigo-600" />
                    <span className="ml-2 font-bold text-slate-900 flex-1">
                      Assignment Image
                    </span>
                  </div>
                  <div className="relative w-full h-48 rounded-xl overflow-hidden mb-3">
                    <img
                      src={assignment.image_url}
                      alt="Assignment"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <a
                    href={assignment.image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center bg-indigo-50 p-3 rounded-xl hover:bg-indigo-100 transition-colors"
                  >
                    <Maximize2 size={18} className="text-indigo-600" />
                    <span className="ml-2 font-bold text-indigo-600">
                      View Full Size
                    </span>
                  </a>
                </div>
              )}
              {assignment.file_url && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <File size={20} className="text-indigo-600" />
                      <span className="ml-2 font-bold text-slate-900 flex-1">
                        Assignment File
                      </span>
                    </div>
                    <Button
                      onClick={() => handleDownloadFile(assignment.file_url!)}
                      disabled={isDownloading}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isDownloading ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <>
                          <Download size={18} className="mr-2" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {assignment.status.toLowerCase() === "not submitted" && (
          <div className="flex-1">
            <h3 className="text-slate-900 font-bold text-lg mb-3">Your Response</h3>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 text-base mb-6 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your response here..."
              value={responseContent}
              onChange={(e) => setResponseContent(e.target.value)}
              disabled={isUploading}
            />

            {(selectedImage || selectedFile) && (
              <div className="mb-6 flex flex-col gap-3">
                <h4 className="text-slate-900 font-bold text-base mb-2">
                  Your Attachments
                </h4>
                {selectedImage && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-slate-900">Selected Image</span>
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="bg-red-50 p-1.5 rounded-full hover:bg-red-100 transition-colors"
                      >
                        <X size={16} className="text-red-500" />
                      </button>
                    </div>
                    <div className="relative w-full h-64 rounded-xl overflow-hidden mb-3">
                      <img
                        src={selectedImage}
                        alt="Selected"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                {selectedFile && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <File size={20} className="text-indigo-600" />
                        <span className="ml-3 text-slate-700 font-medium flex-1 truncate">
                          {selectedFile.name}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="bg-red-50 p-1.5 rounded-full ml-2 hover:bg-red-100 transition-colors"
                      >
                        <X size={18} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 mb-6">
              <input
                type="file"
                ref={imageInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
              />
              
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center bg-white border border-slate-200 p-4 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <ImageIcon size={20} className="text-slate-500" />
                <span className="ml-2 font-bold text-slate-700">Image</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center bg-white border border-slate-200 p-4 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <File size={20} className="text-slate-500" />
                <span className="ml-2 font-bold text-slate-700">File</span>
              </button>
            </div>

            <Button
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-lg font-bold"
              onClick={onSubmit}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Send size={20} className="mr-2" />
                  Submit Assignment
                </>
              )}
            </Button>
          </div>
        )}

        {assignment.status.toLowerCase() !== "not submitted" && (
          <div className="bg-indigo-50 p-4 rounded-3xl border border-indigo-100 mt-auto flex items-center">
            <CheckCircle2 size={24} className="text-indigo-600 mr-3" />
            <div className="ml-2">
              <p className="text-indigo-900 font-bold">Assignment Submitted</p>
              <p className="text-indigo-700 text-sm opacity-80">
                {assignment.status.toLowerCase() === "graded"
                  ? `Grade: ${assignment.grade}%`
                  : "Waiting for teacher to grade"}
              </p>
            </div>
          </div>
        )}
      </div>
    </SheetContent>
  );
};
