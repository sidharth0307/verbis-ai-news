import { useState } from "react";
import { commentArticle, deleteComment, likeComment } from "../../api/articles";
import useLoginCheck from "../../hooks/LoginCheck";
import { MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";
import Comment from "./Comment";


const CommentBox = ({ articleId, comments, onNewComment }) => {
  const [text, setText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const checkLogin = useLoginCheck();

  const toggleComments = () => setShowComments((prev) => !prev);

  const user = JSON.parse(localStorage.getItem("user")) || null;

  // Unified submit for both Top-level and Replies
  const submitComment = (content, parentId = null) =>
    checkLogin(async () => {
      const targetText = content || text;
      if (targetText.trim() === "") return;
      
      setIsSubmitting(true);
      try {
        // Pass parentId to your API call
        const res = await commentArticle(articleId, targetText, parentId);
        onNewComment(res.data);
        if (!parentId) setText(""); // Clear main input if it wasn't a reply
      } catch (err) {
        console.error("Comment failed", err);
      } finally {
        setIsSubmitting(false);
      }
    });

    const handleLike = (commentId) => {
    checkLogin(async () => {
      try {
        // 1. Call the new API
        const res = await likeComment(articleId, commentId);
        
        // 2. Pass the fresh comments array back up to the parent (ArticleDetail/Card)
        // This will cause the entire comment tree to re-render with the new like counts
        onNewComment(res.data);
      } catch (err) {
        console.error("Failed to toggle like", err);
      }
    });
  };

const handleDelete = async (commentId) => {
  if (!window.confirm("Are you sure you want to redact this intel?")) return;
  
  try {
    const res = await deleteComment(articleId, commentId);
    onNewComment(res.data); // Update state with fresh array
  } catch (err) {
    console.error("Delete failed", err);
  }
};

  // YouTube logic: Root comments only at the top level
  const rootComments = comments.filter(c => !c.parentId);

  return (
    <div className="mt-8 border-t border-white/20 pt-6">
      <button
        onClick={toggleComments}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
          showComments 
            ? "bg-foreground text-background" 
            : "bg-white/40 backdrop-blur-md text-foreground hover:bg-white/60 border border-white/40"
        }`}
      >
        <MessageSquare size={14} strokeWidth={2.5} />
        {showComments ? "Close Discussion" : `View Discussion (${comments.length})`}
        {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {showComments && (
        <div className="mt-6 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
          
          {/* Main Input Area (Fixed at top like YouTube) */}
          <div className="relative group mb-10">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start a new thread..."
              className="w-full min-h-24 rounded-2xl border border-white/60 bg-white/50 p-5 text-sm font-sans placeholder:text-muted-foreground/50 focus:outline-none transition-all backdrop-blur-xl shadow-inner"
            />
            <button
              onClick={() => submitComment()}
              disabled={isSubmitting || !text.trim()}
              className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-[10px] font-black uppercase text-background transition-all hover:scale-105 disabled:opacity-30"
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
              <Send size={12} />
            </button>
          </div>

          {/* Recursive Comment List */}
          <div className="space-y-6 max-h-150 overflow-y-auto pr-4 custom-scrollbar">
            {rootComments.length === 0 ? (
              <p className="text-sm italic text-muted-foreground/60 font-serif">
               No comments yet. Be the first to share your thoughts.
              </p>
            ) : (
              rootComments.map((c) => (
                <Comment 
                  key={c._id} 
                  comment={c} 
                  currentUserId={user?.id}
                  allComments={comments} 
                  onReply={submitComment} 
                  onLike={handleLike}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default CommentBox;