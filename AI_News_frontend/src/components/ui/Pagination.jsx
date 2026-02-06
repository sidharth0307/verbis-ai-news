import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const Pagination = ({ page, totalPages, onPageChange }) => {
  const getPages = () => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, page + 2);

    if (page <= 3) {
      start = 1;
      end = Math.min(totalPages, maxVisible);
    }

    if (page >= totalPages - 2) {
      start = Math.max(1, totalPages - maxVisible + 1);
      end = totalPages;
    }

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  if (totalPages <= 1) return null;

  const baseBtnClass = `
  relative h-16 flex items-center justify-center transition-all duration-300
  font-black text-lg tracking-tighter
  disabled:opacity-10 disabled:cursor-not-allowed
`;

const formatNum = (n) => (n < 10 ? `0${n}` : n);

return (
  <div className="mt-32 mb-20 flex flex-col items-center w-full">
    {/* 1. Large Visual Progress (Optional but helpful) */}
    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-4">
      Section Sequence
    </div>

    <div className="flex items-center justify-center w-full max-w-2xl border-y border-slate-900 py-2">
      
      {/* PREVIOUS - Large Hit Area */}
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="h-20 px-8 flex items-center gap-3 group text-slate-900 hover:text-blue-600 disabled:text-slate-200 transition-colors"
      >
        <span className="text-2xl group-hover:-translate-x-2 transition-transform italic">←</span>
        <span className="text-xs font-black uppercase tracking-widest hidden md:inline">Prev</span>
      </button>

      {/* NUMBERS - Massive & Clear */}
      <div className="flex-1 flex items-center justify-center gap-2 md:gap-4 border-x border-slate-100 px-4">
        {page > 2 && (
          <button
            onClick={() => onPageChange(1)}
            className="w-12 h-12 text-slate-300 hover:text-slate-900 font-serif italic text-xl"
          >
            01
          </button>
        )}

        {/* Dynamic Window */}
        <div className="flex items-center gap-1 md:gap-2">
          {getPages().map((p) => {
            const isActive = p === page;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`
                  w-14 h-14 md:w-16 md:h-16 flex items-center justify-center transition-all duration-500
                  ${isActive 
                    ? "bg-slate-900 text-white scale-110 shadow-xl" 
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                  }
                `}
              >
                <span className="text-2xl font-black">{formatNum(p)}</span>
              </button>
            );
          })}
        </div>

        {page < totalPages - 1 && (
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-12 h-12 text-slate-300 hover:text-slate-900 font-serif italic text-xl"
          >
            {formatNum(totalPages)}
          </button>
        )}
      </div>

      {/* NEXT - Large Hit Area */}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="h-20 px-8 flex items-center gap-3 group text-slate-900 hover:text-blue-600 disabled:text-slate-200 transition-colors"
      >
        <span className="text-xs font-black uppercase tracking-widest hidden md:inline">Next</span>
        <span className="text-2xl group-hover:translate-x-2 transition-transform italic">→</span>
      </button>
    </div>

    {/* Footer Status */}
    <div className="mt-10 flex flex-col items-center gap-2">
       <p className="text-slate-400 text-sm font-medium italic">
         Currently viewing {page} of {totalPages}
       </p>
       <div className="flex gap-1">
         {[...Array(totalPages)].map((_, i) => (
           <div 
             key={i} 
             className={`h-1 transition-all duration-500 ${i + 1 === page ? "w-8 bg-blue-600" : "w-2 bg-slate-100"}`} 
           />
         ))}
       </div>
    </div>
  </div>
);
};

export default Pagination;