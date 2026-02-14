import { useState, useMemo } from "react";
import { useRankings, useProfile } from "../hooks/useStudent";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Loader2, AlertCircle, Medal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const RankingsPage = () => {
  const [activeArea, setActiveArea] = useState<"group" | "level" | "overall">("group");
  const user = useAuthStore((state) => state.user);
  const { data: profile } = useProfile();
  const { data: rankings, isLoading, error } = useRankings(activeArea);

  const userRank = useMemo(() => {
    if (!rankings || !user) return null;
    return rankings.find((r) => r.id === user.id)?.rank;
  }, [rankings, user]);

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

      <div className="bg-slate-100 rounded-2xl px-6 py-4">
        <p className="text-slate-500 font-bold text-sm">
          {activeArea === "group" ? `Ranking within ${profile?.group_name || "your group"}` :
           activeArea === "level" ? `Ranking within ${profile?.level || "your level"}` :
           "Overall platform ranking"}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[40vh]">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-[40vh] text-center">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Failed to load rankings</h2>
        </div>
      ) : (
        <div className="space-y-3">
          {rankings?.map((item) => (
            <Card
              key={item.id}
              className={cn(
                "border-none shadow-sm transition-all",
                item.id === user?.id ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "bg-white"
              )}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg",
                    item.rank === 1 ? "bg-yellow-100 text-yellow-600" :
                    item.rank === 2 ? "bg-slate-100 text-slate-500" :
                    item.rank === 3 ? "bg-orange-100 text-orange-600" :
                    item.id === user?.id ? "bg-indigo-500 text-white" : "bg-slate-50 text-slate-400"
                  )}>
                    {item.rank <= 3 ? <Medal size={20} /> : item.rank}
                  </div>
                  <Avatar className="w-12 h-12 border-2 border-white">
                    <AvatarImage src={item.avatar_url || ""} className="object-contain bg-white" />
                    <AvatarFallback className={cn(
                      "font-bold",
                      item.id === user?.id ? "bg-indigo-400 text-white" : "bg-indigo-50 text-indigo-600"
                    )}>
                      {item.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">{item.full_name}</p>
                    <p className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      item.id === user?.id ? "text-indigo-200" : "text-slate-400"
                    )}>Student</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black">{item.total_points}</p>
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-tighter",
                    item.id === user?.id ? "text-indigo-200" : "text-slate-400"
                  )}>Total Points</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
