import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { MainLayout } from "./components/layout/MainLayout";
import { HomePage } from "./features/student/pages/HomePage";
import { AssignmentsPage } from "./features/student/pages/AssignmentsPage";
import { RankingsPage } from "./features/student/pages/RankingsPage";
import { ProfilePage } from "./features/student/pages/ProfilePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="rankings" element={<RankingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

export default App;
