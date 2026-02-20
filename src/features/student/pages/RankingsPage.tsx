import { useState, useMemo } from "react";
import { useRankings, useProfile } from "../hooks/useStudent";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Loader2, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const RankingsPage = () => {
  const [activeArea, setActiveArea] = useState<"group" | "level" | "overall">("group");
  const user = useAuthStore((state) => state.user);
  const { data: profile } = useProfile();
  const { data: rankings, isLoading, error, refetch } = useRankings(activeArea);

  const userRank = useMemo(() => {
    if (!rankings || !user) return null;
    return rankings.find((r) => r.id === user.id)?.rank;
  }, [rankings, user]);

  const noGroupAssigned =
    (profile && !profile.group_name) ||
    (error && (error as any)?.response?.status === 403);

  const getAreaLabel = () => {
    if (activeArea === "group") return `Ranking within ${profile?.group_name || "your group"}`;
    if (activeArea === "level") return `Ranking within ${profile?.level || "your level"}`;
    return "Overall platform ranking";
  };

  if (user?.status === "Blocked") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
        <AlertCircle size={64} className="text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-slate-600 mt-4 max-w-md">
          Your account has been blocked. You cannot access rankings at this time.
        </p>
      </div>
    );
  }

  if (noGroupAssigned && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
        <div className="bg-amber-100 p-4 rounded-full mb-6">
          <Trophy size={48} className="text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Rankings not available</h2>
        <p className="text-slate-600 mt-3 max-w-md">
          You need to be assigned to a group to see rankings. Please contact your administrator or teacher.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-2xl">
            <Trophy size={28} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Rankings</h1>
            <p className="text-slate-500 font-medium">
              Your rank: {userRank ? `#${userRank}` : "Unranked"}
            </p>
          </div>
        </div>

        <Tabs
          value={activeArea}
          onValueChange={(v) => setActiveArea(v as any)}
          className="w-full md:w-auto"
        >
          <TabsList className="grid grid-cols-3 w-full md:w-[400px] h-12 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="group" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600">Group</TabsTrigger>
            <TabsTrigger value="level" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600">Level</TabsTrigger>
            <TabsTrigger value="overall" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600">Overall</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="bg-slate-100 rounded-xl px-4 py-3">
        <p className="text-slate-500 font-medium">{getAreaLabel()}</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-[40vh] text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Failed to load rankings</h2>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {rankings?.map((item) => {
            const isCurrentUser = item.id === user?.id;
            const getRankDisplay = () => {
              if (item.rank === 1) return <span className="text-xl">🥇</span>;
              if (item.rank === 2) return <span className="text-xl">🥈</span>;
              if (item.rank === 3) return <span className="text-xl">🥉</span>;
              return <span className="text-slate-400 font-bold">#{item.rank}</span>;
            };
            return (
              <div
                key={item.id}
                className={cn(
                  "flex flex-row items-center bg-white p-4 rounded-2xl border",
                  isCurrentUser ? "border-indigo-600 bg-indigo-50" : "border-slate-200"
                )}
              >
                <div className="w-10 flex items-center justify-center mr-2 shrink-0">
                  {getRankDisplay()}
                </div>
                <Avatar className="w-10 h-10 rounded-full shrink-0 border-2 border-white overflow-hidden">
                  <AvatarImage src={item.avatar_url || ""} className="object-cover" />
                  <AvatarFallback className={cn("font-bold text-xs", isCurrentUser ? "bg-indigo-200 text-indigo-800" : "bg-slate-100 text-slate-600")}>
                    {item.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className={cn("flex-1 font-bold truncate ml-4", isCurrentUser ? "text-indigo-600" : "text-slate-900")}>
                  {item.full_name}
                  {isCurrentUser ? " (You)" : ""}
                </span>
                <div className="flex items-baseline gap-1 shrink-0">
                  <span className="text-slate-900 font-bold text-lg">{item.total_points}</span>
                  <span className="text-slate-400 text-xs font-medium">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
