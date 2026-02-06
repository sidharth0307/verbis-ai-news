import React from 'react';
import { Tag, ChevronDown, Database } from 'lucide-react';

const CategoryInput = ({ categories, value, onChange, disabled }) => {
  return (
    <div className="space-y-3 group animate-in fade-in duration-500">
      {/* HEADER & LABEL */}
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-black uppercase text-muted tracking-[0.2em] flex items-center gap-2">
          <Tag size={12} className="text-accent" /> 
          Silo Classification
        </label>
        
        {/* Registry Status Indicator */}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[9px] font-bold text-accent uppercase tracking-tighter">
            Verified Registry
          </span>
        </div>
      </div>

      {/* SELECT FIELD */}
      <div className="relative overflow-hidden rounded-2xl">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full bg-surface border border-border rounded-2xl px-5 py-4 
            text-sm font-bold text-ink outline-none appearance-none 
            cursor-pointer transition-all duration-300
            hover:border-accent/40 focus:border-accent focus:ring-4 focus:ring-accent/5
            disabled:opacity-40 disabled:cursor-not-allowed
            ${!value ? 'text-muted/50' : 'text-ink'}
          `}
        >
          <option value="" className="bg-paper text-muted">-- UNASSIGNED --</option>
          {categories.map((cat, idx) => (
            <option 
              key={idx} 
              value={cat.name || cat} 
              className="bg-paper text-ink font-bold py-2"
            >
              {(cat.name || cat).toUpperCase()}
            </option>
          ))}
        </select>
        
        {/* CUSTOM DROPDOWN ICON */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-3 border-l border-border pl-4">
          <Database size={14} className="text-muted/30" />
          <ChevronDown 
            size={18} 
            className={`text-accent transition-transform duration-300 ${disabled ? 'opacity-0' : 'opacity-100'}`} 
          />
        </div>

        {/* BOTTOM GLOW EFFECT */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* FOOTER HINT */}
      <p className="text-[9px] font-medium text-muted/60 uppercase tracking-widest ml-1">
        Select a secure intelligence silo for data partitioning
      </p>
    </div>
  );
};

export default CategoryInput;