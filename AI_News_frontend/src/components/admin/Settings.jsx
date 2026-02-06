import React, { useState, useEffect } from "react";
import { Save, RefreshCw, AlertCircle, ShieldAlert, Terminal, Clock } from "lucide-react";
import { settingsApi } from "../../api/settings"; 

const SettingsForm = ({ currentSettings, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [interval, setIntervalValue] = useState(30);
  const [expiry, setExpiry] = useState(7);

  useEffect(() => {
    if (currentSettings) {
      if (currentSettings.cronSchedule) {
        const intervalPart = currentSettings.cronSchedule.split('/')[1];
        const minutes = intervalPart ? parseInt(intervalPart.split(' ')[0]) : 30;
        setIntervalValue(minutes);
      }
      if (currentSettings.articleExpiryDays) {
        setExpiry(currentSettings.articleExpiryDays);
      }
    }
  }, [currentSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await settingsApi.cronShedule({
        intervalMinutes: Number(interval),
        articleExpiryDays: Number(expiry)
      });

      if (res.success) {
        setMessage({ 
          type: "success", 
          text: "SYSTEM REBOOTED: INGESTION PIPELINE RESTARTED ON NEW PARAMETERS." 
        });
        if (onUpdate) onUpdate(); 
      }
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "CRITICAL FAILURE: SCHEDULER RESTART ABORTED." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl bg-paper border border-border rounded-[2.5rem] overflow-hidden shadow-2xl transition-colors duration-300">
      
      {/* 1. ADAPTIVE AWARENESS BANNER */}
      <div className="bg-surface/50 p-6 flex gap-5 border-b border-border">
        <div className="p-3 bg-accent/10 rounded-2xl ring-1 ring-accent/20">
          <ShieldAlert className="text-accent" size={24} />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-ink leading-relaxed">
            System Protocol 04: Task Override
          </p>
          <p className="text-[10px] text-muted font-mono mt-1 uppercase tracking-tight">
            Commiting changes will terminate active ingestion threads and force an 
            automated core restart.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-12">
        
        {/* 2. INGESTION FREQUENCY (SLIDER) */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <label className="block text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-2">
                Ingestion Frequency
              </label>
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-accent" />
                <p className="text-[10px] text-ink font-mono font-bold">
                  ACTIVE_CRON: <span className="text-accent">{currentSettings?.cronSchedule || "OFFLINE"}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-4xl font-mono font-black text-ink tracking-tighter">
                {interval.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] font-black uppercase text-muted ml-2 tracking-widest italic">min</span>
            </div>
          </div>
          
          <div className="relative py-4">
            <input
              type="range"
              min="15"
              max="1440"
              step="15"
              value={interval}
              onChange={(e) => setIntervalValue(e.target.value)}
              className="studio-range w-full h-2 bg-surface rounded-full appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-4 text-[9px] font-bold text-muted/40 uppercase tracking-widest font-mono">
              <span>15m_min</span>
              <span>24h_max</span>
            </div>
          </div>
        </section>

        {/* 3. ARCHIVE THRESHOLD (INPUT) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={14} className="text-muted" />
            <label className="block text-[10px] font-black text-muted uppercase tracking-[0.3em]">
              Archive Retention Threshold
            </label>
          </div>
          <div className="relative group">
            <input
              type="number"
              min="1"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full p-5 bg-surface border border-border rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none font-mono font-bold text-ink transition-all"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted/30 uppercase pointer-events-none">
              Days_Limit
            </div>
          </div>
        </section>

        {/* 4. CONTEXTUAL FEEDBACK */}
        {message.text && (
          <div className={`p-5 rounded-2xl border flex items-start gap-4 animate-in fade-in slide-in-from-top-2 ${
            message.type === "success" 
              ? "bg-green-500/5 border-green-500/20 text-green-600" 
              : "bg-red-500/5 border-red-500/20 text-red-500"
          }`}>
            <AlertCircle size={18} className="shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-widest leading-tight">{message.text}</span>
          </div>
        )}

        {/* 5. COMMIT ACTION */}
        <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          /* Changed: 
             - In Light Mode: Button is Dark (bg-ink)
             - In Dark Mode: Button stays visible because bg-ink is the darkest shade, 
               but we add a ring-1 ring-white/10 to give it an edge.
             - Alternatively: We use bg-accent as the primary in dark mode for better pop.
          */
          className="group relative w-full bg-ink dark:bg-accent text-white dark:text-white font-black py-6 rounded-2xl uppercase tracking-[0.4em] text-[11px] transition-all hover:bg-accent hover:dark:bg-white hover:dark:text-ink hover:shadow-xl hover:shadow-accent/20 active:scale-[0.98] disabled:opacity-20 disabled:grayscale ring-1 ring-white/5"
        >
          <div className="flex items-center justify-center gap-3">
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? "Re-Initializing Core..." : "Commit System Changes"}
          </div>
        </button>
      </div>
      </form>

      {/* Range Input Custom Styling */}
      <style jsx>{`
        .studio-range::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          background: var(--color-accent);
          border: 4px solid var(--color-paper);
          border-radius: 50%;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          transition: transform 0.2s ease;
        }
        .studio-range::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default SettingsForm;