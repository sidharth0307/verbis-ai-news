import React, { useState, useEffect } from "react";
import {
  Zap, Plus, Trash2, Clock,
  Infinity, Loader2, X,
  CheckCircle2, RefreshCw, Power,
  List, Activity,
  Globe,
  Layers,
  Target,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { getCategories } from "../../api/articles";
import {
  createSchedule,
  deleteSchedule,
  getActiveSchedules
} from "../../api/schedule";

const InjectionSchedule = ({ emptyCategories = [] }) => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await getActiveSchedules();
      setRules(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.error("Failed to sync rules", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  const handleDeleteRule = async (id) => {
    if (!window.confirm("Terminate this automated pipeline?")) return;
    try {
      await deleteSchedule(id);
      setRules(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      alert("Termination failed");
    }
  };

  return (
    <div className="w-full space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* 1. ADAPTIVE HEADER CONTROL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-paper p-5 md:p-8 rounded-3xl md:rounded-4xl border border-border shadow-sm gap-6">
        <div className="flex gap-4 md:gap-6 items-center">
          <div className="p-3 md:p-4 bg-accent/10 text-accent rounded-xl md:rounded-2xl shrink-0">
            <Activity size={20} className="md:w-6 md:h-6 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-ink truncate">
                Live Sources
              </h3>
              <span className="hidden xs:inline-block px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[7px] md:text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
                Engine Active
              </span>
            </div>
            <p className="text-muted text-[10px] md:text-[11px] font-bold uppercase tracking-widest line-clamp-1 md:line-clamp-none">
              Automated synthesis pipelines.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-ink dark:bg-accent text-white px-6 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:brightness-110 active:scale-95 shadow-lg"
        >
          <Plus size={16} strokeWidth={3} /> New Pipeline
        </button>
      </div>

      {/* ALERT: Empty Categories */}
      {emptyCategories.length > 0 && (
        <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top-4">
          <div className="p-4 bg-amber-500 rounded-2xl text-white shrink-0 shadow-lg shadow-amber-500/20">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-sm font-black text-ink uppercase tracking-wide mb-1">
              Global Visibility Warning
            </h3>
            <p className="text-xs text-muted font-medium mb-3">
              The following categories have 0 articles and are currently hidden from the navbar:
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {emptyCategories.map(cat => (
                <span key={cat.slug} className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 text-[9px] font-black uppercase tracking-wider border border-amber-500/10">
                  {cat.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. GRID OF ACTIVE PIPELINES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {loading ? (
          <div className="col-span-full py-20 md:py-32 text-center">
            <Loader2 className="animate-spin mx-auto text-accent mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Scanning Threads...</p>
          </div>
        ) : rules.length === 0 ? (
          <div className="col-span-full py-20 md:py-32 bg-surface/50 border border-dashed border-border rounded-4xl md:rounded-[3rem] flex flex-col items-center justify-center text-center p-6 text-muted">
            <Database size={40} className="mb-4 md:mb-6 opacity-10" />
            <p className="font-black uppercase tracking-[0.3em] text-xs">System Idle</p>
            <p className="text-[10px] uppercase mt-2 font-bold tracking-tighter opacity-60">No active pipelines detected.</p>
          </div>
        ) : rules.map((rule) => (
          <div
            key={rule._id}
            className="bg-paper border border-border p-6 md:p-8 rounded-4xl md:rounded-[2.5rem] flex flex-col group relative hover:border-accent hover:shadow-xl transition-all duration-500"
          >
            {/* Header Area */}
            <div className="flex justify-between items-start mb-6 md:mb-10">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Layers size={12} className="text-accent shrink-0" />
                  <span className="text-[9px] md:text-[10px] font-black text-accent uppercase tracking-widest italic truncate">Live Stream</span>
                </div>
                <h4 className="font-black text-ink text-xl md:text-2xl uppercase tracking-tighter leading-tight italic truncate">
                  {rule.category}
                </h4>
              </div>
              <button
                onClick={() => handleDeleteRule(rule._id)}
                className="p-2 md:p-3 rounded-lg md:rounded-xl bg-surface text-muted/30 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-90 shrink-0"
              >
                <Trash2 size={16} md:size={18} />
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="bg-surface rounded-xl md:rounded-2xl p-4 md:p-5 border border-border/50">
                <p className="text-[8px] md:text-[9px] font-black text-muted uppercase mb-1 md:mb-2 tracking-widest">Articles/Day</p>
                <p className="font-black text-ink text-xl md:text-2xl font-mono">{rule.articlesPerDay}</p>
              </div>
              <div className="bg-surface rounded-xl md:rounded-2xl p-4 md:p-5 border border-border/50">
                <p className="text-[8px] md:text-[9px] font-black text-muted uppercase mb-1 md:mb-2 tracking-widest">Duration</p>
                <div className="flex items-center gap-2">
                  {rule.daysRemaining > 5000 ? (
                    <span className="text-[10px] md:text-[11px] font-black text-green-500 uppercase flex items-center gap-1 font-mono">
                      <Infinity size={12} /> Inf
                    </span>
                  ) : (
                    <span className="text-[10px] md:text-[11px] font-black text-ink uppercase font-mono">
                      {rule.daysRemaining}<span className="text-muted text-[8px] ml-1">D</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Logic */}
            <div className="mt-6 md:mt-10 pt-4 md:pt-6 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-green-500"></span>
                </div>
                <span className="text-[8px] md:text-[9px] font-black text-muted uppercase tracking-[0.2em]">Live</span>
              </div>
              <p className="text-[8px] md:text-[9px] text-muted/30 font-mono font-bold uppercase tracking-tighter group-hover:text-accent transition-colors truncate max-w-20">
                ID:{rule._id.slice(-6)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal - Ensure the CreateScheduleModal is also reskinned to Studio v4 */}
      {isModalOpen && (
        <CreateScheduleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRefresh={fetchRules}
        />
      )}
    </div>
  );
};


const CreateScheduleModal = ({ isOpen, onClose, onRefresh }) => {
  const [availableSilos, setAvailableSilos] = useState([]);
  const [isInfinite, setIsInfinite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    articlesPerDay: 10,
    daysRemaining: 7
  });

  // Load Silos when opening
  useEffect(() => {
    if (isOpen) {
      const fetchSilos = async () => {
        try {
          const res = await getCategories();
          setAvailableSilos(res);
          // Set first silo as default automatically
          if (res.length > 0 && !formData.category) {
            setFormData(prev => ({ ...prev, category: res[0].slug }));
          }
        } catch (err) {
          console.error("Failed to load categories");
        }
      };
      fetchSilos();
    }
  }, [isOpen]);

  const toggleInfinite = () => {
    const nextInfinite = !isInfinite;
    setIsInfinite(nextInfinite);
    setFormData(prev => ({ ...prev, daysRemaining: nextInfinite ? 9999 : 7 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createSchedule(formData);
      onRefresh();
      onClose();
    } catch (err) {
      alert("Failed to start automation");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-150 overflow-y-auto bg-ink/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-paper border border-border w-full max-w-lg rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative my-4">

          {/* 1. STUDIO HEADER */}
          <div className="p-5 md:p-8 border-b border-border flex justify-between items-center bg-surface/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent rounded-lg text-white">
                <Target size={18} />
              </div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-ink">Pipeline Configuration</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl text-muted hover:bg-red-500/10 hover:text-red-500 transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 md:p-10 space-y-6 md:space-y-8">

              {/* 2. TARGET SELECTION */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.3em] ml-1">Target Category</label>
                <div className="relative group">
                  <select
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-surface border border-border rounded-2xl p-5 font-black text-[11px] uppercase tracking-widest text-ink outline-none cursor-pointer appearance-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
                  >
                    <option value="" disabled className="text-muted">Select Target...</option>
                    {availableSilos.map(silo => (
                      <option key={silo._id} value={silo.name}>{silo.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-accent">
                    <Globe size={18} />
                  </div>
                </div>
              </div>

              {/* 3. DENSITY SLIDER */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-muted uppercase tracking-[0.3em] ml-1">Daily Article Density</label>
                  <div className="px-3 py-1 bg-accent text-white rounded-lg font-mono font-black text-[11px] shadow-lg shadow-accent/20">
                    {formData.articlesPerDay.toString().padStart(2, '0')} UNIT/S
                  </div>
                </div>

                <div className="bg-surface p-6 rounded-2xl border border-border shadow-inner relative overflow-hidden">
                  {/* Track Background Layer - Ensures visibility even if input styles fail */}
                  <div className="absolute top-[46%] left-6 right-6 h-1.5 bg-ink/10 dark:bg-white/10 rounded-full pointer-events-none" />

                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={formData.articlesPerDay}
                    onChange={e => setFormData({ ...formData, articlesPerDay: e.target.value })}
                    // Added: Custom classes for high-visibility dark mode thumb
                    className="studio-range relative z-10 w-full h-1.5 bg-transparent appearance-none cursor-pointer mb-4"
                  />

                  <div className="flex justify-between text-[9px] font-black text-muted tracking-widest uppercase opacity-60">
                    <span>Min_01</span>
                    <span>Max_50</span>
                  </div>
                </div>
              </div>

              <style jsx>{`
              /* 1. Track Styling */
              .studio-range::-webkit-slider-runnable-track {
                width: 100%;
                height: 6px;
                background: transparent; /* Background handled by the absolute div above */
                border-radius: 999px;
              }

              /* 2. The Handle (Thumb) - This is the part that usually disappears */
              .studio-range::-webkit-slider-thumb {
                appearance: none;
                height: 22px;
                width: 22px;
                background: var(--color-accent, #3b82f6); /* Use accent color */
                border: 4px solid var(--color-paper, #ffffff); /* Thick border to pop from background */
                border-radius: 50%;
                cursor: pointer;
                margin-top: -8px; /* Centers thumb on track */
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
              }

              /* 3. Hover/Active Effects */
              .studio-range::-webkit-slider-thumb:hover {
                transform: scale(1.15);
                background: #ffffff; /* Turns white on hover for high feedback */
                border-color: var(--color-accent);
              }

              /* Firefox Support */
              .studio-range::-moz-range-thumb {
                height: 22px;
                width: 22px;
                background: var(--color-accent);
                border: 4px solid var(--color-paper);
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              }
            `}</style>

              {/* 4. TEMPORAL BOUNDS (DURATION) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-muted uppercase tracking-[0.3em] ml-1">Operational Bounds</label>
                  <button
                    type="button"
                    onClick={toggleInfinite}
                    className={`flex items-center gap-2 text-[9px] font-black px-4 py-2 rounded-xl border transition-all active:scale-95 ${isInfinite
                      ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20'
                      : 'bg-surface border-border text-muted hover:text-ink'
                      }`}
                  >
                    <Infinity size={14} /> ALWAYS ON
                  </button>
                </div>

                {!isInfinite ? (
                  <div className="relative animate-in slide-in-from-top-2">
                    <input
                      type="number"
                      value={formData.daysRemaining}
                      onChange={e => setFormData({ ...formData, daysRemaining: e.target.value })}
                      placeholder="Enter days..."
                      className="w-full bg-surface border border-border rounded-2xl p-5 font-mono font-black text-sm text-ink outline-none focus:border-accent transition-all"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted/30">
                      <Calendar size={14} />
                      <span className="text-[9px] font-black uppercase">Days_Limit</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 border border-green-500/20 bg-green-500/5 rounded-2xl flex gap-4 items-center animate-in zoom-in-95">
                    <div className="p-2 bg-green-500 rounded-lg text-white">
                      <CheckCircle2 size={18} />
                    </div>
                    <p className="text-[10px] text-green-600 font-black uppercase leading-tight tracking-wider">
                      Pipeline locked to infinite cycle. <br />
                      <span className="opacity-60 text-[8px]">Manual termination required.</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 5. ACTION FOOTER */}
            <div className="p-6 md:p-10 pt-0">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-ink dark:bg-accent text-white py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:brightness-110 transition-all disabled:opacity-20 disabled:grayscale shadow-xl shadow-accent/10 active:scale-[0.98] ring-1 ring-white/5"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Zap size={18} className={isSubmitting ? '' : 'fill-current'} />
                )}
                {isSubmitting ? "Initializing Pipeline..." : "Launch Automation"}
              </button>
            </div>
          </form>
        </div>

        <style jsx>{`
        .studio-range::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: var(--color-accent);
          border: 3px solid var(--color-paper);
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
      `}</style>
      </div>
    </div>
  );
};
export default InjectionSchedule;