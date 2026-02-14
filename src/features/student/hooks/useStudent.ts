import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as studentApi from "../api/student";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: studentApi.getProfile,
  });
};

export const useStats = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: studentApi.getStats,
  });
};

export const useAttendance = (limit?: number) => {
  return useQuery({
    queryKey: ["attendance", limit],
    queryFn: () => studentApi.getAttendance(limit),
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentApi.updateAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useAssignments = () => {
  return useQuery({
    queryKey: ["assignments"],
    queryFn: studentApi.getAssignments,
  });
};

export const useRankings = (area: "group" | "level" | "overall") => {
  return useQuery({
    queryKey: ["rankings", area],
    queryFn: () => studentApi.getRankings(area),
  });
};

export const useSubmitAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentApi.submitAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
  });
};
