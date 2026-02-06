import { useEffect, useState, useRef } from "react";
import { Loader2, Search, X } from "lucide-react";
import { useHomeState } from "../../context/HomeStateContext";

export default function SearchInput() {
  const [query, setQuery] = useState("");
  const { setPage, setIsSearchMode, setSearchQuery } = useHomeState();
  const [loading, setLoading] = useState(false);
  
  // Track if this is the initial mount to prevent triggering search on load
  const isInitialMount = useRef(true);

  useEffect(() => {
    // If user clears the input, immediately exit search mode
    if (query.trim() === "" && !isInitialMount.current) {
      setIsSearchMode(false);
      setSearchQuery("");
      setLoading(false);
      return;
    }

    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setLoading(true);
    
    const delayDebounceFn = setTimeout(() => {
      const trimmedQuery = query.trim();

      if (trimmedQuery.length >= 2) { // Only search if 2+ characters
        setSearchQuery(trimmedQuery);
        setIsSearchMode(true);
        setPage(1);
      } else if (trimmedQuery.length === 0) {
        setIsSearchMode(false);
        setSearchQuery("");
      }
      setLoading(false);
    }, 600); // Slightly longer debounce for better Redis performance

    return () => clearTimeout(delayDebounceFn);
  }, [query, setSearchQuery, setIsSearchMode, setPage]);

  const handleClear = () => {
    setQuery("");
    setIsSearchMode(false);
    setSearchQuery("");
    setPage(1);
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="relative flex items-center w-full max-w-xl group"
    >
      {/* Search Icon / Loader */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center pl-3 pointer-events-none">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        ) : (
          <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        )}
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search the archive..."
        className="
          w-full 
          bg-white 
          border-b-2 border-slate-100 
          focus:border-blue-600 
          pl-10 pr-12 py-3 
          text-sm font-medium text-slate-900 
          placeholder:text-slate-400 placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest
          outline-none 
          transition-all duration-300
        "
      />

      {/* Action Indicators */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center pr-2 gap-2">
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-slate-300 hover:text-slate-900 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        
        {/* Typographic Status Label */}
        <div className={`hidden sm:block overflow-hidden transition-all duration-300 ${loading ? 'w-16 opacity-100' : 'w-0 opacity-0'}`}>
          <span className="text-[9px] font-black uppercase tracking-tighter text-blue-600 whitespace-nowrap">
            Scanning
          </span>
        </div>
      </div>
    </form>
  );
}