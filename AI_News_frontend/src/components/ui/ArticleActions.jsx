import { Bookmark, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; 
import { likeArticle, saveArticle } from "../../api/articles";
import useloginCheck from "../../hooks/LoginCheck";

const ArticleActions = ({ article, onUpdate }) => {
  const checkLogin = useloginCheck();
  const isLiked = article.isLiked;
  const isSaved = article.isSaved;

  const handleLike = () =>
  checkLogin(async () => {
    // 1. Capture current state
    const wasLiked = !!article.isLiked;
    const currentCount = article.likesCount || 0;

    // 2. IMMEDIATE UI UPDATE (Optimistic)
    onUpdate({
      ...article,
      isLiked: !wasLiked,
      likesCount: wasLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
    });

    try {
      const res = await likeArticle(article._id);
      
      // 3. SERVER SYNC
      // We check for both 'isLiked' and 'liked' to be safe
      const serverIsLiked = res.data.isLiked !== undefined ? res.data.isLiked : res.data.liked;
      
      onUpdate({
        ...article,
        likesCount: res.data.likesCount,
        isLiked: serverIsLiked 
      });
    } catch (err) {
      // 4. ROLLBACK on failure
      onUpdate({ ...article, isLiked: wasLiked, likesCount: currentCount });
    }
  });

  const handleSave = () =>
    checkLogin(async () => {
      const originalSaved = isSaved;
      onUpdate({ ...article, isSaved: !originalSaved });

      try {
        const { data } = await saveArticle(article._id);
        onUpdate(data);
      } catch (err) {
        onUpdate({ ...article, isSaved: originalSaved });
      }
    });

  return (
    <div className="flex items-center gap-3 mt-6">
      {/* Like Button */}
      <motion.button
        whileTap={{ scale: 0.9 }} // Visual feedback on click
        onClick={handleLike}
        className={`group flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors duration-300 border ${
          isLiked
            ? "bg-pink-500/10 border-pink-500/50 text-pink-600 shadow-sm shadow-pink-200"
            : "bg-white/40 border-white/60 text-muted-foreground hover:bg-white/80 hover:text-pink-600 hover:border-pink-300 backdrop-blur-md"
        }`}
      >
        <div className="relative">
          <AnimatePresence>
            {isLiked && (
              <motion.span
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-pink-500 rounded-full"
              />
            )}
          </AnimatePresence>
          <Heart
            size={16}
            className={`transition-all duration-300 ${isLiked ? "fill-current scale-110" : "scale-100"}`}
            strokeWidth={2.5}
          />
        </div>
        {/* Animate the number change */}
        <motion.span
          key={article.likesCount}
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-block"
        >
          {article.likesCount || 0}
        </motion.span>
      </motion.button>

      {/* Save Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleSave}
        className={`group flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 border ${
          isSaved
            ? "bg-slate-900 text-white shadow-md border-slate-900"
            : "bg-white/40 border-white/60 text-muted-foreground hover:bg-white/80 hover:text-foreground backdrop-blur-md"
        }`}
      >
        <Bookmark
          size={16}
          className={`${isSaved ? "fill-current" : ""}`}
          strokeWidth={2.5}
        />
        <span>{isSaved ? "Saved" : "Save"}</span>
      </motion.button>
    </div>
  );
};

export default ArticleActions;