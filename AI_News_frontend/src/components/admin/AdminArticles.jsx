import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Filter, ArrowUpDown, Zap, Terminal, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import * as articleApi from "../../api/articles";
import EditArticleDrawer from "./EditArticleDrawer";
import CreateAIArticleModal from "./CreateAIArticleModal"; // Corrected typo
import ArticleTable from "./ArticleTable";

const ArticlesTab = ({ refreshParentStats }) => {
  // --- State ---
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [availableCategories, setAvailableCategories] = useState([]);

  // Modals/Drawers
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // --- Actions ---

  const fetchDashboardData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      let res;
      if (searchQuery) {
        res = await articleApi.searchArticles(searchQuery, page, 10);
      } else if (selectedCategory && selectedCategory !== "all") {
        res = await articleApi.getArticlesByCategory(selectedCategory, page, 10);
      } else {
        res = await articleApi.getArticles(page, 10);
      }
      setArticles(res.articles || []);
      setTotalPages(res.totalPages || 1);
      setTotalArticles(res.totalArticles || 0);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    fetchDashboardData(currentPage);
  }, [currentPage, fetchDashboardData]);

  // Load Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await articleApi.getCategories();
        setAvailableCategories(res || []);
      } catch (err) { console.error("Silo sync failed", err); }
    };
    fetchCats();
  }, []);

  // 1. CREATE HANDLER
  const handleCreateAI = async (formData, callback) => {
    try {
      setLoading(true);
      const response = await articleApi.createArticleAI(formData);
      if (response) {
        await fetchDashboardData(1);
        if (refreshParentStats) await refreshParentStats();
        if (callback) callback(); 
        setIsAIModalOpen(false);
        showToast("AI Synthesis Complete: Asset Created");
      }
    } catch (err) {
      showToast("Synthesis Failed: Check Pipeline", "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. UPDATE HANDLER
  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await articleApi.updateArticle(selectedArticle._id, selectedArticle);
      if (response) {
        await fetchDashboardData(currentPage);
        if (refreshParentStats) await refreshParentStats();
        setIsEditDrawerOpen(false);
        showToast("Database Synchronized: Asset Updated");
      }
    } catch (err) {
      showToast("Update Failed: Network Error", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("PERMANENT DESTRUCTION: Proceed?")) {
      try {
        await articleApi.deleteArticle(id);
        fetchDashboardData(currentPage);
        if (refreshParentStats) await refreshParentStats();
        showToast("Asset Purged from Repository", "success");
      } catch (err) {
        showToast("Purge Failed", "error");
      }
    }
  };

  return (
    <div className="relative space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* 1. STUDIO TOAST (Refined Floating Notification) */}
      {toast.show && (
        <div className={`fixed top-8 right-8 z-100 flex items-center gap-4 px-6 py-4 rounded-3xl border border-border backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-10 ${
          toast.type === 'success' ? 'bg-accent/90 text-white' : 'bg-red-500/90 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-[11px] font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      {/* 2. REFINED HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
        <div>
          <h1 className="text-5xl font-serif font-black tracking-tight italic text-ink mb-3">
            Article <span className="text-accent">Repository</span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">
              Active Neural Assets: {totalArticles.toString().padStart(4, '0')}
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsAIModalOpen(true)}
          className="group relative overflow-hidden bg-accent text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:shadow-[0_0_30px_-5px_var(--color-accent)] active:scale-95 flex items-center gap-3"
        >
          <Zap size={14} className="group-hover:fill-white transition-all" /> 
          Initiate Synthesis
        </button>
      </div>

      {/* 3. COMMAND BAR (Integrated Search & Filter) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search by keyword or ID..."
            className="w-full pl-14 pr-6 py-5 bg-paper border border-border rounded-3xl text-xs font-bold text-ink outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent transition-all uppercase placeholder:text-muted/40 shadow-sm shadow-black/5"
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
        
        <div className="lg:col-span-3 relative">
          <select 
            className="w-full bg-paper border border-border px-6 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest text-ink outline-none appearance-none cursor-pointer hover:bg-surface transition-colors shadow-sm shadow-black/5"
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">Global Archive</option>
            {availableCategories.map((cat) => (
              <option key={cat._id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
          <Filter className="absolute right-6 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={14} />
        </div>

        <button 
          onClick={() => setSort(sort === "latest" ? "oldest" : "latest")}
          className="lg:col-span-2 bg-paper border border-border px-4 py-5 rounded-3xl text-ink text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-surface transition-all shadow-sm shadow-black/5"
        >
          <ArrowUpDown size={14} className={sort === "latest" ? "text-accent" : "text-muted"} /> 
          {sort}
        </button>
      </div>

      {/* 4. DATA TABLE CONTAINER */}
      <div className="bg-paper border border-border rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5">
        <ArticleTable 
          articles={articles}
          loading={loading}
          onEdit={(article) => {
            setSelectedArticle(article);
            setIsEditDrawerOpen(true);
          }}
          onDelete={handleDelete}
        />
        
        {/* 5. MODERN PAGINATION */}
        <div className="px-10 py-8 bg-surface/50 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-paper rounded-xl border border-border shadow-sm">
              <Terminal size={14} className="text-accent" />
            </div>
            <span className="font-mono text-[11px] font-bold uppercase text-muted tracking-tight">
              Pointer: <span className="text-ink">{currentPage}</span> / {totalPages}
            </span>
          </div>

          <div className="flex gap-3">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)} 
              className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-border bg-paper text-[10px] font-black uppercase tracking-widest text-ink hover:bg-accent hover:text-white disabled:opacity-30 disabled:hover:bg-paper disabled:hover:text-ink transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft size={14} /> Back
            </button>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(p => p + 1)} 
              className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-border bg-paper text-[10px] font-black uppercase tracking-widest text-ink hover:bg-accent hover:text-white disabled:opacity-30 disabled:hover:bg-paper disabled:hover:text-ink transition-all shadow-sm active:scale-95"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* MODALS & DRAWERS */}
      <CreateAIArticleModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} onCreate={handleCreateAI} loading={loading} />
      {isEditDrawerOpen && selectedArticle && (
        <EditArticleDrawer isOpen={isEditDrawerOpen} article={selectedArticle} setArticle={setSelectedArticle} onClose={() => { setIsEditDrawerOpen(false); setSelectedArticle(null); }} onUpdate={handleUpdate} isSubmitting={isSubmitting} />
      )}
    </div>
  );
};

export default ArticlesTab;