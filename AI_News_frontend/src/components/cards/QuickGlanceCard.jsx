import { ArrowRight } from "lucide-react";

const QuickGlanceCard = ({ label, title, onClick }) => (
  <div
    onClick={onClick}
    className="
      group cursor-pointer
      border-b border-slate-100 pb-4 last:border-0
      transition-all duration-200
    "
  >
    {/* Label with a small accent pipe */}
    <div className="flex items-center gap-2 mb-2">
      <div className="h-3 w-0.5 bg-blue-600" />
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">
        {label}
      </span>
    </div>

    {/* Title - Clean and Bold */}
    <div className="flex justify-between items-start gap-3">
      <p className="text-sm font-bold leading-snug text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 font-sans">
        {title || "No recent updates"}
      </p>
      
      {/* Subtle Arrow on hover */}
      <ArrowRight 
        size={14} 
        className="shrink-0 mt-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-600" 
      />
    </div>
  </div>
);

export default QuickGlanceCard;