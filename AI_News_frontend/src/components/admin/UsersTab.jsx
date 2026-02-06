import React, { useState, useEffect } from 'react';
import { userApi } from '../../api/users';
import toast from 'react-hot-toast';
import { Trash2, UserX, UserCheck, Shield, Mail, Calendar, Search } from 'lucide-react';
import { format } from 'date-fns';

const UsersTab = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userApi.getAllUsers();
            setUsers(data);
        } catch (err) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
        try {
            await userApi.deleteUser(id);
            setUsers(users.filter(u => u._id !== id));
            toast.success("User deleted successfully");
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const { user } = await userApi.toggleStatus(id);
            setUsers(users.map(u => u._id === id ? { ...u, isActive: user.isActive } : u));
            toast.success(`User ${user.isActive ? 'enabled' : 'disabled'}`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Status update failed");
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface/50 border border-border p-6 rounded-[2.5rem]">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter italic text-ink">User Database</h2>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">
                        Total Records: {users.length}
                    </p>
                </div>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 bg-paper border border-border rounded-xl pl-12 pr-4 py-3 text-xs font-bold text-ink focus:border-accent outline-none transition-all placeholder:text-muted/50"
                    />
                </div>
            </div>

            {/* Users List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="p-12 text-center text-muted font-mono text-xs animate-pulse">Loading User Directory...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-border rounded-[2rem] text-muted text-xs font-bold uppercase tracking-widest">
                        No users found matching query
                    </div>
                ) : (
                    filteredUsers.map(user => (
                        <div key={user._id} className={`group relative overflow-hidden bg-surface border border-border rounded-3xl p-6 transition-all hover:border-accent/30 ${!user.isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}>

                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                                {/* User Info */}
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${user.role === 'admin' ? 'bg-accent text-white' : 'bg-paper text-muted border border-border'}`}>
                                        {user.role === 'admin' ? <Shield size={20} /> : <span className="text-lg font-black">{user.name.charAt(0)}</span>}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-ink text-lg">{user.name}</h3>
                                            {user.role === 'admin' && (
                                                <span className="px-2 py-0.5 bg-accent/10 text-accent text-[9px] font-black uppercase tracking-widest rounded-md border border-accent/20">
                                                    Admin
                                                </span>
                                            )}
                                            {!user.isActive && (
                                                <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest rounded-md border border-red-500/20">
                                                    Disabled
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                                            <div className="flex items-center gap-1.5 text-muted text-xs">
                                                <Mail size={12} />
                                                <span className="font-mono">{user.email}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-muted text-[10px] font-medium uppercase tracking-wider">
                                                <Calendar size={10} />
                                                Joined {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 self-end lg:self-center">
                                    {user.role !== 'admin' && (
                                        <>
                                            <button
                                                onClick={() => handleToggleStatus(user._id)}
                                                className={`p-3 rounded-xl border transition-all ${user.isActive ? 'bg-paper border-border text-muted hover:text-yellow-600 hover:border-yellow-600/30' : 'bg-green-500/10 border-green-500/20 text-green-600'}`}
                                            >
                                                {user.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="p-3 bg-red-500/5 border border-transparent hover:border-red-500/30 text-red-500/50 hover:text-red-600 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>

                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default UsersTab;
