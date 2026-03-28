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
    PlayCircle,
    BookOpen,
    Plus,
    Edit,
    X
} from 'lucide-react';
import AdminModuleEditor from '../components/AdminModuleEditor';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [modules, setModules] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeToday: 0,
        level50Plus: 0,
        dungeonCompleted: 0,
        totalModules: 0,
        totalBlogs: 0
    });
    const [loading, setLoading] = useState(true);
    const [showModuleForm, setShowModuleForm] = useState(false);
    const [editingModule, setEditingModule] = useState<any>(null);

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

                const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'https://herocodebackend-ym9g.onrender.com/api';

                // İstifadəçiləri, matçları, modulları və blogları paralel çəkirik
                const [usersRes, matchesRes, modulesRes, blogsRes] = await Promise.all([
                    fetch(`${API_BASE}/admin/users`, { headers }),
                    fetch(`${API_BASE}/admin/matches`, { headers }),
                    fetch(`${API_BASE}/admin/modules`, { headers }),
                    fetch(`${API_BASE}/admin/blogs`, { headers })
                ]);

                const usersData = await usersRes.json();
                const matchesData = await matchesRes.json();
                const modulesData = await modulesRes.json();
                const blogsData = await blogsRes.json();

                if (usersData.success) {
                    setUsers(usersData.data);
                    const level50Count = usersData.data.filter((u: any) => u.level >= 50).length;
                    let finishedMatches = 0;
                    if (matchesData.success) {
                        finishedMatches = matchesData.data.filter((m: any) => m.status === 'Finished').length;
                    }

                    setStats({
                        totalUsers: usersData.data.length,
                        activeToday: Math.floor(usersData.data.length * 0.4),
                        level50Plus: level50Count,
                        dungeonCompleted: finishedMatches,
                        totalModules: modulesData.success ? modulesData.data.length : 0,
                        totalBlogs: blogsData.success ? blogsData.data.length : 0
                    });
                }

                if (modulesData.success) {
                    setModules(modulesData.data);
                }

                if (blogsData.success) {
                    setBlogs(blogsData.data);
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                        {[
                            { label: "Users", val: loading ? "..." : stats.totalUsers, icon: Users, color: "text-blue-400" },
                            { label: "Active Today", val: loading ? "..." : stats.activeToday, icon: PlayCircle, color: "text-[#00ff88]" },
                            { label: "Level 50+", val: loading ? "..." : stats.level50Plus, icon: Trophy, color: "text-yellow-400" },
                            { label: "Dungeons", val: loading ? "..." : stats.dungeonCompleted, icon: Code2, color: "text-purple-400" },
                            { label: "Modules", val: loading ? "..." : stats.totalModules, icon: BookOpen, color: "text-pink-400" },
                            { label: "Blogs", val: loading ? "..." : stats.totalBlogs, icon: Edit, color: "text-cyan-400" }
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

                    {/* TAB NAVIGATION */}
                    <div className="flex gap-2 border-b border-white/10">
                        {[
                            { id: 'users', label: 'Users', icon: Users },
                            { id: 'modules', label: 'Modules', icon: BookOpen },
                            { id: 'blogs', label: 'Blogs', icon: Edit }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 font-semibold flex items-center gap-2 transition-all border-b-2 ${
                                    activeTab === tab.id
                                        ? 'border-[#00ff88] text-[#00ff88]'
                                        : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* USERS TABLE */}
                    {activeTab === 'users' && (
                    <div className="bg-[#0f1713] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h2 className="font-bold flex items-center gap-2">
                                <Users size={18} className="text-[#00ff88]" /> User Management
                            </h2>
                            <div className="flex gap-2">
                                <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"><Filter size={18} /></button>
                                <button className="px-4 py-2 bg-[#00ff88] text-black font-bold text-xs rounded-lg hover:bg-[#00cc6e] transition-all">Export CSV</button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500 font-bold">Loading data...</div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-white/[0.02] text-gray-500 text-[10px] uppercase font-black tracking-[0.15em]">
                                        <tr>
                                            <th className="p-6">Player</th>
                                            <th className="p-6">Level & Status</th>
                                            <th className="p-6">Languages</th>
                                            <th className="p-6">Email</th>
                                            <th className="p-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {users.filter(u => (u.username || u.email).toLowerCase().includes(searchTerm.toLowerCase())).map((user: any) => {
                                            const displayUid = user._id ? user._id.slice(-6).toUpperCase() : "000000";
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
                                                            <span className="text-[10px] text-gray-400 uppercase">{user.isAdmin ? '✓ Admin' : 'User'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex flex-wrap gap-1">
                                                            {user.learnedLanguages && user.learnedLanguages.length > 0 ? (
                                                                user.learnedLanguages.map((lang: any) => (
                                                                    <span key={lang.language} className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                                                        {lang.language}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-[10px] text-gray-500">None</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-xs text-gray-400 font-mono italic">
                                                        {user.email}
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button className="p-2 hover:bg-white/5 rounded-lg text-blue-400" title="View"><ExternalLink size={16} /></button>
                                                            <button className="p-2 hover:bg-white/5 rounded-lg text-yellow-400" title="Toggle Admin"><Lock size={16} /></button>
                                                            <button 
                                                                className="p-2 hover:bg-red-500/10 rounded-lg text-red-500" 
                                                                title="Delete"
                                                                onClick={() => handleDeleteUser(user._id)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
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
                    )}

                    {/* MODULES TABLE */}
                    {activeTab === 'modules' && (
                    <div className="bg-[#0f1713] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h2 className="font-bold flex items-center gap-2">
                                <BookOpen size={18} className="text-pink-400" /> Module Management
                            </h2>
                            <button 
                                onClick={() => {
                                    setEditingModule(null);
                                    setShowModuleForm(true);
                                }}
                                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-2"
                            >
                                <Plus size={16} /> Create Module
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500 font-bold">Loading modules...</div>
                            ) : modules.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No modules created yet. Start by creating one!</div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-white/[0.02] text-gray-500 text-[10px] uppercase font-black tracking-[0.15em]">
                                        <tr>
                                            <th className="p-6">Title</th>
                                            <th className="p-6">Language</th>
                                            <th className="p-6">Difficulty</th>
                                            <th className="p-6">Questions</th>
                                            <th className="p-6">Tags</th>
                                            <th className="p-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {modules.map((module: any) => (
                                            <tr key={module._id} className="group hover:bg-white/[0.01] transition-colors">
                                                <td className="p-6">
                                                    <p className="font-bold text-sm">{module.title}</p>
                                                    <p className="text-[10px] text-gray-500 line-clamp-1">{module.description}</p>
                                                </td>
                                                <td className="p-6">
                                                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                                        {module.language}
                                                    </span>
                                                </td>
                                                <td className="p-6">
                                                    <span className={`text-[10px] px-2 py-1 rounded ${
                                                        module.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                                                        module.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }`}>
                                                        {module.difficulty}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-sm font-semibold">{module.questions?.length || 0}</td>
                                                <td className="p-6">
                                                    <div className="flex flex-wrap gap-1">
                                                        {module.tags?.slice(0, 2).map((tag: string) => (
                                                            <span key={tag} className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {module.tags?.length > 2 && (
                                                            <span className="text-[10px] text-gray-500">+{module.tags.length - 2}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => {
                                                                setEditingModule(module);
                                                                setShowModuleForm(true);
                                                            }}
                                                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400"
                                                            title="Edit"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button 
                                                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                                                            title="Delete"
                                                            onClick={async () => {
                                                                if (!window.confirm('Delete this module?')) return;
                                                                try {
                                                                    const token = localStorage.getItem('token');
                                                                    const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'https://herocodebackend-ym9g.onrender.com/api';
                                                                    const response = await fetch(`${API_BASE}/modules/${module._id}`, {
                                                                        method: 'DELETE',
                                                                        headers: { 'Authorization': `Bearer ${token}` }
                                                                    });
                                                                    if (response.ok) {
                                                                        setModules(modules.filter((m: any) => m._id !== module._id));
                                                                    }
                                                                } catch (err) {
                                                                    console.error(err);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                    )}

                    {/* BLOGS TABLE */}
                    {activeTab === 'blogs' && (
                    <div className="bg-[#0f1713] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h2 className="font-bold flex items-center gap-2">
                                <Edit size={18} className="text-cyan-400" /> Blog Management
                            </h2>
                            <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-2">
                                <Plus size={16} /> Create Blog
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            {loading ? (
                                <div className="p-8 text-center text-gray-500 font-bold">Loading blogs...</div>
                            ) : blogs.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No blogs created yet</div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-white/[0.02] text-gray-500 text-[10px] uppercase font-black tracking-[0.15em]">
                                        <tr>
                                            <th className="p-6">Title</th>
                                            <th className="p-6">Author</th>
                                            <th className="p-6">Category</th>
                                            <th className="p-6">Reads</th>
                                            <th className="p-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {blogs.map((blog: any) => (
                                            <tr key={blog._id} className="group hover:bg-white/[0.01] transition-colors">
                                                <td className="p-6">
                                                    <p className="font-bold text-sm">{blog.title}</p>
                                                </td>
                                                <td className="p-6 text-sm">
                                                    {blog.author?.username || 'Unknown'}
                                                </td>
                                                <td className="p-6">
                                                    <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                                                        {blog.category || 'General'}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-sm">{blog.reads || 0}</td>
                                                <td className="p-6 text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-2 hover:bg-white/5 rounded-lg text-blue-400"><Edit size={16} /></button>
                                                        <button className="p-2 hover:bg-red-500/10 rounded-lg text-red-500"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                    )}

                    {/* MODULE EDITOR MODAL */}
                    {showModuleForm && (
                        <AdminModuleEditor 
                            onClose={() => {
                                setShowModuleForm(false);
                                setEditingModule(null);
                            }}
                            onSave={async (moduleData) => {
                                try {
                                    const token = localStorage.getItem('token');
                                    const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || 'https://herocodebackend-ym9g.onrender.com/api';
                                    
                                    const method = editingModule ? 'PUT' : 'POST';
                                    const url = editingModule 
                                        ? `${API_BASE}/modules/${editingModule._id}`
                                        : `${API_BASE}/modules`;

                                    const response = await fetch(url, {
                                        method,
                                        headers: {
                                            'Authorization': `Bearer ${token}`,
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify(moduleData)
                                    });

                                    const data = await response.json();
                                    if (data.success || response.ok) {
                                        // Refresh modules list from API
                                        const modulesRes = await fetch(`${API_BASE}/admin/modules`, {
                                            headers: { 'Authorization': `Bearer ${token}` }
                                        });
                                        const modulesData = await modulesRes.json();
                                        if (modulesData.success) {
                                            setModules(modulesData.data);
                                        }
                                        setShowModuleForm(false);
                                        setEditingModule(null);
                                    }
                                } catch (error) {
                                    console.error('Error saving module:', error);
                                }
                            }}
                            initialData={editingModule}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;