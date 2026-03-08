import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import moment from "moment";
import {
  LayoutDashboard, Database, FileSearch, ShieldCheck, BarChart3,
  FileText, Users, Activity, Settings, LogOut, ChevronDown,
  Bell, Sparkles, Scale, Building2, Menu, X as XIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { LanguageContext, translations } from "@/components/LanguageContext";

const NAV_ITEMS = [
  { name: "Dashboard",   icon: LayoutDashboard, page: "Dashboard" },
  { name: "Datasets",    icon: Database,        page: "Datasets" },
  { name: "Metadata",    icon: FileSearch,      page: "Metadata" },
  { name: "Data Quality",icon: ShieldCheck,     page: "DataQuality" },
  { name: "Insights",    icon: BarChart3,       page: "Insights" },
  { name: "Governance",  icon: Scale,           page: "Governance" },
  { name: "Reports",     icon: FileText,        page: "Reports" },
  { name: "Activity Log",icon: Activity,        page: "ActivityLog" },
  { name: "Admin",       icon: Users,           page: "Admin",       adminOnly: true },
  { name: "Org Settings",icon: Building2,       page: "OrgSettings", adminOnly: true },
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser]       = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const t = translations.en;
  const navigate = useNavigate();

  useEffect(() => { 
    base44.auth.me()
      .then(u => {
        setUser(u);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        base44.auth.redirectToLogin(createPageUrl("Dashboard"));
      });
  }, [currentPageName]);
  
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-slate-400">Loading...</div></div>;

  const isAdmin = user?.role === "admin";
  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <LanguageContext.Provider value={{ lang: "en", t }}>
      <div className="min-h-screen bg-slate-50 flex">
      <style>{`
        :root { --bmdata-primary:#1e293b; --bmdata-accent:#0d9488; }
        .sidebar-blur { backdrop-filter: blur(20px); }
      `}</style>



      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside className={`fixed top-0 left-0 z-50 h-screen w-64 bg-gradient-to-b from-[#0c1628] to-[#111a2e] text-white flex flex-col border-r border-white/5 transition-transform duration-300 lg:translate-x-0 lg:sticky ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>

        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-900/60 flex-shrink-0">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">DataHarbor</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">{t["Enterprise Platform"]}</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 pb-3 pt-2">{t.Navigation}</p>
          {NAV_ITEMS.filter(item => !item.adminOnly || isAdmin).map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setSidebarOpen(false)}
                className={`nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-teal-500/20 text-teal-300 shadow-sm border-l-2 border-teal-400"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-teal-300" : ""}`} />
                <span className="flex-1">{t[item.name] || item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User block */}
        {user && (
          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 transition-colors cursor-default">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0 flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.full_name || "User"}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.role === "admin" ? t.Administrator : t.Member}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">

        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/60 px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-500 hover:text-slate-800 h-9 w-9"
              onClick={() => setSidebarOpen(prev => !prev)}
            >
              {sidebarOpen ? <XIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t[NAV_ITEMS.find(i => i.page === currentPageName)?.name] || currentPageName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-700 h-9 w-9">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-slate-800 h-8 px-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-[10px] font-bold text-white">
                    {initials}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{user?.full_name?.split(" ")[0] || "User"}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-slate-800">{user?.full_name || "User"}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(createPageUrl("Profile"))}>
                  <Settings className="w-4 h-4 me-2 text-slate-400" /> {t["Profile Settings"]}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => base44.auth.logout()} className="text-red-600 focus:text-red-600">
                  <LogOut className="w-4 h-4 me-2" /> {t["Sign Out"]}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 bg-gradient-to-b from-slate-50 to-white">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-100 px-8 py-4 bg-white">
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            <span className="font-medium">DataHarbor</span> · Enterprise Data Management Platform
          </p>
        </footer>
      </div>
      </div>
    </LanguageContext.Provider>
  );
}