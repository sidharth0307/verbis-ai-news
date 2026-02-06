import React, { useEffect, useState } from "react";
import { X, Zap, Globe, Loader2, Link as LinkIcon, Database, Terminal, Type } from "lucide-react";
import { getCategories } from "../../api/articles";

const CreateAIArticleModal = ({ isOpen, onClose, onCreate, loading }) => {
  const initialForm = { 
    title: "", 
    content: "", 
    url: "", 
    sourceName: "", 
    sourceUrl: "", 
    category: "" 
  };

  const [formData, setFormData] = useState(initialForm);
  const [availableSilos, setAvailableSilos] = useState([]); 
  const [fetchingCats, setFetchingCats] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadSilos = async () => {
        setFetchingCats(true);
        try {
          const silos = await getCategories(); // Fetches [{name, slug}, ...]
          setAvailableSilos(silos);
          // Auto-select first silo if available
          if (silos.length > 0) setFormData(prev => ({ ...prev, category: silos[0].name }));
        } catch (err) {
          console.error("Failed to fetch silos:", err);
        } finally {
          setFetchingCats(false);
        }
      };
      loadSilos();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData, () => {
      setFormData(initialForm);
      setIsManual(false);
    }); 
  };

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* MAIN CONTAINER */}
      <div className="bg-paper border border-border w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="p-8 border-b border-border flex justify-between items-center bg-surface/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent text-white rounded-2xl shadow-lg shadow-accent/20">
              <Zap size={22} fill="currentColor" strokeWidth={0} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tighter text-ink italic">New Intelligence Entry</h3>
              <p className="text-[10px] text-muted font-bold uppercase tracking-[0.2em] mt-0.5">Database Write Protocol</p>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 custom-scrollbar">
          
          {/* PRIMARY CONTENT BLOCK */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <Type size={14} className="text-accent" />
              <label className="text-[10px] font-black text-ink uppercase tracking-[0.2em]">Core Content</label>
            </div>
            
            <input 
              required
              type="text" 
              placeholder="ARTICLE HEADLINE"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full p-5 bg-surface border border-border rounded-2xl font-serif font-bold italic text-xl text-ink outline-none focus:border-accent transition-all placeholder:opacity-20"
            />
            
            <textarea 
              required
              placeholder="RAW SOURCE CONTENT..."
              rows="5"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              className="w-full p-5 bg-surface border border-border rounded-2xl text-sm font-medium text-ink outline-none focus:border-accent transition-all resize-none h-40"
            />
          </div>

          {/* CLASSIFICATION & SOURCE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <LinkIcon size={14} className="text-accent" />
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest">Source Origin</label>
                </div>
                <input 
                    required
                    type="url" 
                    placeholder="https://source-node.com/id_01"
                    value={formData.url}
                    onChange={e => setFormData({...formData, url: e.target.value})}
                    className="w-full p-4 bg-surface/50 border border-border rounded-xl text-[11px] font-mono text-ink outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Database size={14} className="text-accent" />
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest">Intelligence Silo</label>
                </div>
                <div className="relative">
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    disabled={fetchingCats}
                    className="w-full p-4 bg-surface border border-border rounded-xl font-bold text-ink text-sm outline-none appearance-none cursor-pointer focus:border-accent disabled:opacity-30"
                  >
                    <option value="">Select Silo...</option>
                    {availableSilos.map((silo) => (
                      <option key={silo._id} value={silo.name}>{silo.name.toUpperCase()}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted/50">
                    <Globe size={16} />
                  </div>
                </div>
              </div>
          </div>

          {/* ATTRIBUTION DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Agency/Publisher</label>
                <div className="relative">
                  <input 
                      type="text" 
                      placeholder="e.g. REUTERS"
                      value={formData.sourceName}
                      onChange={e => setFormData({...formData, sourceName: e.target.value})}
                      className="w-full p-4 bg-surface border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-ink outline-none focus:border-accent"
                  />
                  <Terminal size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/20" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Attribution Link</label>
                <input 
                    type="url" 
                    placeholder="https://reuters.com"
                    value={formData.sourceUrl}
                    onChange={e => setFormData({...formData, sourceUrl: e.target.value})}
                    className="w-full p-4 bg-surface border border-border rounded-xl text-[11px] font-mono text-ink outline-none focus:border-accent"
                />
              </div>
          </div>
        </form>

        {/* ACTION FOOTER */}
        <div className="p-8 border-t border-border flex gap-4 bg-surface/30 backdrop-blur-sm">
          <button 
            type="button"
            onClick={onClose}
            className="px-8 py-5 rounded-2xl border border-border font-black text-[10px] uppercase tracking-widest text-muted hover:text-ink hover:bg-surface transition-all active:scale-95"
          >
            Abort
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-5 bg-ink dark:bg-accent text-white font-black text-[11px] uppercase tracking-[0.4em] rounded-2xl flex items-center justify-center gap-4 hover:brightness-110 shadow-xl shadow-accent/10 active:scale-[0.98] transition-all disabled:opacity-20"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" strokeWidth={0} />}
            {loading ? "Initializing..." : "Commit Article"}
          </button>
        </div>
      </div>
    </div>
  );
};
export default CreateAIArticleModal;