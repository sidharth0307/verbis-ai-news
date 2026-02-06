import { ChevronDown, ChevronUp, MessageSquare, ThumbsUp, Trash2 } from "lucide-react";
import { useState } from "react";

const Comment = ({ comment, allComments, onReply, onLike, onDelete, currentUserId }) => {
  const isOwner = String(currentUserId) === String(comment.user);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  
  const replies = allComments.filter(c => c.parentId === comment._id);

  return (
    <div className="group flex flex-col">
      {/* Main Comment Body */}
      <div className="relative border-l-2 border-slate-100 hover:border-blue-600 transition-colors pl-4 py-2">
        <div className="flex items-center gap-2 mb-2">
        {/* The Author's Badge */}
        <span className="bg-slate-900 text-white text-[9px] font-black uppercase px-2 py-0.5 tracking-tighter">
            {comment.userName || "Anonymous User"}
        </span>
        
        {/* The Timestamp */}
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            {new Date(comment.createdAt).toLocaleDateString("en-US", { 
            month: "short", 
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
            })}
        </span>
        </div>
        
        <p className="text-sm text-slate-700 leading-relaxed font-medium mb-3">
            {comment.parentId && (
                <span className="text-blue-600 font-bold mr-2 text-[11px]">
                @{allComments.find(c => c._id === comment.parentId)?.userName}
                </span>
            )}
            {comment.comment}
        </p>
        
        {/* Interaction Bar */}
        <div className="flex items-center gap-6 mt-3">
        {/* UPVOTE */}
        <button 
            onClick={() => onLike(comment._id)} 
            className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-[0.15em]"
        >
            <ThumbsUp size={12} strokeWidth={2.5} />
            Upvote {comment.likes?.length > 0 && `(${comment.likes.length})`}
        </button>
        
        {/* REPLY */}
        <button 
            onClick={() => setIsReplying(!isReplying)} 
            className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[0.15em]"
        >
            <MessageSquare size={12} strokeWidth={2.5} />
            {isReplying ? "Cancel" : "Reply"}
        </button>

        {/* REDACT (DELETE) */}
        {isOwner && (
            <button 
            onClick={() => onDelete(comment._id)}
            className="flex items-center gap-1.5 text-[10px] font-black text-red-400/70 hover:text-red-600 transition-colors uppercase tracking-[0.15em]"
            >
            <Trash2 size={12} strokeWidth={2.5} />
            Delete
            </button>
        )}
        </div>
      </div>

      {/* Reply Input Field - Styled like your Search/Input theme */}
      {isReplying && (
        <div className="ml-4 mt-4 p-4 bg-slate-50 border border-slate-100 rounded-lg animate-in fade-in slide-in-from-left-2 duration-300">
          <textarea 
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-300 resize-none"
            placeholder="Write a public reply..."
            rows={2}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end mt-2">
            <button 
              onClick={() => { 
                onReply(replyText, comment._id);
                setIsReplying(false); 
                setReplyText(""); 
              }}
              disabled={!replyText.trim()}
              className="bg-slate-900 text-white px-4 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-20"
            >
              Post Reply
            </button>
          </div>
        </div>
      )}

      {/* RECURSION SECTION */}
      {replies.length > 0 && (
        <div className="ml-4 mt-3">
          <button 
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-blue-600/60 hover:text-blue-600 mb-4 transition-colors"
          >
            <div className="h-px w-4 bg-blue-100" />
            {showReplies ? "Hide Responses" : `Show ${replies.length} Responses`}
            {showReplies ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
          
          {showReplies && (
            <div className="space-y-8 ml-2 border-l border-slate-100">
              {replies.map(reply => (
                <div key={reply._id} className="pl-4">
                  <Comment 
                    comment={reply} 
                    allComments={allComments} 
                    onReply={onReply} 
                    onLike={onLike} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Comment;