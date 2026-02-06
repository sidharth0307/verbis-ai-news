import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getMe } from "../api/auth";
import { saveArticle } from "../api/articles";
import { Mail, Calendar, Heart, Trash2, Check, X, Bookmark, Hash, ArrowUpRight } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("saved");
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    const loadProfile = async () => {
      try {
        const data = await getMe();
        setUser(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    loadProfile();
  }, [navigate]);

  // Ensure management mode closes if user switches tabs
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsManageMode(false);
    setSelectedIds([]);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === user.savedArticles.length) setSelectedIds([]);
    else setSelectedIds(user.savedArticles.map(a => a._id));
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Permanently remove ${selectedIds.length} items from your library?`)) return;
    try {
      await Promise.all(selectedIds.map(id => saveArticle(id)));
      setUser(prev => ({
        ...prev,
        savedArticles: prev.savedArticles.filter(a => !selectedIds.includes(a._id))
      }));
      setSelectedIds([]);
      setIsManageMode(false);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center font-serif italic text-slate-400 uppercase tracking-widest text-xs">Authenticating...</div>;

  const currentArticles = activeTab === "saved" ? user?.savedArticles : user?.likedArticles;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* 1. EDITORIAL HEADER */}
      <header className="border-b-2 border-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-20 flex flex-col md:flex-row gap-12 items-center">
          <div className="h-32 w-32 bg-slate-900 text-white flex items-center justify-center text-6xl font-serif italic shrink-0">
            {user.name?.charAt(0)}
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
              <Hash size={12} /> {user.role} Member
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-6 uppercase">
              {user.name}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-2 text-slate-900 font-black"><Mail size={14} /> {user.email}</span>
              <span className="flex items-center gap-2 italic">Active since {new Date(user.createdAt).getFullYear()}</span>
            </div>
          </div>
          
          {/* MANAGEMENT TOGGLE: Only visible when "Library" is active */}
          <div className="shrink-0 flex flex-col gap-4 w-full md:w-auto">
             {activeTab === "saved" && user.savedArticles?.length > 0 && (
               <button 
                onClick={() => { setIsManageMode(!isManageMode); setSelectedIds([]); }}
                className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                  isManageMode ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-slate-900 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {isManageMode ? "Cancel Curation" : "Manage Library"}
              </button>
             )}
          </div>
        </div>
      </header>

      {/* 2. STICKY NAV BAR */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between h-16">
          <div className="flex gap-10">
            {[
              { id: "saved", label: "Saved Articles", icon: Bookmark, count: user.savedArticles?.length },
              { id: "liked", label: "Liked Articles", icon: Heart, count: user.likedArticles?.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 h-16 border-b-2 transition-all text-[11px] font-black uppercase tracking-widest ${
                  activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-900"
                }`}
              >
                <tab.icon size={14} /> {tab.label} <span className="ml-1 text-[9px] opacity-60">[{tab.count || 0}]</span>
              </button>
            ))}
          </div>
          
          {/* BULK ACTIONS: Scoped to Manage Mode */}
          {isManageMode && activeTab === "saved" && (
            <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right-4">
               <button onClick={handleSelectAll} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">
                {selectedIds.length === user.savedArticles.length ? "Clear Selection" : "Select All"}
              </button>
              <button 
                onClick={handleBulkDelete} 
                disabled={selectedIds.length === 0}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 disabled:opacity-20 text-[9px] font-black uppercase tracking-widest"
              >
                <Trash2 size={12} /> Delete ({selectedIds.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. THE ARCHIVE GRID */}
      <main className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        <div className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {currentArticles?.map((article) => {
            const isSelected = selectedIds.includes(article._id);
            return (
              <div 
                key={article._id} 
                className={`group relative flex flex-col ${isManageMode ? 'cursor-pointer' : ''}`}
                onClick={() => isManageMode && toggleSelect(article._id)}
              >
                {/* Selection Square (Library Only) */}
                {isManageMode && (
                  <div className={`absolute top-4 left-4 z-30 h-8 w-8 border-2 flex items-center justify-center transition-all ${
                    isSelected ? "bg-blue-600 border-blue-600 text-white shadow-xl" : "bg-white/90 border-slate-300"
                  }`}>
                    {isSelected && <Check size={18} strokeWidth={3} />}
                  </div>
                )}

                <div className={`space-y-5 transition-all duration-500 ${isManageMode && !isSelected ? "opacity-30 grayscale" : "opacity-100"}`}>
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                    <img 
                      src={article.bannerImage} 
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {!isManageMode && (
                      <div className="absolute top-4 right-4 bg-white/90 p-2 opacity-0 group-hover:opacity-100 transition-all">
                        <ArrowUpRight size={18} className="text-slate-900" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                        {article.category}
                      </span>
                      <div className="h-1 w-1 rounded-full bg-slate-200" />
                      <span className="text-[10px] font-bold text-slate-300 uppercase italic">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-bold leading-tight group-hover:text-blue-600 transition-colors">
                      {isManageMode ? article.title : (
                        <Link to={`/${article.categorySlug}/${article.slug}`}>
                          {article.title}
                        </Link>
                      )}
                    </h3>

                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">
                      {article.summary}
                    </p>

                    <div className="pt-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {article.source?.name || article.source}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {currentArticles?.length === 0 && (
          <div className="py-40 text-center border-t border-slate-100">
            <p className="font-serif italic text-slate-300 text-2xl tracking-tight">Empty Archive.</p>
          </div>
        )}
      </main>
    </div>
  );
}