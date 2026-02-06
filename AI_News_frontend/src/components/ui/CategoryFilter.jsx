import React, { useEffect, useState } from "react";
import { ChevronRight, LayoutGrid, Hash } from "lucide-react";
import categoryApi from "../../api/categories";

const CategoryFilter = ({ activeCategory, onChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getActive();
        // Updated: The API now returns an array of Silo objects [{ name, slug, ... }]
        if (Array.isArray(response)) {
          setCategories(response);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Category fetch error:", err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const CategoryPill = ({ label, isActive, onClick, Icon }) => (
    <button
      onClick={onClick}
      className={`
        group flex items-center gap-2 px-3 py-2.5 transition-all duration-200 border
        ${isActive
          ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-blue-500/10"
          : "bg-white border-slate-100 text-slate-500 hover:border-blue-600 hover:text-blue-600"}
      `}
    >
      <Icon
        size={12}
        className={isActive ? "text-blue-400" : "text-slate-300 group-hover:text-blue-600"}
      />
      <span className="text-[9px] font-black uppercase tracking-widest truncate">
        {label}
      </span>
    </button>
  );

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex flex-wrap gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-slate-50 animate-pulse rounded-full border border-slate-100" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-4">
          {/* 1. ALL STORIES - Distinct Styling */}
          <button
            onClick={() => onChange("All")}
            className={`group relative flex items-center gap-2 px-6 py-2.5 transition-all duration-500 ${activeCategory === "All" || !activeCategory
                ? "text-white"
                : "text-slate-400 hover:text-slate-900"
              }`}
          >
            {/* Animated Background for Active State */}
            {(activeCategory === "All" || !activeCategory) && (
              <div className="absolute inset-0 bg-slate-900 rounded-full z-0 layout-transition" />
            )}

            <LayoutGrid size={14} className="relative z-10 group-hover:rotate-90 transition-transform duration-500" />
            <span className="relative z-10 text-[11px] font-black uppercase tracking-widest">
              All Stories
            </span>
          </button>

          {/* Vertical Divider Line */}
          <div className="h-4 w-px bg-slate-200 mx-2 hidden sm:block" />

          {/* 2. DYNAMIC CATEGORIES */}
          {categories.map((silo) => {
            const isActive = activeCategory === silo.slug;
            return (
              <button
                key={silo._id || silo.slug}
                onClick={() => onChange(silo.slug)}
                className={`group relative flex items-center gap-3 px-2 py-1 transition-all duration-300`}
              >
                {/* The "Indicator Dot" */}
                <div className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${isActive ? "bg-blue-600 scale-125 shadow-[0_0_8px_rgba(37,99,235,0.6)]" : "bg-slate-200 group-hover:bg-slate-400"
                  }`} />

                <div className="flex flex-col items-start">
                  <span className={`text-[11px] font-bold uppercase tracking-tighter transition-colors ${isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
                    }`}>
                    {silo.name}
                  </span>

                  {/* Underline reveal on hover or active */}
                  <div className={`h-[2px] bg-blue-600 transition-all duration-500 ${isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`} />
                </div>

                {/* Optional: Add a tiny number or "silo" tag if available */}
                <span className={`text-[8px] font-black font-mono transition-opacity ${isActive ? "opacity-100 text-blue-600" : "opacity-0 group-hover:opacity-40"
                  }`}>
                  /0{categories.indexOf(silo) + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;