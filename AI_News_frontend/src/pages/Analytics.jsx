import React, { useState, useEffect } from "react";
import { Activity, ShieldCheck, Terminal, Layers, Clock, RotateCw, Menu } from "lucide-react";

import StatsGrid from "../components/admin/StatsGrid";
import IngestionStatus from "../components/admin/InjestionStatus";
import CategoryChart from "../components/admin/CategoryChart";
import { settingsApi } from "../api/settings";
import SettingsForm from "../components/admin/Settings";
import Sidebar from "../components/admin/AdminSidebar";
import ArticlesTab from "../components/admin/AdminArticles";
import InjectionSchedule from "../components/admin/InjectionSchedule";
import SystemSettings from "../components/admin/AdminSettings";
import CategoryManager from "../components/admin/CategoryManager";
import UsersTab from "../components/admin/UsersTab";

import { useTheme } from "../context/ThemeContext";

import categoryApi from "../api/categories";

const Analytics = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emptyCategories, setEmptyCategories] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Use Global Theme Context to ensure consistency with index.html/root
  const { isDark, toggleTheme } = useTheme();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsRes, settingsRes, emptyRes] = await Promise.all([
        settingsApi.getAnalytics(),
        settingsApi.getSettings(),
        categoryApi.getEmpty()
      ]);

      if (statsRes.success) {
        setData({
          ...statsRes.data,
          config: settingsRes.data || settingsRes
        });
      }
      setEmptyCategories(emptyRes || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [activeTab]);

  const sidebarCounts = {
    ingestion: data?.ingestion?.activeRulesCount || data?.ingestion?.rules?.length || 0,
    content: data?.content?.today || 0
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white font-mono text-[10px] uppercase tracking-[0.3em] text-blue-600">
      <Activity className="mr-3 h-4 w-4 animate-spin" />
      Syncing...
    </div>
  );

  return (
  <div className={`admin-theme ${isDark ? 'dark' : ''} flex h-screen overflow-hidden selection:bg-accent/20 transition-colors duration-300`}>

    {/* --- SIDEBAR WITH MOBILE RESPONSIVENESS --- */}
    <div className={`
      fixed inset-0 z-[100] lg:relative lg:z-0 lg:flex
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      transition-transform duration-300 ease-in-out
    `}>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-ink/40 backdrop-blur-sm lg:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
      
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false); // Close sidebar on mobile after selection
        }}
        counts={sidebarCounts}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />
    </div>

    {/* --- MAIN CONTENT --- */}
    <main className="flex-1 overflow-y-auto bg-surface relative transition-colors duration-300">

      {/* Header with Mobile Toggle */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-paper/80 backdrop-blur-md border-b border-border px-6 lg:px-10 py-5">
        <div className="flex items-center gap-4 lg:gap-5">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-ink hover:bg-accent/10 rounded-xl transition-colors"
          >
            <Menu size={24} />
          </button>

          <div className="bg-accent/10 p-2.5 rounded-xl text-accent hidden sm:block">
            <Terminal size={20} />
          </div>
          <div>
            <h2 className="font-serif text-2xl lg:text-3xl font-black capitalize tracking-tight leading-none text-ink mb-1">
              {activeTab.replace("-", " ")}
            </h2>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Node Status: Operational</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-surface border border-border rounded-2xl mr-2">
            <Clock size={14} className="text-muted" />
            <div className="text-left">
              <p className="text-[8px] font-black uppercase tracking-tighter text-muted leading-none">Last Sync</p>
              <p className="font-mono text-[10px] font-bold text-ink">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          <button
            onClick={fetchStats}
            className="group flex items-center gap-2 bg-accent hover:bg-accent/90 text-white px-4 lg:px-5 py-2.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-accent/20 active:scale-95"
          >
            <RotateCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      {/* Responsive Padding */}
      <div className="p-6 lg:p-10 max-w-400 mx-auto">
        {/* ... Rest of your content routing (Overview, Content, etc.) remains unchanged ... */}
        {activeTab === "overview" && data && (
          <div className="space-y-12 lg:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="flex items-center gap-3">
               <div className="h-px w-8 bg-accent/30" />
               <Layers size={14} className="text-accent" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Real-time Analytics</span>
             </div>
             <div className="transition-all">
               <StatsGrid data={data} />
             </div>
             <CategoryChart distribution={data?.content?.contentWeighting || []} />
             <IngestionStatus rules={data?.ingestion?.rules || []} emptyCategories={emptyCategories} />
          </div>
        )}
        
        <div className="animate-in fade-in duration-500">
          {activeTab === "content" && <ArticlesTab refreshParentStats={fetchStats} />}
          {activeTab === "categories" && <CategoryManager />}
          {activeTab === "ingestion" && <InjectionSchedule emptyCategories={emptyCategories} />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "cron-settings" && (
            <div className="max-w-3xl bg-paper rounded-[2.5rem] border border-border p-10 shadow-sm shadow-black/5">
              <h2 className="mb-8 font-serif text-3xl font-black text-ink">Cron Configuration</h2>
              <SettingsForm currentSettings={data?.config} onUpdate={fetchStats} />
            </div>
          )}
          {activeTab === "system-settings" && <SystemSettings />}
        </div>
      </div>
    </main>
  </div>
);
};

export default Analytics;