import React, { useState, useEffect, useRef } from 'react';
import { assetApi } from '../../api/assets';
import { settingsApi } from '../../api/settings';
import toast from 'react-hot-toast';
import { useBranding } from '../../context/BrandingContext';
import { Save, Cpu, ImageIcon, Zap, ExternalLink, Globe, ShieldCheck, Terminal, HardDrive, RefreshCcw, Loader2, ChevronDown, User, Users } from 'lucide-react';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('identity');
  const [loading, setLoading] = useState(false);
  const { refreshBranding } = useBranding();
  const [previews, setPreviews] = useState({ logo: null, banner: null });
  const [syncInputs, setSyncInputs] = useState({ textKey: '', imageKey: '' });
  const [settings, setSettings] = useState({
    siteTitle: '',
    contactEmail: '',
    contactPhone: '',
    logo: '',
    fallbackBannerUrl: '',
    activeTextProvider: '',
    activeImageProvider: '',
    aiProviders: []
  });

  const logoRef = useRef();
  const bannerRef = useRef();

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const [brandingRes, configRes] = await Promise.all([
          assetApi.getAssets(),
          settingsApi.getSettings()
        ]);

        setSettings({
          ...configRes,
          ...brandingRes,
          siteTitle: brandingRes.siteTitle || '',
          contactEmail: brandingRes.contactEmail || '',
          contactPhone: brandingRes.contactPhone || '',
          logo: brandingRes.logo || '',
          fallbackBannerUrl: brandingRes.fallbackBannerUrl || ''
        });
      } catch (err) {
        toast.error("Error synchronizing local data");
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const handleNeuralSync = async () => {
    if (!syncInputs.textKey || !syncInputs.imageKey) return toast.error("Both Text and Image API Keys are required for neural sync");
    setLoading(true);
    try {
      await settingsApi.syncSmartKeys(syncInputs);
      const freshConfig = await settingsApi.getSettings();
      setSettings(freshConfig);
      toast.success("Intelligence Pool Updated Successfully!");
      setActiveTab('ai-status');
    } catch (err) {
      toast.error(err.response?.data?.message || "AI Analysis Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleProviderModelChange = (index, field, value) => {
    const updatedProviders = [...settings.aiProviders];
    updatedProviders[index][field] = value;
    setSettings({ ...settings, aiProviders: updatedProviders });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const files = {
        logo: logoRef.current?.files[0],
        fallbackBanner: bannerRef.current?.files[0]
      };
      let currentSettings = { ...settings };
      if (files.logo || files.fallbackBanner) {
        const assetRes = await assetApi.updateAssets(settings, files);
        currentSettings = { ...currentSettings, ...assetRes.assets };
      }
      const finalData = await assetApi.updateAssets(currentSettings);
      setSettings(finalData);
      setPreviews({ logo: null, banner: null });
      await refreshBranding();
      toast.success("System Configuration Secured!");
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
  };

  const handleUrlChange = (type, value) => {
    if (type === 'logo') {
      if (logoRef.current) logoRef.current.value = "";
      setPreviews(prev => ({ ...prev, logo: null }));
      setSettings({ ...settings, logo: value });
    } else {
      if (bannerRef.current) bannerRef.current.value = "";
      setPreviews(prev => ({ ...prev, banner: null }));
      setSettings({ ...settings, fallbackBannerUrl: value });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">

      {/* 1. STUDIO SEGMENTED NAVIGATION */}
      <div className="inline-flex p-1.5 bg-surface border border-border rounded-4xl mb-12 overflow-x-auto scrollbar-hide">
        {[
          { id: 'identity', label: 'Identity', icon: <Globe size={14} /> },
          { id: 'sync', label: 'Neural Sync', icon: <Zap size={14} /> },
          { id: 'ai-status', label: 'AI Status', icon: <Terminal size={14} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-3xl ${activeTab === tab.id
              ? 'bg-paper text-accent shadow-sm ring-1 ring-border'
              : 'text-muted hover:text-ink'
              }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="bg-paper border border-border rounded-[3rem] shadow-xl shadow-black/5 p-8 lg:p-16 relative overflow-hidden">

        {/* Decorative Background Accent */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-ink pointer-events-none">
          <ShieldCheck size={200} strokeWidth={1} />
        </div>

        {/* TAB 1: IDENTITY (Brand Assets) */}
        {activeTab === 'identity' && (
          <div className="space-y-16 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { label: 'Site Title', key: 'siteTitle', placeholder: 'The Protocol' },
                { label: 'Control Email', key: 'contactEmail', placeholder: 'admin@vault.io' },
                { label: 'Contact Phone', key: 'contactPhone', placeholder: '+1 (555) 000-000' }
              ].map(field => (
                <div key={field.key} className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1 italic">{field.label}</label>
                  <input
                    value={settings[field.key]}
                    placeholder={field.placeholder}
                    onChange={e => setSettings({ ...settings, [field.key]: e.target.value })}
                    className="w-full bg-surface border border-border rounded-2xl p-5 text-sm font-bold text-ink outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {[
                { label: 'Brand Logo', ref: logoRef, key: 'logo', preview: previews.logo, fallback: settings.logo, type: 'logo' },
                { label: 'Article Hero Fallback', ref: bannerRef, key: 'fallbackBannerUrl', preview: previews.banner, fallback: settings.fallbackBannerUrl, type: 'banner' }
              ].map(asset => (
                <div key={asset.key} className="space-y-5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">{asset.label}</label>
                  <div className="aspect-video bg-surface border border-border rounded-[2.5rem] flex items-center justify-center overflow-hidden relative group shadow-inner">
                    <img
                      src={asset.preview || asset.fallback}
                      className={`transition-all duration-700 group-hover:scale-110 ${asset.type === 'logo' ? 'max-h-[30%] object-contain' : 'w-full h-full object-cover grayscale-0 group-hover:brightness-75'}`}
                      alt="Preview"
                      onError={(e) => { e.target.src = "https://placehold.co/600x400/0f172a/white?text=VOID_ASSET"; }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm bg-ink/20">
                      <label htmlFor={asset.key} className="bg-paper text-ink px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-accent hover:text-white transition-all shadow-xl active:scale-95">
                        Replace Asset
                      </label>
                    </div>
                  </div>
                  <input type="file" ref={asset.ref} hidden id={asset.key} onChange={(e) => handleFileChange(e, asset.type)} accept="image/*" />
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Source URL Override..."
                      value={settings[asset.key] || ""}
                      onChange={e => handleUrlChange(asset.type, e.target.value)}
                      className="w-full bg-surface/50 border border-border rounded-xl p-4 pl-5 text-[10px] font-mono text-muted outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: NEURAL SYNC (Adaptive Dev-Ops Panel) */}
        {activeTab === 'sync' && (
          <div className="max-w-2xl mx-auto py-12 animate-in slide-in-from-bottom-8 duration-700">
            {/* Changed: Removed hardcoded bg-ink for var-based surface with higher depth */}
            <div className="bg-surface border border-border rounded-[3rem] p-12 shadow-2xl relative overflow-hidden ring-1 ring-accent/5">

              {/* Decorative Zap - Now uses accent color with very low opacity */}
              <div className="absolute top-0 right-0 p-8 text-accent/5 rotate-12 pointer-events-none">
                <Zap size={140} strokeWidth={1} />
              </div>

              <div className="flex items-center gap-6 mb-12 relative z-10">
                {/* Glow effect on the icon container */}
                <div className="p-4 bg-accent rounded-2xl text-white shadow-[0_0_20px_rgba(var(--color-accent-rgb),0.3)]">
                  <RefreshCcw size={28} className={loading ? 'animate-spin' : ''} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic text-ink">
                    Intelligence Sync
                  </h3>
                  <p className="text-muted text-[10px] uppercase tracking-[0.2em] font-bold mt-1">
                    Global Endpoint Overrides
                  </p>
                </div>
              </div>

              <div className="space-y-8 relative z-10">
                {[
                  { label: 'Text Generation Key (Groq / Google / OpenAI)', placeholder: 'gsk_... or ai_...', key: 'textKey' },
                  { label: 'Image Generation Key (Cloudflare / OpenAI)', placeholder: 'ID:Token or sk-...', key: 'imageKey' }
                ].map(input => (
                  <div key={input.key} className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-accent/80 ml-1">
                      {input.label}
                    </label>
                    <input
                      type="password"
                      placeholder={input.placeholder}
                      // Changed: Integrated with theme variables for consistent dark mode look
                      className="w-full bg-paper border border-border rounded-2xl p-5 text-sm font-mono text-ink focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all placeholder:text-muted/30"
                      onChange={(e) => setSyncInputs({ ...syncInputs, [input.key]: e.target.value })}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleNeuralSync}
                  disabled={loading || !syncInputs.textKey}
                  // Changed: Button now adapts. In dark mode, it glows; in light mode, it's solid.
                  className="w-full py-6 bg-accent hover:brightness-110 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] transition-all disabled:opacity-30 disabled:grayscale shadow-lg shadow-accent/20 active:scale-[0.98]"
                >
                  {loading ? "Initializing Smart Mapping..." : "Re-Sync Neural Pool"}
                </button>
              </div>

              {/* Security Footer Note */}
              <div className="mt-8 flex justify-center items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-accent" />
                <span className="text-[8px] font-bold text-muted uppercase tracking-[0.2em]">Keys are encrypted at rest</span>
                <div className="h-1 w-1 rounded-full bg-accent" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AI STATUS (Providers) */}
        {activeTab === 'ai-status' && (
          <div className="space-y-10 animate-in fade-in duration-500 max-w-full">
            {/* HEADS UP DISPLAY */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-surface border border-border rounded-3xl p-6 lg:p-8 gap-8 w-full overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6 md:gap-16 w-full xl:w-auto">
                <div className="w-full md:w-auto">
                  <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-3">Primary Text</p>
                  <div className="flex items-center gap-4 text-xl md:text-2xl font-black text-ink uppercase italic tracking-tighter">
                    <span className="p-2 bg-paper rounded-lg border border-border shrink-0"><Cpu className="text-accent" /></span>
                    <div className="flex flex-col min-w-[200px]">
                      <select
                        value={settings.activeTextProvider}
                        onChange={(e) => setSettings({ ...settings, activeTextProvider: e.target.value })}
                        className="bg-transparent outline-none cursor-pointer hover:text-accent transition-colors"
                      >
                        {settings.aiProviders.filter(p => p.category === 'text').map(p => (
                          <option key={p.name} value={p.name} className="text-sm bg-paper text-ink">{p.name}</option>
                        ))}
                      </select>
                      <span className="text-[10px] font-mono text-muted not-italic tracking-normal opacity-70">
                        {settings.aiProviders.find(p => p.name === settings.activeTextProvider && p.category === 'text')?.textModel || "No Model Active"}
                      </span>
                    </div>
                  </div>
                  {/* Fallback Display */}
                  <p className="mt-1 text-[8px] font-mono text-muted/60 uppercase tracking-widest pl-1">
                    Fallback: {settings.aiProviders.find(p => p.name === settings.activeTextProvider && p.category === 'text')?.fallbackTextModel || "N/A"}
                  </p>
                </div>

                <div className="w-full md:w-auto">
                  <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-3">Primary Image</p>
                  <div className="flex items-center gap-4 text-xl md:text-2xl font-black text-ink uppercase italic tracking-tighter">
                    <span className="p-2 bg-paper rounded-lg border border-border shrink-0"><ImageIcon className="text-muted" /></span>
                    <div className="flex flex-col min-w-[200px]">
                      <select
                        value={settings.activeImageProvider}
                        onChange={(e) => setSettings({ ...settings, activeImageProvider: e.target.value })}
                        className="bg-transparent outline-none cursor-pointer hover:text-accent transition-colors"
                      >
                        {settings.aiProviders.filter(p => p.category === 'image').map(p => (
                          <option key={p.name} value={p.name} className="text-sm bg-paper text-ink">{p.name}</option>
                        ))}
                      </select>
                      <span className="text-[10px] font-mono text-muted not-italic tracking-normal opacity-70">
                        {settings.aiProviders.find(p => p.name === settings.activeImageProvider && p.category === 'image')?.imageModel || "No Model Active"}
                      </span>
                    </div>
                  </div>
                  {/* Fallback Display */}
                  <p className="mt-1 text-[8px] font-mono text-muted/60 uppercase tracking-widest pl-1">
                    Fallback: {settings.aiProviders.find(p => p.name === settings.activeImageProvider && p.category === 'image')?.fallbackImageModel || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 px-6 py-3 bg-green-500/10 rounded-2xl border border-green-500/20 w-full md:w-auto justify-center md:justify-start">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_var(--color-green-500)]" />
                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Core Nominal</span>
              </div>
            </div>

            {/* PROVIDER LIST */}
            <div className="grid grid-cols-1 gap-5">
              {settings?.aiProviders?.map((provider, idx) => (
                <div key={idx} className="group p-6 lg:p-8 bg-surface border border-border rounded-4xl hover:border-accent/40 transition-all">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">

                    {/* LEFT: Identity */}
                    <div className="flex items-center gap-5 md:gap-6 min-w-0">
                      <div className={`p-4 md:p-5 rounded-2xl border shrink-0 ${provider.category === 'text' ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20' : 'bg-paper text-ink border-border shadow-sm'}`}>
                        {provider.category === 'text' ? <Cpu size={24} className="md:w-7 md:h-7" /> : <ImageIcon size={24} className="md:w-7 md:h-7" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className="font-black text-ink uppercase text-lg md:text-xl italic tracking-tighter leading-none">{provider.provider}</h4>
                          {provider.metadata?.variant && (
                            <span className="px-3 py-1 bg-yellow-400/10 text-yellow-600 border border-yellow-400/20 rounded-full text-[8px] font-black uppercase tracking-widest italic whitespace-nowrap">
                              {provider.metadata.variant}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] md:text-[10px] font-mono text-muted mt-2 truncate w-full max-w-[200px] md:max-w-xs">{provider.baseUrl}</p>
                      </div>
                    </div>

                    {/* RIGHT: Controls (Responsive Grid) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 flex-1 xl:max-w-2xl xl:ml-12 bg-paper/50 p-5 md:p-6 rounded-3xl border border-border/50">

                      {/* MODEL SELECTOR (Spans 2 cols on mobile) */}
                      <div className="col-span-1 sm:col-span-2 space-y-2">
                        <p className="text-[8px] font-black text-muted uppercase tracking-[0.2em]">Active Model</p>
                        <div className="relative">
                          <select
                            value={provider.category === 'text' ? provider.textModel : provider.imageModel}
                            onChange={(e) => handleProviderModelChange(idx, provider.category === 'text' ? 'textModel' : 'imageModel', e.target.value)}
                            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-[10px] md:text-[11px] font-bold text-ink appearance-none outline-none focus:border-accent transition-all cursor-pointer pr-10 truncate"
                          >
                            {(provider.category === 'text' ? provider.availableTextModels : provider.availableImageModels)?.map(model => (
                              <option key={model} value={model}>{model}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                        </div>
                      </div>

                      <div className="col-span-1 sm:col-span-1">
                        <p className="text-[8px] font-black text-muted uppercase tracking-[0.2em] mb-1.5">Protocol</p>
                        <p className="text-[10px] md:text-[11px] uppercase text-ink font-bold truncate">{provider.payloadStructure}</p>
                      </div>

                      <div className="col-span-1 sm:col-span-1">
                        <p className="text-[8px] font-black text-muted uppercase tracking-[0.2em] mb-1.5">Status</p>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                          <p className="text-[10px] md:text-[11px] uppercase text-accent font-black tracking-widest italic">Live</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )) || <div className="p-24 text-center border-2 border-dashed border-border rounded-[3rem] text-muted uppercase font-black text-[10px] tracking-[0.4em] italic bg-surface/50">Null_Sequence: No AI Providers Synced</div>}
            </div>
          </div>
        )}

        {/* GLOBAL SAVE ACTION - DARK MODE OPTIMIZED */}
        <div className="mt-16 pt-10 border-t border-border flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`
              group relative overflow-hidden px-16 py-6 rounded-2xl font-black text-[11px] 
              uppercase tracking-[0.4em] transition-all duration-300 flex items-center gap-4
              active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed
              
              /* LIGHT MODE: Solid Ink */
              bg-ink text-white 
              
              /* DARK MODE: Neon Accent Border & Inner Glow */
              dark:bg-accent/10 dark:text-accent dark:border-2 dark:border-accent/50 
              dark:hover:bg-accent dark:hover:text-white dark:hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)]
            `}
          >
            {/* Subtle Loading Spinner Overlay */}
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} className="group-hover:scale-110 transition-transform" />
            )}

            <span className="relative z-10">
              {loading ? "SECURE_SYNCING..." : "COMMIT_CHANGES"}
            </span>

            {/* Reflection Beam - Only visible in Dark Mode hover */}
            <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default SystemSettings;