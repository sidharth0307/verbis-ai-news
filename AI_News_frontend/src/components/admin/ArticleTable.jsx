import React from "react";
import { Edit3, Trash2, Loader2, ExternalLink, ShieldAlert, Cpu } from "lucide-react";

const ArticleTable = ({ articles, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center bg-white border-b-2 border-slate-900">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Synchronizing Asset Ledger...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="py-32 text-center bg-white border-b-2 border-slate-900 border-dashed">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">No intelligence assets found in this cluster.</p>
      </div>
    );
  }

  return (
    <div className="bg-paper overflow-hidden transition-colors duration-300">
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left border-collapse min-w-225">
          <thead>
            <tr className="bg-surface/50 border-b border-border sticky top-0 z-20">
              <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Asset Identity</th>
              <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Taxonomy</th>
              <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.2em]">Temporal Signature</th>
              <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.2em] text-right">Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {articles.map((article) => (
              <tr key={article._id} className="hover:bg-surface transition-all group">
                {/* ASSET IDENTITY */}
                <td className="px-8 py-6">
                  <div className="flex items-center gap-5">
                    <div className="relative w-14 h-14 shrink-0 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                      <img 
                        src={article.bannerImage || "https://via.placeholder.com/100"} 
                        alt="" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=VOID"; }}
                      />
                      {article.isPurged && (
                        <div className="absolute inset-0 bg-red-500/30 backdrop-blur-[2px] flex items-center justify-center">
                          <ShieldAlert size={18} className="text-white drop-shadow-md" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 max-w-md">
                      <p className="font-serif font-black text-ink group-hover:text-accent transition-colors line-clamp-1 italic text-base leading-tight">
                        {article.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-mono font-bold text-muted/60 truncate max-w-37.5">
                          ID: {article.slug}
                        </span>
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-1 rounded-md bg-accent/5 text-accent hover:bg-accent hover:text-white transition-all"
                        >
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>
                </td>

                {/* TAXONOMY */}
                <td className="px-8 py-6">
                  <div className="inline-flex items-center rounded-full bg-surface border border-border px-3 py-1 gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-ink">
                      {article.category || "General"}
                    </span>
                  </div>
                  <p className="text-[9px] font-mono text-muted mt-2 uppercase font-bold tracking-tighter flex items-center gap-1">
                    <Cpu size={10} /> {article.modelUsed || "V-Core 4.0"}
                  </p>
                </td>

                {/* TEMPORAL SIGNATURE */}
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <p className="font-mono text-xs font-bold text-ink">
                      {new Date(article.createdAt).toLocaleDateString('en-GB').replace(/\//g, '.')}
                    </p>
                    <p className="font-mono text-[10px] font-bold text-muted/50 uppercase tracking-tighter">
                      STAMP: {new Date(article.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </p>
                  </div>
                </td>

                {/* CONTROL OPERATIONS */}
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button 
                      onClick={() => onEdit(article)}
                      className="p-3 rounded-xl bg-paper border border-border text-ink hover:border-accent hover:text-accent transition-all shadow-sm"
                      title="Refine Asset"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(article._id)}
                      className="p-3 rounded-xl bg-paper border border-border text-red-400 hover:border-red-500 hover:text-red-500 transition-all shadow-sm"
                      title="Decommission"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArticleTable;