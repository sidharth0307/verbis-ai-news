import { Link } from "react-router-dom";
import { ArrowUpRight, Calendar, Globe, MessageSquare, ChevronRight } from "lucide-react";
import CommentBox from "../ui/CommentBox";
import ArticleActions from "../ui/ArticleActions";

export default function ArticleCard({ article, onUpdate, variant = "grid" }) {
  const articleLink = `/${article.categorySlug || "news"}/${article.slug}`;

  // HOME-ONLY LOGIC: Filter for top-level comments and take only the latest 2
  const previewComments = (article.comments || [])
    .filter(c => !c.parentId)
    .slice(-2)
    .reverse();

  // VARIANT: SIDEBAR/COMPACT (For "Flash Reports")
  if (variant === "compact") {
    return (
      <Link to={articleLink} className="group flex gap-4 border-b border-border pb-4 last:border-0">
        <div className="w-20 h-20 shrink-0 bg-surface overflow-hidden">
          <img src={article.bannerImage} className="h-full w-full object-cover transition-all duration-500" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[8px] font-black text-accent uppercase tracking-widest mb-1">{article.category}</span>
          <h4 className="text-xs font-bold leading-tight line-clamp-2 text-ink group-hover:text-accent transition-colors">{article.title}</h4>
        </div>
      </Link>
    );
  }

  // VARIANT: HORIZONTAL (For the "Main Feed" list)
  if (variant === "horizontal") {
    // Get the latest comment for the preview
    const latestComment = article.comments?.[article.comments.length - 1];

    return (
      <div className="group grid grid-cols-1 md:grid-cols-12 gap-6 pb-10 border-b border-border">
        {/* Image Container with Hover Preview */}
        <Link
          to={articleLink}
          className="md:col-span-4 aspect-video bg-surface overflow-hidden relative group/img cursor-pointer"
        >
          <img
            src={article.bannerImage}
            className="h-full w-full object-cover group-hover/img:scale-105 transition-transform duration-700"
            alt={article.title}
          />

          {/* Category Label */}
          <div className="absolute top-3 left-3 bg-paper px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter shadow-sm z-10 text-ink">
            {article.category}
          </div>

          {/* FLOATING COMMENT TOOLTIP (The Hover Preview) */}
          {latestComment && (
            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover/img:translate-y-0 transition-transform duration-300 bg-paper/95 backdrop-blur-sm z-20 border-t border-border">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-[8px] font-black text-accent uppercase tracking-widest">
                  Latest Comment
                </span>
              </div>
              <p className="text-[10px] text-ink italic line-clamp-2 leading-relaxed font-bold">
                "{latestComment.comment}"
              </p>
              <p className="text-[9px] text-muted mt-2 uppercase font-black tracking-tight">
                — {latestComment.userName}
              </p>
            </div>
          )}
        </Link>

        {/* Content Section */}
        <div className="md:col-span-8 flex flex-col py-1">
          <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase mb-2">
            <span className="text-accent">{article.source?.name || "Global News"}</span>
            <span>•</span>
            <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
          </div>

          <Link to={articleLink}>
            <h3 className="font-serif text-2xl font-black leading-tight text-ink group-hover:text-accent transition-colors mb-3">
              {article.title}
            </h3>
          </Link>

          <p className="text-sm text-muted line-clamp-2 mb-4 leading-relaxed font-medium">
            {article.summary}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ArticleActions article={article} onUpdate={onUpdate} />
              <div className="flex items-center gap-1 text-[10px] font-bold text-muted uppercase tracking-widest">
                <MessageSquare size={12} />
                {article.comments?.length || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col bg-paper border border-border overflow-hidden transition-all duration-300 hover:border-accent/30 hover:shadow-xl">

      {/* Image Section */}
      <Link
        to={articleLink}
        onClick={() => sessionStorage.setItem("homeScroll", window.scrollY)}
        className="relative block aspect-video overflow-hidden bg-surface"
      >
        {article.bannerImage ? (
          <img
            src={article.bannerImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface">
            <Globe className="h-10 w-10 text-muted/20" />
          </div>
        )}

        <div className="absolute top-4 left-4">
          <span className="bg-paper/90 backdrop-blur-sm px-3 py-1 text-[10px] font-black uppercase tracking-widest text-ink border border-border">
            {article.category || "AI Insight"}
          </span>
        </div>

        <div className="absolute right-4 bottom-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <div className="bg-accent p-2 text-white shadow-lg">
            <ArrowUpRight size={18} />
          </div>
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.15em] text-accent mb-3">
          <span className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {article.source?.name || "Global News"}
          </span>
          <span className="text-border">•</span>
          <span className="text-muted">
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric"
            })}
          </span>
        </div>

        <Link to={articleLink} className="block mb-3">
          <h2 className="font-serif text-2xl font-bold leading-tight text-ink line-clamp-2 group-hover:text-accent transition-colors">
            {article.title}
          </h2>
        </Link>

        <p className="text-sm leading-relaxed text-muted line-clamp-3 mb-6">
          {article.summary}
        </p>

        {/* Home Card Discussion Preview */}
        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <ArticleActions article={article} onUpdate={onUpdate} />
            <div className="flex items-center gap-1.5 text-muted text-xs font-bold uppercase tracking-widest">
              <MessageSquare size={14} />
              {article.comments?.length || 0}
            </div>
          </div>

          {/* Homepage Limited Comments View */}
          <div className="space-y-2 mb-4">
            {previewComments.length > 0 ? (
              previewComments.map(c => (
                <div key={c._id} className="bg-surface p-3 rounded-lg border border-border">
                  <p className="text-[10px] font-bold text-accent uppercase mb-1">{c.userName}</p>
                  <p className="text-xs text-ink/70 line-clamp-1 italic">"{c.comment}"</p>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-muted uppercase tracking-widest">No comments yet</p>
            )}
          </div>

          <Link
            to={articleLink}
            className="flex w-full items-center justify-center gap-2 bg-ink py-3 text-[10px] font-black uppercase tracking-widest text-paper transition-all hover:bg-accent"
          >
            View All Comments <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}