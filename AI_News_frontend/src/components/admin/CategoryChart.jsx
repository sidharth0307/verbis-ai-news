import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { Info, LayoutGrid } from 'lucide-react';

export default function CategoryChart({ distribution }) {
  const chartData = useMemo(() => {
    if (!distribution) return [];
    return [...distribution]
      .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
      .map(item => ({
        ...item,
        value: parseFloat(item.value || 0)
      }));
  }, [distribution]);

  if (chartData.length === 0) return null;

  // Custom Tooltip for a more "Designer" feel
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white px-4 py-3 shadow-2xl border-l-4 border-blue-500 animate-in fade-in zoom-in duration-200">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Category Stats</p>
          <p className="text-sm font-bold uppercase">{payload[0].payload.name}</p>
          <p className="text-xl font-mono mt-1">{payload[0].value} <span className="text-xs text-slate-400">Items</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-paper border border-border rounded-[2.5rem] p-10 h-162.5 flex flex-col relative overflow-hidden group shadow-sm transition-all duration-300">
      
      {/* Decorative Branding - Softened for v4 Theme */}
      <div className="absolute -top-2.5 -right-2.5 text-surface font-black text-[100px] pointer-events-none select-none group-hover:text-accent/5 transition-colors leading-none uppercase">
        Data
      </div>

      {/* Header Section */}
      <div className="relative z-10 flex justify-between items-start mb-12">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-1 w-10 bg-accent rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted">Stock Inventory</span>
          </div>
          <h3 className="text-4xl font-serif italic text-ink tracking-tight">Content Density</h3>
        </div>
        <div className="bg-accent/10 p-4 rounded-2xl text-accent shadow-sm group-hover:rotate-6 transition-transform">
          <LayoutGrid size={22} />
        </div>
      </div>

      {/* Chart Body with Custom Scrollbar */}
      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar scroll-smooth">
        <div style={{ height: Math.max(chartData.length * 50, 400) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              layout="vertical" 
              margin={{ left: 10, right: 40 }}
              barGap={12}
            >
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={130}
                tick={{ 
                  fontSize: 10, 
                  fontWeight: 800, 
                  fill: 'var(--color-muted)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em' 
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'var(--color-surface)', radius: 8 }} 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-paper border border-border p-3 rounded-xl shadow-xl">
                        <p className="text-[10px] font-black text-muted uppercase mb-1">{payload[0].payload.name}</p>
                        <p className="text-sm font-mono font-bold text-accent">{payload[0].value.toLocaleString()} Articles</p>
                      </div>
                    );
                  }
                  return null;
                }} 
              />
              
              <Bar 
                dataKey="value" 
                radius={[0, 20, 20, 0]} 
                barSize={14}
                animationDuration={1500}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    // v4 Dynamic Variable Mapping
                    fill={index === 0 ? 'var(--color-accent)' : 'var(--color-ink)'}
                    fillOpacity={index < 3 ? 1 : 0.2}
                    className="transition-all duration-500 hover:fill-opacity-100"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* v4 Compatible Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: var(--color-border); 
          border-radius: 20px; 
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: var(--color-muted);
        }
      `}} />
    </div>
  );
}