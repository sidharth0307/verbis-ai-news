import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Newspaper, Search, Globe, ChevronLeft, ChevronRight, Zap, Sparkles } from "lucide-react";

import ArticleCard from "../components/cards/ArticleCard";
import CategoryFilter from "../components/ui/CategoryFilter";
import QuickGlanceCard from "../components/cards/QuickGlanceCard";
import Pagination from "../components/ui/Pagination";

import { getArticles, getArticlesByCategory, searchArticles } from "../api/articles";
import { useHomeState } from "../context/HomeStateContext";
import { getQuickGlanceData } from "../utils/quickGlance";
import { getUserInteractions } from "../api/auth";
import SearchInput from "../components/ui/SearchInput";
import Newsletter from "../components/ui/NewsLetterBox";

export default function Home() {
  const navigate = useNavigate();
  const {
    articles, setArticles, // Global "All" articles
    page, setPage,
    totalPages, setTotalPages,
    activeCategory, setActiveCategory,
    isSearchMode, setIsSearchMode,
    searchQuery,
  } = useHomeState();

  // New state specifically for the filtered "Journal" section
  const [journalArticles, setJournalArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeHero, setActiveHero] = useState(0);
  const [siloIndex, setSiloIndex] = useState(0);

  // 1. Initial Load: Get the global content for Hero/Silo (Always "All" content)
  useEffect(() => {
    const fetchGlobal = async () => {
      const res = await getArticles(1, 15);
      if (res?.articles) setArticles(res.articles);
    };
    if (articles.length === 0) fetchGlobal();
  }, []);

  // 2. Journal-Specific Load: This handles Search and Categories
  const loadJournal = useCallback(async () => {
    setLoading(true);
    try {
      const fetchApi = isSearchMode && searchQuery.trim()
        ? searchArticles(searchQuery.trim(), page, 8)
        : (activeCategory && activeCategory !== "All")
          ? getArticlesByCategory(activeCategory, page, 8)
          : getArticles(page, 8);

      // 1. Always fetch the articles (Public)
      const res = await fetchApi;

      // 2. Only fetch interactions if a token exists (Private)
      let interactions = { likedArticleIds: [], savedArticleIds: [] };
      const token = localStorage.getItem("token"); // Or however you store your auth

      if (token) {
        try {
          interactions = await getUserInteractions();
        } catch (err) {
          console.warn("Guest mode: Could not fetch interactions.");
        }
      }

      if (res?.articles) {
        const hydrated = res.articles.map(art => ({
          ...art,
          isLiked: interactions.likedArticleIds.some(id => id.toString() === art._id.toString()),
          isSaved: interactions.savedArticleIds.some(id => id.toString() === art._id.toString())
        }));
        setJournalArticles(hydrated);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error("Journal Load Error:", err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, page, isSearchMode, searchQuery, setTotalPages]);

  useEffect(() => { loadJournal(); }, [loadJournal]);

  // --- Fixed Data Slices (Always from Global 'articles') ---
  const heroItems = articles.slice(0, 3);
  const flashItems = articles.slice(3, 7);
  const siloItems = articles.slice(7, 15);
  const quickGlance = getQuickGlanceData(articles, activeCategory);

  const itemsPerPage = 3;
  const maxSilo = Math.max(0, siloItems.length - itemsPerPage);

  // --- Auto-Rotation Effects ---
  useEffect(() => {
    if (heroItems.length < 2) return;
    const t = setInterval(() => setActiveHero(p => (p + 1) % heroItems.length), 6000);
    return () => clearInterval(t);
  }, [heroItems.length]);

  useEffect(() => {
    if (siloItems.length <= itemsPerPage) return;
    const t = setInterval(() => setSiloIndex(p => (p >= maxSilo ? 0 : p + 1)), 8000);
    return () => clearInterval(t);
  }, [maxSilo, siloItems.length]);

  const handleCategoryChange = (slug) => {
    setActiveCategory(slug);
    setPage(1);
    setIsSearchMode(false);
  };

  const handleUpdateArticle = (updated) => {
    setArticles(prev => prev.map(a => a._id === updated._id ? updated : a));
  };

  return (
    <div className="min-h-screen bg-paper font-sans text-ink selection:bg-blue-100">
      {/* 1. TOP TICKER */}
      {/* <nav className="sticky top-0 z-50 border-b border-border bg-paper/80 backdrop-blur-md py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 text-blue-700">
            <TrendingUp size={18} strokeWidth={2.5} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Global AI News</span>
          </div>
          <div className="hidden md:block text-xs font-bold text-muted uppercase tracking-widest">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </nav> */}

      {/* 2. HERO SECTION */}
      <header className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* THE BIG STORY (Main Hero) */}
        <div className="lg:col-span-8 relative h-[700px] group bg-paper perspective-1000">
          {/* Large Background Number for Style - Reduced Opacity & Blur */}
          <div className="absolute -top-16 -left-8 select-none pointer-events-none opacity-[0.02] font-serif text-[24rem] font-black italic z-0">
            {activeHero + 1}
          </div>

          <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5 z-10 isolate">
            {heroItems.map((art, i) => (
              <div
                key={art._id}
                onClick={() => navigate(`/${art.categorySlug}/${art.slug}`)}
                className={`absolute inset-0 transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) cursor-pointer ${i === activeHero ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"
                  }`}
              >
                {/* Image with a subtle parallax-like scale on hover */}
                <img
                  src={art.bannerImage}
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                  alt=""
                />

                {/* Premium Gradient Overlay: Multi-stop for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

                {/* Text Content */}
                <div className="absolute bottom-0 left-0 p-10 md:p-20 w-full">
                  <div className={`transition-all duration-700 delay-200 ${i === activeHero ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
                    <div className="flex items-center gap-4 mb-8">
                      <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                        {art.categorySlug?.replace(/-/g, ' ')}
                      </span>
                      <span className="text-white/80 text-xs font-serif italic tracking-wide">Featured Story</span>
                    </div>

                    <h1 className="text-white font-serif text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tighter mb-10 max-w-4xl drop-shadow-2xl">
                      {art.title}
                    </h1>

                    <div className="flex items-center gap-6">
                      <button className="group/btn relative px-10 py-4 bg-white text-slate-900 overflow-hidden rounded-sm transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                        <div className="absolute inset-0 w-full h-full bg-blue-50/50 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                        <span className="relative text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                          Read Story <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Modern Slide Indicators with Glassmorphism */}
            <div className="absolute top-12 right-12 z-20 flex flex-col gap-3 p-4 rounded-full bg-black/20 backdrop-blur-sm border border-white/5">
              {heroItems.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveHero(i); }}
                  className="group flex items-center justify-end gap-3"
                >
                  <span className={`text-[10px] font-bold transition-colors duration-300 ${i === activeHero ? "text-white" : "text-white/40"}`}>
                    0{i + 1}
                  </span>
                  <div className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${i === activeHero ? "w-8 bg-white" : "w-1.5 bg-white/30 group-hover:bg-white/60"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* THE SIDEBAR (Trending Stories) */}
        <div className="lg:col-span-4 flex flex-col pt-2">
          {/* Header with an Offset Decorative Block */}
          <div className="relative mb-14">
            <span className="absolute -top-6 left-1 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">
              Market Pulse
            </span>
            <h3 className="text-6xl md:text-7xl font-serif font-black tracking-tighter leading-[0.9] text-ink opacity-90">
              Trending
            </h3>
            <div className="h-2 w-24 bg-blue-600 mt-6" />
          </div>

          <div className="flex flex-col gap-0 border-l border-border">
            {flashItems.map((a, idx) => (
              <div
                key={a._id}
                onClick={() => navigate(`/${a.categorySlug}/${a.slug}`)}
                className="group cursor-pointer relative py-8 pl-8 border-b border-dashed border-border last:border-0 hover:bg-surface/80 transition-all duration-300"
              >
                <div className="flex gap-6 items-start">
                  {/* Number */}
                  <span className="font-serif text-3xl font-black text-slate-200 group-hover:text-blue-600 group-hover:-translate-y-1 transition-all duration-300">
                    0{idx + 1}
                  </span>

                  {/* Content Area */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600/80">
                        {a.categorySlug || "Insight"}
                      </span>
                    </div>

                    <h4 className="font-serif text-xl font-bold leading-[1.1] tracking-tight text-ink group-hover:text-blue-900 transition-colors">
                      {a.title}
                    </h4>

                    {/* Creative Hover Detail: A "Peek" at the image */}
                    <div className="relative h-0 group-hover:h-32 opacity-0 group-hover:opacity-100 transition-all duration-500 overflow-hidden rounded-lg mt-4 shadow-lg grayscale group-hover:grayscale-0">
                      <img
                        src={a.bannerImage}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        alt=""
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* 3. TRENDING & AI PICKS STRIP */}
      {!isSearchMode && (
        <section className="bg-surface/50 border-y border-border mb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/50">

            {/* COLUMN 1: TRENDING */}
            <div
              onClick={() => navigate(`/${quickGlance?.trending?.categorySlug}/${quickGlance?.trending?.slug}`)}
              className="group relative py-16 px-0 md:px-12 cursor-pointer hover:bg-paper transition-all duration-500"
            >
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <span className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-20" />
                      <span className="relative block w-2 h-2 rounded-full bg-blue-600" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-blue-600 transition-colors">Trending</span>
                  </div>
                  <h4 className="font-serif text-3xl font-black leading-none tracking-tighter text-slate-900 group-hover:text-blue-800 transition-colors line-clamp-2">
                    {quickGlance?.trending?.title || "Loading trend..."}
                  </h4>
                </div>
                <p className="mt-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-slate-900 transition-colors flex items-center gap-2">
                  Read Discussion <span className="translate-x-0 group-hover:translate-x-2 transition-transform">→</span>
                </p>
              </div>
            </div>

            {/* COLUMN 2: PRIMARY AI PICK */}
            <div
              onClick={() => navigate(`/${quickGlance?.aiPick?.categorySlug}/${quickGlance?.aiPick?.slug}`)}
              className="group relative py-16 px-0 md:px-12 cursor-pointer hover:bg-paper transition-all duration-500"
            >
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Zap size={14} className="fill-current text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Selection</span>
                  </div>
                  <h4 className="font-serif text-3xl font-black leading-none tracking-tighter text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                    {quickGlance?.aiPick?.title || "Curating pick..."}
                  </h4>
                </div>
                <p className="mt-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-slate-900 transition-colors flex items-center gap-2">
                  Full Analysis <span className="translate-x-0 group-hover:translate-x-2 transition-transform">→</span>
                </p>
              </div>
            </div>

            {/* COLUMN 3: SECONDARY AI PICK (Formerly Status) */}
            <div
              onClick={() => navigate(`/${quickGlance?.secondaryAiPick?.categorySlug}/${quickGlance?.secondaryAiPick?.slug}`)}
              className="group relative py-16 px-0 md:px-12 cursor-pointer hover:bg-paper transition-all duration-500"
            >
              <div className="flex flex-col h-full justify-between">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Sparkles size={14} className="text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Editor's Choice</span>
                  </div>
                  <h4 className="font-serif text-3xl font-black leading-none tracking-tighter text-slate-900 group-hover:text-blue-500 transition-colors line-clamp-2">
                    {quickGlance?.secondaryAiPick?.title || "Refining choice..."}
                  </h4>
                </div>
                <p className="mt-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-slate-900 transition-colors flex items-center gap-2">
                  View Entry <span className="translate-x-0 group-hover:translate-x-2 transition-transform">→</span>
                </p>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* 4. SILO SLIDER (The "Shifting" Grid) */}
      <section className="max-w-7xl mx-auto px-6 mb-32 overflow-hidden">
        <div className="flex items-end justify-between mb-16 border-b border-border pb-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted block mb-4">Discovery</span>
            <h2 className="text-5xl md:text-7xl font-serif font-black tracking-tighter leading-[0.9] text-ink">Category Focus</h2>
          </div>

          <div className="flex items-center gap-6 pb-2">
            <div className="flex gap-3">
              <button
                onClick={() => setSiloIndex(p => Math.max(0, p - 1))}
                className="p-4 border border-border rounded-full hover:bg-ink hover:text-paper hover:border-ink transition-all disabled:opacity-30 active:scale-95"
                disabled={siloIndex === 0}
              >
                <ChevronLeft size={20} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setSiloIndex(p => (p >= maxSilo ? 0 : p + 1))}
                className="p-4 border border-border rounded-full hover:bg-ink hover:text-paper hover:border-ink transition-all active:scale-95"
              >
                <ChevronRight size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex transition-transform duration-1000 cubic-bezier(0.23, 1, 0.32, 1)" style={{ transform: `translateX(-${siloIndex * (100 / itemsPerPage)}%)` }}>
          {siloItems.map(a => (
            <div key={a._id} className="w-full md:w-1/3 shrink-0 px-6 group">
              <div className="transition-transform duration-500 group-hover:-translate-y-4">
                <ArticleCard article={a} variant="grid" onUpdate={handleUpdateArticle} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-20 pb-40">
        <main className="lg:col-span-8">

          {/* 1. SECTION HEADER: Larger and More Defined */}
          <div className="relative mb-32 pl-8 py-4">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900/10" />
            <div className="absolute left-0 top-0 w-1 h-20 bg-blue-600" />

            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">
                {isSearchMode ? "Database Search" : "Primary Archive"}
              </span>
              <h2 className="text-6xl md:text-8xl font-serif font-black tracking-tighter leading-[0.9] text-ink capitalize">
                {isSearchMode ? searchQuery : activeCategory === "All" ? "The Journal" : activeCategory}
              </h2>
              <div className="mt-8 flex items-center gap-4">
                <p className="text-xs font-bold text-muted uppercase tracking-widest bg-surface px-4 py-2 rounded-full border border-border">
                  {journalArticles.length} Entries Logged
                </p>
              </div>
            </div>
          </div>

          {/* 2. THE FEED: Increased Scale and Spacing */}
          <div className="relative">
            {/* Thicker Vertical Spine with gradient */}
            <div className="absolute left-0 md:left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-slate-200 via-slate-100 to-transparent" />

            <div className="space-y-32 md:space-y-40">
              {loading ? (
                <div className="space-y-24 pl-8 md:pl-24">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-96 bg-slate-50 animate-pulse rounded-2xl border border-slate-100" />
                  ))}
                </div>
              ) : journalArticles.length > 0 ? (
                journalArticles.map((a, idx) => (
                  <div key={a._id} className="relative pl-8 md:pl-24 group">

                    {/* Bold Index Marker: Larger and Lower */}
                    <div className="absolute left-[-5px] md:left-[11px] top-6 flex flex-col items-center">
                      <div className="w-3 h-3 bg-white border-[3px] border-slate-300 group-hover:border-blue-600 group-hover:scale-125 transition-all duration-500 z-10 rounded-full" />
                      <span className="mt-8 font-serif italic text-3xl font-black text-slate-200 group-hover:text-blue-600 group-hover:translate-x-4 transition-all duration-500 origin-left">
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                    </div>

                    {/* Card Container: Scale and spacing */}
                    <div className="transition-all duration-500 group-hover:translate-x-2 group-hover:-translate-y-2">
                      <div className="group-hover:shadow-2xl group-hover:shadow-blue-900/5 rounded-2xl transition-shadow duration-500 bg-paper p-2">
                        <ArticleCard
                          article={a}
                          variant="horizontal"
                          onUpdate={handleUpdateArticle}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                /* Professional Empty State */
                <div className="py-60 text-center bg-surface/30 rounded-3xl border border-dashed border-border">
                  <h3 className="font-serif text-3xl font-black italic text-slate-300">No results found.</h3>
                  <p className="text-slate-400 text-sm mt-4">Try adjusting your search criteria.</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-32 pt-16 border-t border-slate-100 flex justify-center">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </main>

        <aside className="lg:col-span-4 space-y-16">
          <div className="sticky top-28 space-y-12">
            {/* SEARCH BOX - Linked to Global State */}
            <div className="bg-slate-900 p-10 text-white rounded-sm shadow-2xl shadow-blue-900/20">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-blue-400">Deep Search</h3>
              <div className="relative border-b border-white/20 hover:border-white/40 transition-colors">
                {/* Re-using your logic-heavy SearchInput component here ensures consistency */}
                <SearchInput className="bg-transparent border-none text-white placeholder:text-slate-600 w-full pb-3 text-lg font-serif" />
              </div>
            </div>

            {/* Categories */}
            <section className="bg-paper p-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2 text-slate-400">
                <Newspaper size={14} className="text-slate-400" /> Topic Filtering
              </h3>
              <CategoryFilter activeCategory={activeCategory} onChange={handleCategoryChange} />
            </section>

            {/* Newsletter */}
              <Newsletter variant="editorial" /> 
            
          </div>
        </aside>
      </div>
    </div>
  );
}