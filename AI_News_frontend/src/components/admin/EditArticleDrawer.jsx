import React, { useEffect, useState } from "react";
import { X, Save, Loader2, List, Plus, Newspaper, Layout, ImageIcon, Search, Settings, Globe, FileText, Terminal, Hash } from "lucide-react";
import { getCategories } from "../../api/articles";

const EditArticleDrawer = ({ 
  isOpen, 
  article, 
  onClose, 
  onUpdate, 
  setArticle, 
  isSubmitting 
}) => {
  const [isManual, setIsManual] = useState(false);
  const [availableSilos, setAvailableSilos] = useState([]);
  const [loadingSilos, setLoadingSilos] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadSilos = async () => {
        setLoadingSilos(true);
        try {
          const silos = await getCategories(); // Uses your new backend endpoint
          setAvailableSilos(silos);
        } catch (err) {
          console.error("Failed to fetch silos:", err);
        } finally {
          setLoadingSilos(false);
        }
      };
      loadSilos();
    }
  }, [isOpen]);

  if (!isOpen || !article) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(e);
  };

  return (
    <div className="fixed inset-0 z-200 flex justify-end">
      {/* 1. STUDIO OVERLAY */}
      <div 
        className="absolute inset-0 bg-ink/40 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />
      
      {/* 2. DRAWER PANEL */}
      <div className="relative w-full sm:w-[90%] md:max-w-2xl bg-paper border-l border-border shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        
        {/* HEADER */}
        <div className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-surface/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-accent/10 text-accent rounded-xl">
              <Newspaper size={20} />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-ink">Edit Digital Asset</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-muted font-bold uppercase tracking-widest">System Object:</span>
                <code className="text-[9px] font-mono text-accent bg-accent/5 px-1.5 rounded">{article._id}</code>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 rounded-xl text-muted hover:bg-surface hover:text-ink transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12 pb-40">
          
          {/* CONTENT MODULE */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <Layout size={14} className="text-accent" />
              <h4 className="text-[10px] font-black text-ink uppercase tracking-[0.2em]">Neural Content Synthesis</h4>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Editorial Headline</label>
                <input 
                  type="text" 
                  value={article.title || ""} 
                  onChange={e => setArticle({...article, title: e.target.value})}
                  className="w-full p-5 bg-surface border border-border rounded-2xl focus:border-accent font-serif font-bold italic text-xl text-ink outline-none transition-all shadow-inner placeholder:opacity-20"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">AI Abstract (Deck)</label>
                <textarea 
                  rows="3"
                  value={article.summary || ""} 
                  onChange={e => setArticle({...article, summary: e.target.value})}
                  className="w-full p-5 bg-surface border border-border rounded-2xl focus:border-accent text-sm font-medium text-ink outline-none transition-all resize-none"
                  placeholder="Summary for landing cards..."
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest">Semantic Core (Markdown)</label>
                  <FileText size={12} className="text-muted/40" />
                </div>
                <textarea 
                  rows="14"
                  value={article.aiContent || ""} 
                  onChange={e => setArticle({...article, aiContent: e.target.value})}
                  className="w-full p-6 bg-surface border border-border rounded-2xl focus:border-accent text-sm leading-relaxed outline-none transition-all font-medium text-ink/80"
                />
              </div>
            </div>
          </section>

          {/* CLASSIFICATION MODULE */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <Globe size={14} className="text-accent" />
              <h4 className="text-[10px] font-black text-ink uppercase tracking-[0.2em]">Silo Designation</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest">Silo Target</label>
                  <button 
                    type="button" 
                    onClick={() => setIsManual(!isManual)}
                    className="text-[9px] font-black text-accent uppercase tracking-tighter hover:underline px-2 py-1 bg-accent/5 rounded-md"
                  >
                    {isManual ? "Switch to Registry" : "Manual Override"}
                  </button>
                </div>

                {isManual ? (
                  <input 
                    type="text"
                    placeholder="Custom category..."
                    value={article.category || ""}
                    onChange={(e) => setArticle({ ...article, category: e.target.value })}
                    className="w-full p-4 bg-paper border border-accent rounded-xl font-bold text-sm text-accent outline-none animate-in fade-in zoom-in-95"
                  />
                ) : (
                  <select 
                    value={article.category || ""}
                    onChange={(e) => {
                      const selectedSilo = availableSilos.find(s => s.name === e.target.value);
                      setArticle({ 
                        ...article, 
                        category: e.target.value,
                        categorySlug: selectedSilo ? selectedSilo.slug : article.categorySlug 
                      });
                    }}
                    className="w-full p-4 bg-surface border border-border rounded-xl font-bold text-ink outline-none appearance-none cursor-pointer focus:border-accent transition-all"
                  >
                    <option value="" disabled>Select Silo...</option>
                    {availableSilos.map((silo) => (
                      <option key={silo._id} value={silo.name}>{silo.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Route Slug</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={article.slug || ""} 
                    onChange={e => setArticle({...article, slug: e.target.value})}
                    className="w-full p-4 bg-surface/50 border border-border rounded-xl text-[11px] font-mono text-ink focus:border-accent outline-none"
                  />
                  <Terminal size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/30" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Global Meta Tags</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={article.seoKeywords ? article.seoKeywords.join(', ') : ""} 
                  onChange={e => {
                    const val = e.target.value;
                    setArticle({
                      ...article, 
                      seoKeywords: val ? val.split(',').map(s => s.trim()) : []
                    });
                  }}
                  className="w-full p-4 bg-surface border border-border rounded-xl text-[11px] font-mono text-ink focus:border-accent outline-none pl-10"
                  placeholder="tag_01, tag_02..."
                />
                <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" />
              </div>
            </div>
          </section>
          
          {/* MEDIA MODULE */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 border-b border-border pb-3">
               <ImageIcon size={14} className="text-accent" />
               <h4 className="text-[10px] font-black text-ink uppercase tracking-[0.2em]">Visual Assets</h4>
            </div>
            <div className="rounded-4xl border border-border bg-surface aspect-video overflow-hidden shadow-inner group relative">
              <img 
                src={article.bannerImage || "https://placehold.co/600x400?text=NO_IMAGE"} 
                alt="Preview" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-ink/20 to-transparent pointer-events-none" />
            </div>
            <input 
              type="text" 
              placeholder="Source Image URL..."
              value={article.bannerImage || ""} 
              onChange={e => setArticle({...article, bannerImage: e.target.value})}
              className="w-full p-4 bg-surface/50 border border-border rounded-xl text-[11px] font-mono text-ink focus:border-accent outline-none"
            />
          </section>

          {/* SECURITY & VISIBILITY - THEME ADAPTIVE REFACTOR */}
          <section className="bg-surface border border-border p-8 rounded-[2.5rem] shadow-sm space-y-6 relative overflow-hidden group">
            {/* Sublte background pulse for active states */}
            {article.isPurged && (
              <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
            )}

            <div className="flex items-center gap-3 border-b border-border pb-4 relative z-10">
              <div className={`p-2 rounded-lg transition-colors ${article.isPurged ? 'bg-red-500/20 text-red-500' : 'bg-accent/10 text-accent'}`}>
                <Settings size={14} />
              </div>
              <h4 className="text-[10px] font-black text-ink uppercase tracking-[0.3em]">
                Safety Protocol
              </h4>
            </div>

            <div 
              onClick={() => setArticle({...article, isPurged: !article.isPurged})}
              className="flex items-center gap-5 cursor-pointer relative z-10 select-none"
            >
              {/* High-Contrast Custom Toggle */}
              <div className={`
                w-12 h-6 rounded-full border-2 transition-all flex items-center px-1
                ${article.isPurged 
                  ? 'bg-red-500 border-red-500 shadow-lg shadow-red-500/20' 
                  : 'bg-muted/10 border-muted/20'
                }
              `}>
                <div className={`
                  w-3 h-3 rounded-full transition-all duration-300 transform
                  ${article.isPurged 
                    ? 'translate-x-6 bg-white' 
                    : 'translate-x-0 bg-muted/40'
                  }
                `} />
              </div>

              <div className="flex flex-col">
                <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${article.isPurged ? 'text-red-500' : 'text-ink'}`}>
                  {article.isPurged ? "Asset Decommissioned" : "Active Distribution"}
                </span>
                <span className="text-[9px] text-muted font-bold uppercase tracking-tighter mt-0.5 opacity-60">
                  Toggle to restrict public API availability
                </span>
              </div>
            </div>
          </section>
        </form>

        {/* FIXED FOOTER */}
        <div className="p-8 border-t border-border flex gap-4 bg-paper/80 backdrop-blur-md mt-auto  bottom-0 w-full z-20">
          <button 
            type="button"
            onClick={onClose}
            className="px-8 py-5 rounded-2xl border border-border font-black text-[10px] uppercase tracking-widest text-muted hover:text-ink hover:bg-surface transition-all active:scale-95"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-5 bg-ink dark:bg-accent text-white font-black text-[11px] uppercase tracking-[0.4em] rounded-2xl flex items-center justify-center gap-4 hover:brightness-110 shadow-xl shadow-accent/10 active:scale-[0.98] transition-all disabled:opacity-20"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSubmitting ? "Syncing Logic..." : "Sync Asset"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditArticleDrawer;