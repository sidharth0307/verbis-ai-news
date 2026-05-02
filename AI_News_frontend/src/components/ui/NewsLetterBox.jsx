import { useState } from "react";
import { Globe, Loader2, CheckCircle2, Send } from "lucide-react";
import { userApi } from "../../api/users";

export default function Newsletter({ variant = "editorial" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); 
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const data = await userApi.subscribeToNewsletter(email);
      setStatus("success");
      setMessage(data.message);
      setEmail("");
    } catch (err) {
      setStatus("error");
      const serverMessage = err.response?.data?.message || err.message || "An unknown error occurred";
      const needsToRegister = err.response?.status === 403;

      setMessage(serverMessage);
      console.error("Subscription Error:", err);

      // If it's a general error, reset after 4s. 
      // If they need to register, keep the message visible.
      if (!needsToRegister) {
        setTimeout(() => setStatus("idle"), 4000);
      }
    }
  };

  // Variant Styles
  const styles = {
    editorial: "bg-blue-600 p-10 text-white rounded-sm shadow-xl shadow-blue-600/20",
    minimal: "bg-ink p-8 text-paper border border-border/50",
  };

  return (
  <div className={`relative group overflow-hidden transition-all duration-500 ${styles[variant]} ${variant === "editorial" ? "p-6 md:p-8 lg:p-10" : ""}`}>
    {variant === "editorial" && (
      <Globe className="absolute -right-8 -bottom-8 h-32 w-32 md:h-40 md:w-40 lg:h-48 lg:w-48 opacity-10 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-[1.5s]" />
    )}
    
    <div className="relative z-10">
      <h4 className={`font-serif font-black italic mb-4 leading-none ${variant === "editorial" ? "text-2xl md:text-3xl" : "text-xl uppercase"}`}>
        {status === "success" ? "Protocol Active" : "Network Updates"}
      </h4>
      
      <p className={`text-sm md:text-md mb-8 leading-relaxed font-medium ${variant === "editorial" ? "text-blue-100" : "text-muted"}`}>
        {status === "success" 
          ? "Your briefing is being compiled. Connection established." 
          : "Join the network for daily intelligence briefs."}
      </p>

      {status === "success" ? (
        <div className="flex items-center gap-3 bg-white/10 p-4 border border-white/20 animate-in fade-in zoom-in">
          <CheckCircle2 size={18} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ENTER EMAIL"
            required
            className={`w-full p-4 text-sm font-bold outline-none transition-colors ${
              variant === "editorial" 
              ? "bg-blue-700/50 border-blue-400/30 focus:border-white placeholder:text-blue-200/50" 
              : "bg-surface border-border focus:border-accent text-ink"
            }`}
          />
          <button
            disabled={status === "loading"}
            className={`w-full py-4 text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ${
              variant === "editorial" 
              ? "bg-white text-blue-600 hover:bg-slate-900 hover:text-white" 
              : "bg-ink text-paper hover:bg-accent"
            }`}
          >
            {status === "loading" ? <Loader2 className="animate-spin" size={16} /> : "Connect Now"}
          </button>
          {status === "error" && (
            <div className="mt-2 animate-in fade-in slide-in-from-top-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-red-300 animate-pulse">
                {message}
              </p>
              {message.toLowerCase().includes("register") && (
                <button 
                  type="button"
                  onClick={() => window.location.href = '/register'}
                  className="mt-2 text-[9px] font-black uppercase tracking-widest text-black underline decoration-white/30 underline-offset-4 hover:decoration-white transition-all block"
                >
                  Go to Registration →
                </button>
              )}
            </div>
          )}
        </form>
      )}
    </div>
  </div>
);
}