import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Database, Activity, BarChart3, AlertTriangle } from "lucide-react";
import { useLang } from "@/components/LanguageContext";
import AdminStats from "../components/admin/AdminStats";
import UserManagement from "../components/admin/UserManagement";
import AdminDatasets from "../components/admin/AdminDatasets";
import AdminActivity from "../components/admin/AdminActivity";
import PlatformStats from "../components/admin/PlatformStats";
import PoorQualityReview from "../components/admin/PoorQualityReview";

export default function Admin() {
  const { t } = useLang();
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => { base44.auth.me().then(setCurrentUser).catch(() => {}); }, []);

  const isAdmin = currentUser?.role === "admin";

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list("-created_date", 200),
    enabled: isAdmin,
  });
  const { data: datasets = [] } = useQuery({
    queryKey: ["datasets-admin"],
    queryFn: () => base44.entities.Dataset.list("-created_date", 500),
    enabled: isAdmin,
  });
  const { data: quality = [] } = useQuery({
    queryKey: ["quality-admin"],
    queryFn: () => base44.entities.QualityResult.list("-created_date", 500),
    enabled: isAdmin,
  });
  const { data: activities = [] } = useQuery({
    queryKey: ["activities-admin"],
    queryFn: () => base44.entities.ActivityLog.list("-created_date", 200),
    enabled: isAdmin,
  });

  if (currentUser && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">{t["Access Restricted"]}</h2>
        <p className="text-sm text-slate-500 mt-2">{t["Admin privileges are required to view this page."]}</p>
      </div>
    );
  }

  const avgQuality = quality.length > 0
    ? Math.round(quality.reduce((s, q) => s + q.quality_score, 0) / quality.length)
    : 0;
  const goodPct = quality.length > 0
    ? Math.round((quality.filter(q => q.quality_status === "Good").length / quality.length) * 100)
    : 0;
  const poorCount = quality.filter(q => q.quality_status === "Poor Quality" || q.quality_status === "Needs Review").length;

  const stats = {
    users: users.length,
    datasets: datasets.length,
    avgQuality,
    activities: activities.length,
    goodQuality: goodPct,
    poorQuality: poorCount,
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-800 to-violet-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{backgroundImage:"radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize:"40px 40px"}} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-violet-300" />
            <span className="text-xs font-semibold text-violet-300 uppercase tracking-widest">Platform Administration</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{t["Admin Panel"]}</h1>
          <p className="text-sm text-slate-300 mt-1">{t["Platform management and monitoring"]}</p>
        </div>
      </div>

      <AdminStats stats={stats} />

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-white border border-slate-200 h-10 p-1">
          <TabsTrigger value="users"   className="gap-1.5 text-xs"><Users className="w-3.5 h-3.5" />{t["Users"]}</TabsTrigger>
          <TabsTrigger value="datasets" className="gap-1.5 text-xs"><Database className="w-3.5 h-3.5" />{t["Datasets"]}</TabsTrigger>
          <TabsTrigger value="quality" className="gap-1.5 text-xs"><AlertTriangle className="w-3.5 h-3.5" />{t["Quality Issues"]}</TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5 text-xs"><Activity className="w-3.5 h-3.5" />{t["Activity"]}</TabsTrigger>
          <TabsTrigger value="stats"   className="gap-1.5 text-xs"><BarChart3 className="w-3.5 h-3.5" />{t["Statistics"]}</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement users={users} loading={loadingUsers} currentUserId={currentUser?.id} />
        </TabsContent>

        <TabsContent value="datasets">
          <AdminDatasets datasets={datasets} qualityResults={quality} />
        </TabsContent>

        <TabsContent value="quality">
          <PoorQualityReview qualityResults={quality} />
        </TabsContent>

        <TabsContent value="activity">
          <AdminActivity activities={activities} />
        </TabsContent>

        <TabsContent value="stats">
          <PlatformStats datasets={datasets} qualityResults={quality} users={users} />
        </TabsContent>
      </Tabs>
    </div>
  );
}