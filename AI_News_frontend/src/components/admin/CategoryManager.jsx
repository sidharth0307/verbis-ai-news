import React, { useState, useEffect } from 'react';
import { Plus, Tag, Search, Activity, Trash2, Edit3, X, Save, Globe, Link, AlertTriangle, Terminal } from 'lucide-react';
import categoryApi from '../../api/categories';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  // slug to formData
  const [formData, setFormData] = useState({ name: '', slug: '', searchQuery: '', isActive: true });

  // Migration State
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [migrationData, setMigrationData] = useState({ id: '', name: '', migrateToId: '',count: 0 });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setIsEditing(category._id);
      setFormData({ 
        name: category.name, 
        slug: category.slug, // Map existing slug
        searchQuery: category.searchQuery, 
        isActive: category.isActive 
      });
    } else {
      setIsEditing(null);
      setFormData({ name: '', slug: '', searchQuery: '', isActive: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await categoryApi.update(isEditing, formData);
      } else {
        await categoryApi.create(formData);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };


  const handleDelete = async (id, name, migrateToId = null) => {
  try {
    // 1. Build URL (supports migration via query param)
    const url = migrateToId ? `${id}?migrateToId=${migrateToId}` : id;

    // 2. Execute Delete
    await categoryApi.delete(url); 
    
    // 3. Reset and Refresh
    setShowMigrationModal(false);
    setMigrationData({ id: '', name: '', migrateToId: '', count: 0 });
    fetchCategories();
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.message || "";

    // 4. Handle Migration Trigger (Status 400)
    if (status === 400 && (msg.includes("MIGRATE_NEEDED") || msg.includes("articles"))) {
      // Extract the article count from the backend message string
      const match = msg.match(/(\d+)/);
      const articleCount = match ? match[0] : "Multiple";

      // Consolidate state update (Don't call this twice!)
      setMigrationData({ 
        id, 
        name, 
        migrateToId: '', 
        count: articleCount 
      });

      setShowMigrationModal(true);
    } else {
      // Handle actual errors (500, 404, etc.)
      alert(msg || "Failed to delete category");
    }
  }
};


  const toggleStatus = async (category) => {
    try {
      await categoryApi.update(category._id, { isActive: !category.isActive });
      fetchCategories();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="p-10 text-center font-mono text-[10px] uppercase tracking-widest">Accessing Silo Database...</div>;

  return (
    <div className="w-full bg-paper rounded-[2.5rem] border border-border overflow-hidden shadow-sm animate-in fade-in duration-700">
      
      {/* 1. HEADER SECTION */}
      <div className="px-6 md:px-10 py-10 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-surface/30">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <Activity size={20} />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-ink uppercase italic tracking-tighter">
              Category <span className="text-accent">Silos</span>
            </h2>
          </div>
          <p className="font-mono text-[10px] text-muted uppercase tracking-[0.2em] ml-1">
            Intelligence Classification Control
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="w-full md:w-auto bg-ink dark:bg-accent text-white px-8 py-4 font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-accent/10 active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={16} strokeWidth={3} /> Create New Category
        </button>
      </div>

      {/* 2. INTELLIGENCE TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface/50 border-b border-border">
              <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.3em]">Designation</th>
              <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.3em] hidden md:table-cell">Search Logic</th>
              <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.3em]">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-[0.3em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {categories.map((cat) => (
              <tr key={cat._id} className="hover:bg-accent/2 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-ink text-lg tracking-tight">{cat.name}</p>
                    <div className="flex items-center gap-2">
                      <Terminal size={10} className="text-accent" />
                      <code className="text-[10px] font-mono text-accent font-bold uppercase tracking-tighter bg-accent/5 px-2 py-0.5 rounded">
                        /{cat.slug}
                      </code>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 hidden md:table-cell">
                  <div className="bg-surface border border-border p-3 rounded-xl max-w-xs group-hover:border-accent/30 transition-colors">
                    <p className="text-[10px] font-mono text-muted italic line-clamp-1">{cat.searchQuery}</p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <button 
                    onClick={() => toggleStatus(cat)}
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-offset-paper ${cat.isActive ? 'bg-accent ring-accent/20' : 'bg-muted/20 ring-transparent'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cat.isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => handleOpenModal(cat)} className="p-3 rounded-xl bg-surface border border-border text-muted hover:text-accent hover:border-accent transition-all active:scale-90">
                      <Edit3 size={16}/>
                    </button>
                    <button onClick={() => handleDelete(cat._id, cat.name)} className="p-3 rounded-xl bg-surface border border-border text-muted hover:text-red-500 hover:border-red-500 transition-all active:scale-90">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. ENTRY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-ink/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-paper border border-border w-full max-w-md p-8 md:p-10 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-ink uppercase italic mb-8 tracking-tighter">
              {isEditing ? 'Update Category' : 'New Category Entry'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                  <Tag size={12} className="text-accent" /> Display Name
                </label>
                <input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-surface border border-border rounded-2xl p-4 font-bold text-ink focus:border-accent outline-none transition-all placeholder:opacity-20"
                  placeholder="E.G. QUANTUM COMPUTING"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                  <Link size={12} className="text-accent" /> URL Slug
                </label>
                <input 
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  className="w-full bg-surface/50 border border-border rounded-2xl p-4 font-mono text-[11px] text-accent outline-none focus:border-accent"
                  placeholder="quantum-computing"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                  <Search size={12} className="text-accent" /> Search Parameters
                </label>
                <textarea 
                  value={formData.searchQuery}
                  onChange={(e) => setFormData({...formData, searchQuery: e.target.value})}
                  className="w-full bg-surface border border-border rounded-2xl p-4 font-mono text-xs h-24 focus:border-accent outline-none transition-all"
                  placeholder='e.g. "Artificial Intelligence" OR "OpenAI"'
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-2 bg-ink dark:bg-accent text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:brightness-110 transition-all shadow-lg shadow-accent/10 active:scale-95">
                  {isEditing ? 'Sync Changes' : 'Authorize Silo'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-surface border border-border text-muted rounded-2xl font-black uppercase text-[10px] hover:text-ink transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MIGRATION MODAL */}
      {showMigrationModal && (
        <div className="fixed inset-0 z-160 flex items-center justify-center bg-red-950/40 backdrop-blur-xl p-4">
          <div className="bg-paper border border-red-500/50 w-full max-w-md p-10 rounded-[3rem] shadow-[0_0_50px_rgba(239,68,68,0.2)]">
            <div className="flex items-center gap-4 text-red-500 mb-6">
              <div className="p-3 bg-red-500/10 rounded-2xl">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-2xl font-black uppercase italic tracking-tighter">Decommission Alert</h3>
            </div>
            
            <p className="text-[11px] font-bold text-muted mb-8 uppercase leading-relaxed tracking-wide">
              Category <span className="text-ink font-black underline">"{migrationData.name}"</span> holds 
              <span className="text-accent font-black mx-1">[{migrationData.count}]</span> reports. 
              Redirect data stream before purge.
            </p>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-muted tracking-widest ml-1">Target Category</label>
                <select 
                  className="w-full bg-surface border border-border rounded-2xl p-5 font-mono text-xs text-ink focus:border-red-500 outline-none appearance-none cursor-pointer"
                  value={migrationData.migrateToId}
                  onChange={(e) => setMigrationData({...migrationData, migrateToId: e.target.value})}
                >
                  <option value="">-- SELECT TARGET --</option>
                  {categories
                    .filter(c => c._id !== migrationData.id)
                    .map(c => (
                      <option key={c._id} value={c._id}>{c.name.toUpperCase()}</option>
                    ))
                  }
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  disabled={!migrationData.migrateToId}
                  onClick={() => handleDelete(migrationData.id, migrationData.name, migrationData.migrateToId)}
                  className={`py-6 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] transition-all active:scale-95 ${
                    migrationData.migrateToId 
                    ? 'bg-red-600 text-white shadow-xl shadow-red-500/20 hover:bg-red-700' 
                    : 'bg-surface text-muted cursor-not-allowed opacity-50'
                  }`}
                >
                  Confirm & Purge
                </button>
                <button 
                  onClick={() => setShowMigrationModal(false)}
                  className="py-4 text-muted font-black uppercase text-[10px] tracking-widest hover:text-ink transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;