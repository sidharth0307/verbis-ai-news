import React from 'react';
import {  Zap,   Activity, ChevronRight, Info, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, PieChart, Pie } from 'recharts';

export default function StatsGrid({ data }) {
  // 1. Safeguard check to prevent crash if data is loading
  if (!data || !data.content) return <div className="p-10 text-slate-400 font-black italic">INITIALIZING_DATA...</div>;

  const stats = [
    { label: "Total Readers", value: data.users.total, sub: `${data.users.today} today`, color: "bg-blue-600" },
    { label: "Library Size", value: data.content.total, sub: `${data.content.today} today`, color: "bg-slate-900" },
    { label: "Content Reach", value: data.content.totalViews, sub: "Total Views", color: "bg-blue-600" },
    { label: "Engagement", value: data.users.engagement.avgSaved?.toFixed(1) || "0.0", sub: "Avg Saves", color: "bg-slate-900" },
    { label: "Live Sources", value: data.ingestion.activeRulesCount, sub: "Active Rules", color: "bg-blue-600" },
  ];

  return (
    <div className="space-y-16 max-w-400 mx-auto pb-32">
      
      {/* SECTION 1: STUDIO METRICS GRID (No Borders, Soft Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className="group relative p-8 bg-paper rounded-4xl border border-border shadow-sm shadow-black/5 hover:shadow-xl hover:shadow-accent/5 transition-all duration-500 overflow-hidden"
          >
            {/* Soft Ambient Glow on Hover */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors" />
            
            <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <h3 className="text-4xl font-black text-ink tracking-tighter leading-none mb-4 group-hover:text-accent transition-colors">
              {stat.value?.toLocaleString()}
            </h3>
            <div className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-accent" />
              <p className="text-[20px] font-serif italic text-accent font-bold tracking-tight">
                {stat.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 2: GLOBAL HEADLINES (Modern Bar Chart with Glassmorphism) */}
      <div className="grid grid-cols-1 gap-12">
        <div className="p-10 bg-paper rounded-[3rem] border border-border shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-border pb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted">Views Analytics</span>
              </div>
              <h2 className="text-5xl font-serif italic text-ink leading-none">Global Headlines</h2>
            </div>
          </div>

          <div className="h-112.5 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.content.topArticles} layout="vertical" margin={{ left: 20, right: 40 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="label" 
                  type="category" 
                  tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '1px' }} 
                  width={160} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--color-surface)', radius: 10 }} 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-paper)', 
                    borderRadius: '16px', 
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    color: 'var(--color-ink)' 
                  }} 
                />
                <Bar dataKey="views" barSize={12} radius={[0, 10, 10, 0]}>
                  {data.content.topArticles.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? 'var(--color-accent)' : 'var(--color-muted)'} 
                      className="transition-all duration-500 hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 3: TAXONOMY RANKING (Elegant Index) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-start">
        <div className="lg:sticky lg:top-32 space-y-6">
          <div className="inline-flex p-3 bg-accent/10 rounded-2xl text-accent mb-4">
            <Info size={24} />
          </div>
          <h2 className="text-6xl font-serif italic text-ink leading-[0.9]">Category<br/>Ranking</h2>
          <p className="text-muted text-sm max-w-[320px] leading-relaxed font-medium">
            Strategic breakdown of category resonance based on neural ingestion patterns and user engagement density.
          </p>
          <div className="flex gap-1">
            <div className="h-1 w-12 rounded-full bg-accent" />
            <div className="h-1 w-4 rounded-full bg-border" />
            <div className="h-1 w-2 rounded-full bg-border" />
          </div>
        </div>

        <div className="bg-paper border border-border rounded-[3rem] p-10 shadow-sm overflow-hidden">
          <div className="divide-y divide-border">
            {data.content.categoryRanking.map((cat, i) => (
              <div 
                key={i} 
                className="flex flex-col md:flex-row justify-between items-center group py-8 hover:bg-surface/50 transition-all px-6 -mx-6 first:pt-0 last:pb-0 rounded-2xl"
              >
                <div className="flex items-center gap-8 mb-4 md:mb-0">
                  <span className="font-mono text-xs font-black text-muted group-hover:text-accent transition-colors">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-black uppercase tracking-[0.2em] text-ink">{cat.name}</span>
                </div>
                
                <div className="flex gap-16 items-center">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-1">Articles</p>
                    <p className="text-base font-mono font-bold text-ink">{cat.articleCount}</p>
                  </div>
                  <div className="text-right min-w-25">
                    <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-1">Global Views</p>
                    <p className="text-base font-mono font-bold text-ink leading-none">
                      {cat.totalViews.toLocaleString()}
                    </p>
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}