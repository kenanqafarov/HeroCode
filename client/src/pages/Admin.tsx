import React, { useState, useEffect } from 'react';
import {
    Users,
    ShieldCheck,
    Search,
    Filter,
    MoreVertical,
    Code2,
    ExternalLink,
    Trash2,
    Lock,
    Trophy,
    PlayCircle
} from 'lucide-react';

const AdminPanel = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeToday: 0,
        level50Plus: 0,
        dungeonCompleted: 0
    });
    const [loading, setLoading] = useState(true);

    // Backend-dən məlumatları çəkmək üçün
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Token-i localStorage-dən götürürük (auth middleware-dən keçmək üçün)
                const token = localStorage.getItem('token'); 
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                // İstifadəçiləri və matçları paralel çəkirik
                const [usersRes, matchesRes] = await Promise.all([
                    fetch('/api/admin/users', { headers }),
                    fetch('/api/admin/matches', { headers })
                ]);

                const usersData = await usersRes.json();
                const matchesData = await matchesRes.json();

                if (usersData.success) {
                    setUsers(usersData.data);

                    // Statistikaları backend datasına əsasən hesablayırıq
                    const level50Count = usersData.data.filter(u => u.level >= 50).length;
                    
                    let finishedMatches = 0;
                    if (matchesData.success) {
                        finishedMatches = matchesData.data.filter(m => m.status === 'Finished').length;
                    }

                    setStats({
                        totalUsers: usersData.data.length,
                        activeToday: Math.floor(usersData.data.length * 0.4), // Simulyasiya: Aktiv istifadəçilər
                        level50Plus: level50Count,
                        dungeonCompleted: finishedMatches
                    });
                }
            } catch (error) {
                console.error("Məlumatlar çəkilərkən xəta baş verdi:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // İstifadəçini silmək funksiyası
    const handleDeleteUser = async (id) => {
        if (!window.confirm("Tatlım, bu istifadəçini həqiqətən silmək istədiyinə əminsən?")) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await res.json();
            
            if (data.success) {
                // Uğurla silindikdə UI-dan da silirik
                setUsers(users.filter(user => user._id !== id));
            } else {
                alert(data.message || "Silinmə zamanı xəta oldu.");
            }
        } catch (error) {
            console.error("İstifadəçi silinərkən xəta baş verdi:", error);
        }
    };

    // Skill level-i UI üçün progress bar formatına salan köməkçi funksiya
    const getSkillProgress = (skillLevel) => {
        switch (skillLevel) {
            case 'expert': return { name: 'Expert', progress: 100, color: 'bg-purple-500' };
            case 'advanced': return { name: 'Advanced', progress: 75, color: 'bg-green-500' };
            case 'intermediate': return { name: 'Intermediate', progress: 50, color: 'bg-yellow-500' };
            case 'beginner': default: return { name: 'Beginner', progress: 25, color: 'bg-blue-500' };
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0f0d] text-white font-sans selection:bg-green-500/30">
            {/* Background Decoration */}
            <div className="fixed inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_50%_0%,#00ff8822,transparent_50%)]" />

            <div className="relative flex flex-col min-h-screen">

                {/* ADMIN TOP NAVBAR */}
                <header className="h-20 border-b border-white/5 bg-[#0c120f]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <ShieldCheck className="text-purple-400" size={24} />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight">Admin Dashboard</h1>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">HeroCode Control Center</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input
                                type="text"
                                placeholder="İstifadəçi axtar..."
                                className="bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:border-purple-500 outline-none w-64 transition-all"
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold">Admin_User</p>
                                <p className="text-[10px] text-[#00ff88]">Süper Admin</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center font-bold">A</div>
                        </div>
                    </div>
                </header>

                <main className="p-8 max-w-7xl mx-auto w-full space-y-8">

                    {/* STAT CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Ümumi Oyunçu", val: loading ? "..." : stats.totalUsers, icon: Users, color: "text-blue-400" },
                            { label: "Aktiv (Bugün)", val: loading ? "..." : stats.activeToday, icon: PlayCircle, color: "text-[#00ff88]" },
                            { label: "Level 50+ Oyunçular", val: loading ? "..." : stats.level50Plus, icon: Trophy, color: "text-yellow-400" },
                            { label: "Dungeon Tamamlanma", val: loading ? "..." : stats.dungeonCompleted, icon: Code2, color: "text-purple-400" }
                        ].map((stat, i) => (
                            <div key={i} className="bg-[#0f1713] border border-white/5 p-5 rounded-2xl shadow-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 bg-white/5 rounded-lg ${stat.color}`}>
                                        <stat.icon size={20} />
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-bold">+12%</span>
                                </div>
                                <p className="text-2xl font-black italic">{stat.val}</p>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* USERS TABLE */}
                    <div className="bg-[#0f1713] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h2 className="font-bold flex items-center gap-2">
                                <Users size={18} className="text-[#00ff88]" /> İstifadəçi Siyahısı
                            </h2>
                            <div className="flex gap-2">
                                <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"><Filter size={18} /></button>
                                <button className="px-4 py-2 bg-[#00ff88] text-black font-bold text-xs rounded-lg hover:bg-[#00cc6e] transition-all">Export CSV</button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500 font-bold">Məlumatlar yüklənir...</div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-white/[0.02] text-gray-500 text-[10px] uppercase font-black tracking-[0.15em]">
                                        <tr>
                                            <th className="p-6">Oyunçu</th>
                                            <th className="p-6">Səviyyə & Status</th>
                                            <th className="p-6">Dil Bacarıqları (Tərəqqi)</th>
                                            <th className="p-6">E-poçt</th>
                                            <th className="p-6 text-right">Əməliyyat</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {users.filter(u => (u.username || u.email).toLowerCase().includes(searchTerm.toLowerCase())).map((user) => {
                                            const userSkill = getSkillProgress(user.skillLevel);
                                            // UID üçün MongoDB id-nin son 6 simvolunu götürürük
                                            const displayUid = user._id ? user._id.slice(-6).toUpperCase() : "000000";
                                            // Əgər username yoxdursa email-dən bir hissəni göstəririk
                                            const displayName = user.username || user.email.split('@')[0];

                                            return (
                                                <tr key={user._id} className="group hover:bg-white/[0.01] transition-colors">
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl border-2 border-white/10 overflow-hidden group-hover:border-[#00ff88]/50 transition-all">
                                                                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${displayName}`} alt={displayName} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm">{displayName}</p>
                                                                <p className="text-[10px] text-gray-500 uppercase tracking-tighter italic">UID: #{displayUid}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[#00ff88] font-black italic">LVL {user.level || 1}</span>
                                                            <div className="flex items-center gap-1.5">
                                                                {/* Admin isAdmin olduqda Online simulyasiyası */}
                                                                <div className={`w-1.5 h-1.5 rounded-full ${user.isAdmin ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-600'}`} />
                                                                <span className="text-[10px] text-gray-400 font-bold uppercase">{user.isAdmin ? 'Online' : 'Offline'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex flex-col gap-3 min-w-[150px]">
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                                                                    <span>{userSkill.name}</span>
                                                                    <span className="text-gray-500">{userSkill.progress}%</span>
                                                                </div>
                                                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full ${userSkill.color} rounded-full`}
                                                                        style={{ width: `${userSkill.progress}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-xs text-gray-400 font-mono italic">
                                                        {user.email}
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button className="p-2 hover:bg-white/5 rounded-lg text-blue-400" title="Profilə bax"><ExternalLink size={16} /></button>
                                                            <button className="p-2 hover:bg-white/5 rounded-lg text-yellow-400" title="Blokla"><Lock size={16} /></button>
                                                            <button 
                                                                className="p-2 hover:bg-red-500/10 rounded-lg text-red-500" 
                                                                title="Sil"
                                                                onClick={() => handleDeleteUser(user._id)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                            <button className="p-2 hover:bg-white/5 rounded-lg text-gray-400"><MoreVertical size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;