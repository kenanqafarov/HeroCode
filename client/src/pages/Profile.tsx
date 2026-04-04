import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    BadgeCheck,
    Calendar,
    Edit3,
    LogOut,
    Mail,
    Save,
    Shield,
    User2,
    X,
    Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PixelCharacter, { ClothingType, EmotionType } from '../components/PixelCharacter';
import { userAPI } from '../services/api';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface LearnedLanguage {
    language: string;
    level: 'beginner' | 'intermediate' | 'advanced';
}

interface ApiUser {
    _id?: string;
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    skillLevel?: SkillLevel;
    xp?: number;
    level?: number;
    isAdmin?: boolean;
    createdAt?: string;
    learnedLanguages?: LearnedLanguage[];
    character?: {
        gender?: 'male' | 'female';
        emotion?: EmotionType;
        clothing?: ClothingType;
        hairColor?: string;
        skin?: string;
        clothingColor?: string;
        username?: string;
    };
}

const fallbackCharacter = {
    gender: 'male' as const,
    emotion: 'neutral' as EmotionType,
    clothing: 'tshirt' as ClothingType,
    hairColor: '#b96321',
    skin: '#ffdbac',
    clothingColor: '#3b82f6',
};

const levelBadgeMap: Record<SkillLevel, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    expert: 'Expert',
};

const emotionOptions: EmotionType[] = ['neutral', 'happy', 'angry', 'sad', 'surprised'];
const clothingOptions: ClothingType[] = ['tshirt', 'hoodie', 'jacket', 'dress'];
const skillLevelOptions: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
const hairColorOptions = ['#b96321', '#212121', '#6d4c41', '#f44336', '#ffffff', '#a855f7', '#fbbf24', '#14b8a6'];
const outfitColorOptions = ['#22c55e', '#3b82f6', '#ec4899', '#f97316', '#334155', '#a855f7', '#14b8a6', '#e11d48'];
const skinToneOptions = ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3a21'];

const activeModulePlaceholders = [
    { name: 'Spring Boot and REST APIs', progress: 68, status: 'Active' },
    { name: 'JavaScript Core Challenges', progress: 42, status: 'Active' },
    { name: 'Backend Architecture Basics', progress: 15, status: 'Not Started' },
];

const formatDate = (value?: string) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleDateString();
};

const readStoredUser = () => {
    try {
        const raw = localStorage.getItem('currentUserData');
        return raw ? (JSON.parse(raw) as ApiUser) : null;
    } catch {
        return null;
    }
};

const normalizeCharacter = (user?: ApiUser | null) => ({
    gender: user?.character?.gender ?? fallbackCharacter.gender,
    emotion: user?.character?.emotion ?? fallbackCharacter.emotion,
    clothing: user?.character?.clothing ?? fallbackCharacter.clothing,
    hairColor: user?.character?.hairColor ?? fallbackCharacter.hairColor,
    skin: user?.character?.skin ?? fallbackCharacter.skin,
    clothingColor: user?.character?.clothingColor ?? fallbackCharacter.clothingColor,
});

const ProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saveNote, setSaveNote] = useState('');
    const [user, setUser] = useState<ApiUser | null>(readStoredUser());
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isEditingCharacter, setIsEditingCharacter] = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);
    const [characterSaving, setCharacterSaving] = useState(false);
    const [profileDraft, setProfileDraft] = useState({
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        skillLevel: 'beginner' as SkillLevel,
    });
    const [characterDraft, setCharacterDraft] = useState(normalizeCharacter(user));

    useEffect(() => {
        let isMounted = true;

        const loadUser = async () => {
            setLoading(true);
            setError('');

            try {
                const res = await userAPI.getMe();
                const fetchedUser = (res?.data || null) as ApiUser | null;
                if (!isMounted) return;

                setUser(fetchedUser);
                if (fetchedUser) {
                    localStorage.setItem('currentUserData', JSON.stringify(fetchedUser));
                }
            } catch {
                if (!isMounted) return;
                const fallback = readStoredUser();
                setUser(fallback);
                setError('Live data could not be fetched. Showing cached profile information.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadUser();
        return () => {
            isMounted = false;
        };
    }, []);

    const profile = useMemo(() => {
        const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || '-';
        const username = user?.character?.username || user?.username || '-';
        const email = user?.email || localStorage.getItem('email') || '-';
        const level = user?.level ?? 1;
        const xp = user?.xp ?? 0;
        const skillLevel = user?.skillLevel ? levelBadgeMap[user.skillLevel] : '-';
        const joinedAt = formatDate(user?.createdAt);
        const birthDate = formatDate(user?.dateOfBirth);
        const languages = user?.learnedLanguages ?? [];

        return {
            fullName,
            username,
            email,
            level,
            xp,
            skillLevel,
            joinedAt,
            birthDate,
            languages,
            isAdmin: Boolean(user?.isAdmin),
            character: normalizeCharacter(user),
        };
    }, [user]);

    useEffect(() => {
        setProfileDraft({
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            email: user?.email ?? localStorage.getItem('email') ?? '',
            dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
            skillLevel: user?.skillLevel ?? 'beginner',
        });
        setCharacterDraft(normalizeCharacter(user));
    }, [user]);

    const persistLocalUser = (nextUser: ApiUser) => {
        setUser(nextUser);
        localStorage.setItem('currentUserData', JSON.stringify(nextUser));
    };

    const handleSaveProfileDraft = async () => {
        try {
            setProfileSaving(true);
            setError('');
            setSaveNote('');

            const payload = {
                firstName: profileDraft.firstName.trim(),
                lastName: profileDraft.lastName.trim(),
                email: profileDraft.email.trim(),
                dateOfBirth: profileDraft.dateOfBirth ? new Date(profileDraft.dateOfBirth).toISOString() : undefined,
                skillLevel: profileDraft.skillLevel,
            };

            const res = await userAPI.updateMe(payload);
            const updatedUser = (res?.data || null) as ApiUser | null;

            if (updatedUser) {
                persistLocalUser(updatedUser);
            }

            localStorage.setItem('email', payload.email);
            setIsEditingProfile(false);
            setSaveNote('Profile details were saved.');
        } catch (err: any) {
            setError(err?.message || 'Failed to save profile details.');
        } finally {
            setProfileSaving(false);
        }
    };

    const handleSaveCharacterDraft = async () => {
        try {
            setCharacterSaving(true);
            setError('');
            setSaveNote('');

            await userAPI.updateCharacter(characterDraft);
            const meRes = await userAPI.getMe();
            const refreshedUser = (meRes?.data || null) as ApiUser | null;
            if (refreshedUser) {
                persistLocalUser(refreshedUser);
            }

            setIsEditingCharacter(false);
            setSaveNote('Character settings were saved to database.');
        } catch (err: any) {
            setError(err?.message || 'Failed to save character settings.');
        } finally {
            setCharacterSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('currentUserData');
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
                <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-500/50 hover:text-emerald-300 sm:w-auto"
                    >
                        <ArrowLeft size={16} /> Home
                    </button>

                    <button
                        onClick={handleLogout}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20 sm:w-auto"
                    >
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>

                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.08)]"
                >
                    <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-[180px_1fr] md:gap-8 md:p-8">
                        <div className="mx-auto h-40 w-32 rounded-3xl border border-emerald-400/35 bg-slate-900 p-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] sm:h-44 sm:w-36">
                            <PixelCharacter char={profile.character} />
                        </div>

                        <div className="space-y-4 sm:space-y-5">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{profile.username}</h1>
                                {profile.isAdmin && (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-200">
                                        <Shield size={12} /> Admin
                                    </span>
                                )}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                    <p className="text-xs uppercase tracking-wider text-slate-400">Level</p>
                                    <p className="mt-1 text-xl font-extrabold text-emerald-300 sm:text-2xl">LVL {profile.level}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                    <p className="text-xs uppercase tracking-wider text-slate-400">Total XP</p>
                                    <p className="mt-1 text-xl font-extrabold text-cyan-300 sm:text-2xl">{profile.xp.toLocaleString()}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                    <p className="text-xs uppercase tracking-wider text-slate-400">Skill Tier</p>
                                    <p className="mt-1 text-xl font-extrabold text-violet-300 sm:text-2xl">{profile.skillLevel}</p>
                                </div>
                            </div>

                            {loading && <p className="text-sm text-slate-400">Loading profile data...</p>}
                            {!loading && error && <p className="text-sm text-amber-300">{error}</p>}
                            {!loading && saveNote && <p className="text-sm text-emerald-300">{saveNote}</p>}
                        </div>
                    </div>
                </motion.section>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <motion.section
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6"
                    >
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-lg font-bold text-white">Account Details</h2>
                            {!isEditingProfile ? (
                                <button
                                    onClick={() => setIsEditingProfile(true)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-emerald-500/60 hover:text-emerald-300"
                                >
                                    <Edit3 size={13} /> Edit
                                </button>
                            ) : (
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <button
                                        disabled={profileSaving}
                                        onClick={handleSaveProfileDraft}
                                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-200"
                                    >
                                        <Save size={13} /> {profileSaving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingProfile(false);
                                            setProfileDraft({
                                                firstName: user?.firstName ?? '',
                                                lastName: user?.lastName ?? '',
                                                email: user?.email ?? localStorage.getItem('email') ?? '',
                                                dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
                                                skillLevel: user?.skillLevel ?? 'beginner',
                                            });
                                        }}
                                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300"
                                    >
                                        <X size={13} /> Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {!isEditingProfile ? (
                            <div className="space-y-4 text-sm">
                                <div className="flex items-start gap-3 text-slate-200 sm:items-center">
                                    <User2 size={16} className="mt-0.5 shrink-0 text-emerald-300 sm:mt-0" />
                                    <span className="w-24 shrink-0 text-slate-400">Full Name</span>
                                    <span className="font-semibold">{profile.fullName}</span>
                                </div>
                                <div className="flex items-start gap-3 text-slate-200 sm:items-center">
                                    <Mail size={16} className="mt-0.5 shrink-0 text-emerald-300 sm:mt-0" />
                                    <span className="w-24 shrink-0 text-slate-400">Email</span>
                                    <span className="break-all font-semibold">{profile.email}</span>
                                </div>
                                <div className="flex items-start gap-3 text-slate-200 sm:items-center">
                                    <Calendar size={16} className="mt-0.5 shrink-0 text-emerald-300 sm:mt-0" />
                                    <span className="w-24 shrink-0 text-slate-400">Birth Date</span>
                                    <span className="font-semibold">{profile.birthDate}</span>
                                </div>
                                <div className="flex items-start gap-3 text-slate-200 sm:items-center">
                                    <BadgeCheck size={16} className="mt-0.5 shrink-0 text-emerald-300 sm:mt-0" />
                                    <span className="w-24 shrink-0 text-slate-400">Joined</span>
                                    <span className="font-semibold">{profile.joinedAt}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-3 text-sm sm:grid-cols-2">
                                <input
                                    value={profileDraft.firstName}
                                    onChange={(e) => setProfileDraft((prev) => ({ ...prev, firstName: e.target.value }))}
                                    placeholder="First name"
                                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 outline-none focus:border-emerald-500"
                                />
                                <input
                                    value={profileDraft.lastName}
                                    onChange={(e) => setProfileDraft((prev) => ({ ...prev, lastName: e.target.value }))}
                                    placeholder="Last name"
                                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 outline-none focus:border-emerald-500"
                                />
                                <input
                                    value={profileDraft.email}
                                    onChange={(e) => setProfileDraft((prev) => ({ ...prev, email: e.target.value }))}
                                    placeholder="Email"
                                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 outline-none focus:border-emerald-500 sm:col-span-2"
                                />
                                <input
                                    type="date"
                                    value={profileDraft.dateOfBirth}
                                    onChange={(e) => setProfileDraft((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 outline-none focus:border-emerald-500"
                                />
                                <select
                                    value={profileDraft.skillLevel}
                                    onChange={(e) => setProfileDraft((prev) => ({ ...prev, skillLevel: e.target.value as SkillLevel }))}
                                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 outline-none focus:border-emerald-500"
                                >
                                    {skillLevelOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {levelBadgeMap[option]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.16 }}
                        className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6"
                    >
                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-lg font-bold text-white">Character Editor</h2>
                            {!isEditingCharacter ? (
                                <button
                                    onClick={() => setIsEditingCharacter(true)}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-emerald-500/60 hover:text-emerald-300"
                                >
                                    <Edit3 size={13} /> Edit
                                </button>
                            ) : (
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <button
                                        disabled={characterSaving}
                                        onClick={handleSaveCharacterDraft}
                                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-200"
                                    >
                                        <Save size={13} /> {characterSaving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingCharacter(false);
                                            setCharacterDraft(normalizeCharacter(user));
                                        }}
                                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300"
                                    >
                                        <X size={13} /> Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[140px_1fr]">
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                                <div className="mx-auto h-36 w-24">
                                    <PixelCharacter char={isEditingCharacter ? characterDraft : profile.character} />
                                </div>
                            </div>

                            {isEditingCharacter ? (
                                <div className="space-y-3">
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div>
                                            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Gender</label>
                                            <select
                                                value={characterDraft.gender}
                                                onChange={(e) => setCharacterDraft((prev) => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500"
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Emotion</label>
                                            <select
                                                value={characterDraft.emotion}
                                                onChange={(e) => setCharacterDraft((prev) => ({ ...prev, emotion: e.target.value as EmotionType }))}
                                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500"
                                            >
                                                {emotionOptions.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Outfit</label>
                                            <select
                                                value={characterDraft.clothing}
                                                onChange={(e) => setCharacterDraft((prev) => ({ ...prev, clothing: e.target.value as ClothingType }))}
                                                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500"
                                            >
                                                {clothingOptions.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
                                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Skin Tone</p>
                                        <div className="flex flex-wrap gap-2">
                                            {skinToneOptions.map((color) => (
                                                <button
                                                    type="button"
                                                    key={`skin-${color}`}
                                                    onClick={() => setCharacterDraft((prev) => ({ ...prev, skin: color }))}
                                                    className={`h-6 w-6 rounded-full border transition ${characterDraft.skin === color ? 'scale-110 border-white ring-1 ring-white/40' : 'border-transparent'}`}
                                                    style={{ background: color }}
                                                    aria-label={`Set skin color ${color}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
                                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Hair Color</p>
                                        <div className="flex flex-wrap gap-2">
                                            {hairColorOptions.map((color) => (
                                                <button
                                                    type="button"
                                                    key={`hair-${color}`}
                                                    onClick={() => setCharacterDraft((prev) => ({ ...prev, hairColor: color }))}
                                                    className={`h-6 w-6 rounded-full border transition ${characterDraft.hairColor === color ? 'scale-110 border-white ring-1 ring-white/40' : 'border-transparent'}`}
                                                    style={{ background: color }}
                                                    aria-label={`Set hair color ${color}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
                                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Outfit Color</p>
                                        <div className="flex flex-wrap gap-2">
                                            {outfitColorOptions.map((color) => (
                                                <button
                                                    type="button"
                                                    key={`outfit-${color}`}
                                                    onClick={() => setCharacterDraft((prev) => ({ ...prev, clothingColor: color }))}
                                                    className={`h-6 w-6 rounded-full border transition ${characterDraft.clothingColor === color ? 'scale-110 border-white ring-1 ring-white/40' : 'border-transparent'}`}
                                                    style={{ background: color }}
                                                    aria-label={`Set outfit color ${color}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-400">
                                    Open edit mode to customize gender, emotion, outfit, and colors.
                                </div>
                            )}
                        </div>
                    </motion.section>
                </div>

                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6"
                >
                    <h2 className="mb-4 text-lg font-bold text-white">Active Modules</h2>

                    <div className="grid gap-3 md:grid-cols-3">
                        {activeModulePlaceholders.map((module) => (
                            <div key={module.name} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-slate-100">{module.name}</p>
                                    <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold text-cyan-200">
                                        {module.status}
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-slate-800">
                                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${module.progress}%` }} />
                                </div>
                                <p className="mt-2 text-right text-xs text-slate-400">{module.progress}%</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 text-xs text-slate-500">This section currently uses placeholder data.</p>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.24 }}
                    className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6"
                >
                    <h2 className="mb-4 text-lg font-bold text-white">Learned Languages</h2>

                    {profile.languages.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-400">
                            No learned languages are recorded yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {profile.languages.map((lang) => (
                                <div
                                    key={`${lang.language}-${lang.level}`}
                                    className="flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div>
                                        <p className="font-semibold text-slate-100">{lang.language}</p>
                                        <p className="text-xs uppercase tracking-wider text-slate-400">Proficiency</p>
                                    </div>
                                    <span className="inline-flex items-center gap-1 self-start rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-200 sm:self-auto">
                                        <Zap size={12} /> {lang.level}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.section>
            </div>
        </div>
    );
};

export default ProfilePage;