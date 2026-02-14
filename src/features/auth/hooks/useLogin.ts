import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/api/api-client";
import { useAuthStore, User } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

interface LoginResponse {
  user: User;
  token: string;
}

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<LoginResponse>("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      navigate("/");
    },
  });
};
