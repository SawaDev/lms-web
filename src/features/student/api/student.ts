import apiClient from "@/api/api-client";
import axios from "axios";

export interface StudentProfile {
  full_name: string;
  phone_number: string;
  email: string | null;
  avatar_url: string | null;
  status: string;
  level: string | null;
  group_id: number | null;
  group_name: string | null;
  main_teacher: string | null;
  assistant_teacher: string | null;
  total_points: number;
  payment_expiry: string | null;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  due_date: string;
  image_url: string | null;
  file_url: string | null;
  status: "not submitted" | "submitted" | "graded";
  grade: number | null;
}

export interface SubmissionData {
  assignment_id: number;
  submission_content: string;
  submission_file_url?: string | null;
  submission_image_url?: string | null;
}

export interface UploadResponse {
  uploadUrl: string;
  key: string;
}

export interface RankingItem {
  id: number;
  rank: number;
  avatar_url: string | null;
  full_name: string;
  total_points: number;
}

export interface StudentStats {
  group_rank: number;
  attendance_rate: number;
  total_lessons_attended: number;
  average_assignment_score: number;
  total_points: number;
}

export interface AttendanceItem {
  class_date: string;
  is_present: boolean;
}

export const getProfile = async (): Promise<StudentProfile> => {
  const response = await apiClient.get<StudentProfile>('/user/profile');
  return response.data;
};

export const getStats = async (): Promise<StudentStats> => {
  const response = await apiClient.get<StudentStats>('/user/stats');
  return response.data;
};

export const getAttendance = async (limit?: number): Promise<AttendanceItem[]> => {
  const response = await apiClient.get<AttendanceItem[]>('/user/attendance', {
    params: { limit },
  });
  return response.data;
};

export const updateAvatar = async (avatarUrl: string): Promise<{ message: string }> => {
  const response = await apiClient.put('/user/avatar', { avatar_url: avatarUrl });
  return response.data;
};

export const getAssignments = async (): Promise<Assignment[]> => {
  const response = await apiClient.get<Assignment[]>('/user/assignments');
  return response.data;
};

export const getRankings = async (area: 'group' | 'level' | 'overall'): Promise<RankingItem[]> => {
  const response = await apiClient.get<RankingItem[]>('/user/rankings', {
    params: { area },
  });
  return response.data;
};

export const getUploadUrl = async (fileName: string, fileType: string, folder: string = "submissions"): Promise<UploadResponse> => {
  const response = await apiClient.post<UploadResponse>('/content/upload-url', {
    fileName,
    fileType,
    folder,
  });
  return response.data;
};

export const uploadFileToS3 = async (uploadUrl: string, file: File): Promise<void> => {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
  });
};

export const submitAssignment = async (data: SubmissionData): Promise<{ message: string }> => {
  const response = await apiClient.post('/user/assignments/submit', data);
  return response.data;
};

export const downloadFile = async (fileUrl: string, fileName: string): Promise<void> => {
  const response = await axios.get(fileUrl, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export interface ActiveLesson {
  id: string;
  groupId: string;
  livekitRoomName: string;
  status: string;
  startedAt: string;
}

export interface JoinLessonResponse {
  token: string;
  livekitUrl: string;
  lessonId: string;
}

export const getActiveLessons = async (): Promise<ActiveLesson[]> => {
  const response = await apiClient.get<ActiveLesson[]>('/user/lessons/active');
  return response.data;
};

export const joinOnlineLesson = async (lessonId: string): Promise<JoinLessonResponse> => {
  const response = await apiClient.post<JoinLessonResponse>(`/user/lessons/${lessonId}/join`);
  return response.data;
};
