import React, { useState, useEffect, useRef } from 'react';
import {
  Settings, Trophy, User, LogOut, Code2, CheckCircle2, Lock, Crown,
  BookOpen, FlaskConical, Star, FileText, Sparkles, AlignLeft,
  MessageCircleQuestion, X, ArrowLeft, Search, ChevronLeft,
  ChevronRight, Sun, Moon, Users, ShieldCheck, Filter, MoreVertical,
  ExternalLink, Trash2, PlayCircle, Plus, Edit3, Save, XCircle,
  Bell, BellDot, ChevronDown, Eye, EyeOff, Copy, Check, RefreshCw,
  BarChart2, TrendingUp, Calendar, Clock, Zap, Award, Target,
  MessageSquare, Send, Minimize2, Maximize2, GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

export type EmotionType = 'neutral' | 'happy' | 'angry' | 'sad' | 'surprised';
export type ClothingType = 'tshirt' | 'hoodie' | 'jacket' | 'dress';

interface CharacterProps {
  skin: string;
  hairColor: string;
  clothingColor: string;
  gender: 'male' | 'female';
  emotion?: EmotionType;
  clothing?: ClothingType;
  variant?: 'full' | 'closeup';
}

type TagType = 'LESSON' | 'SELF GUIDED' | 'LAB' | 'HOMEWORK' | 'EXTRA';

interface ActivityItem {
  id: string;
  tag: TagType;
  title: string;
  mandatory?: boolean;
  completed?: boolean;
  feedback?: boolean;
  content?: string;
}

interface DayColumn {
  date: string;
  items: ActivityItem[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

// ─── Quiz Types ───────────────────────────────────────────────────────────────

interface QuizOption { label: string; text: string; }
interface QuizQuestion { question: string; options: QuizOption[]; correct: string; explanation: string; }

// ─── Gemini API ───────────────────────────────────────────────────────────────

const GEMINI_MODEL = 'gemini-2.5-flash';

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 4000, temperature: 0.5 },
      }),
    }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
}

function parseQuizJSON(raw: string): QuizQuestion[] {
  try {
    // Strip all markdown fences and leading/trailing whitespace
    let clean = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    // Try to extract just the JSON array if there's extra text around it
    const arrayMatch = clean.match(/\[[\s\S]*\]/);
    if (arrayMatch) clean = arrayMatch[0];

    const parsed = JSON.parse(clean);
    const arr = Array.isArray(parsed) ? parsed : parsed.questions || [];
    return arr;
  } catch {
    return [];
  }
}

// ─── Color Helpers ────────────────────────────────────────────────────────────

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// ─── Tag Config ───────────────────────────────────────────────────────────────

const TAG_DARK: Record<TagType, { bg: string; text: string; border: string }> = {
  LESSON:        { bg: 'rgba(0,255,136,0.08)',  text: '#00ff88',  border: 'rgba(0,255,136,0.25)' },
  'SELF GUIDED': { bg: 'rgba(168,85,247,0.08)', text: '#a855f7',  border: 'rgba(168,85,247,0.25)' },
  LAB:           { bg: 'rgba(251,191,36,0.08)', text: '#fbbf24',  border: 'rgba(251,191,36,0.25)' },
  HOMEWORK:      { bg: 'rgba(239,68,68,0.08)',  text: '#f87171',  border: 'rgba(239,68,68,0.25)' },
  EXTRA:         { bg: 'rgba(99,102,241,0.08)', text: '#818cf8',  border: 'rgba(99,102,241,0.25)' },
};

const TAG_LIGHT: Record<TagType, { bg: string; text: string; border: string; dot: string }> = {
  LESSON:        { bg: '#e6faf3', text: '#0d9b6b', border: '#a7e8ce', dot: '#0d9b6b' },
  'SELF GUIDED': { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe', dot: '#4f46e5' },
  LAB:           { bg: '#fefce8', text: '#92400e', border: '#fde68a', dot: '#d97706' },
  HOMEWORK:      { bg: '#fff1f2', text: '#be123c', border: '#fecdd3', dot: '#e11d48' },
  EXTRA:         { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe', dot: '#7c3aed' },
};

const TAG_ICONS: Record<TagType, React.ReactNode> = {
  LESSON:        <BookOpen size={9} />,
  'SELF GUIDED': <Star size={9} />,
  LAB:           <FlaskConical size={9} />,
  HOMEWORK:      <FileText size={9} />,
  EXTRA:         <Sparkles size={9} />,
};

// ─── Initial Module Data ──────────────────────────────────────────────────────

const INITIAL_MODULE_DATA: DayColumn[] = [
  {
    date: '2 Mar 2026',
    items: [
      { id: '1', tag: 'SELF GUIDED', title: 'Postman Setup', completed: true },
      { id: '2', tag: 'LESSON', title: 'Spring Boot Intro', completed: true },
      { id: '3', tag: 'SELF GUIDED', title: 'CFU: Spring Boot Intro', completed: true },
      { id: '4', tag: 'EXTRA', title: 'Ironboard: Spring Boot Intro', completed: true },
      { id: '5', tag: 'LAB', title: 'LAB | Spring Boot Intro', mandatory: true, completed: true, feedback: true },
    ],
  },
  {
    date: '3 Mar 2026',
    items: [
      { id: '6', tag: 'LESSON', title: 'Dependency Injection', completed: true },
      { id: '7', tag: 'SELF GUIDED', title: 'CFU: Dependency Injection', completed: true },
      { id: '8', tag: 'EXTRA', title: 'Ironboard: Dependency Injection', completed: true },
      { id: '9', tag: 'LAB', title: 'LAB | Dependency Injection', mandatory: true, completed: true, feedback: true },
    ],
  },
  {
    date: '4 Mar 2026',
    items: [
      { id: '10', tag: 'LESSON', title: 'HTTP + REST Fundamentals', completed: true },
      { id: '11', tag: 'SELF GUIDED', title: 'CFU: HTTP + REST Fundamentals', completed: true },
      { id: '12', tag: 'SELF GUIDED', title: 'Postman Workshop', completed: true },
    ],
  },
  {
    date: '5 Mar 2026',
    items: [
      { id: '13', tag: 'LESSON', title: 'REST Controllers: GET & POST', completed: true },
      { id: '14', tag: 'SELF GUIDED', title: 'CFU: REST Controllers: GET & POST', completed: true },
      { id: '15', tag: 'EXTRA', title: 'Ironboard: GET & POST', completed: true },
      { id: '16', tag: 'LAB', title: 'LAB | Spring Boot REST API (Part 1)', mandatory: true, completed: true, feedback: true },
    ],
  },
  {
    date: '6 Mar 2026',
    items: [
      { id: '17', tag: 'EXTRA', title: 'Review Week 1', completed: true },
      { id: '18', tag: 'HOMEWORK', title: 'IronSchool', mandatory: true, completed: true, feedback: true },
    ],
  },
  {
    date: '10 Mar 2026',
    items: [
      { id: '19', tag: 'LESSON', title: 'PUT, PATCH & DELETE', completed: true },
      { id: '20', tag: 'SELF GUIDED', title: 'CFU: PUT, PATCH & DELETE' },
      { id: '21', tag: 'LAB', title: 'LAB | REST API (Part 2)', mandatory: true },
    ],
  },
  {
    date: '11 Mar 2026',
    items: [
      { id: '22', tag: 'HOMEWORK', title: 'REMINDER: HOMEWORK DUE', completed: true },
      { id: '23', tag: 'LESSON', title: 'Exception Handling' },
    ],
  },
  {
    date: '12 Mar 2026',
    items: [
      { id: '24', tag: 'LESSON', title: 'DTOs & Best Practices', completed: true },
      { id: '25', tag: 'SELF GUIDED', title: 'CFU: DTOs' },
    ],
  },
  {
    date: '13 Mar 2026',
    items: [
      { id: '26', tag: 'LESSON', title: 'Controller Testing', completed: true },
      { id: '27', tag: 'SELF GUIDED', title: 'CFU: Testing' },
      { id: '28', tag: 'LAB', title: 'LAB | Controller Testing', mandatory: true },
    ],
  },
  {
    date: '16 Mar 2026',
    items: [
      { id: '29', tag: 'EXTRA', title: 'Review Week 2' },
      { id: '30', tag: 'HOMEWORK', title: 'Final Project Sprint 1', mandatory: true },
    ],
  },
];

const LESSON_SECTIONS = [
  { id: 'learn',       title: 'What You Will Learn' },
  { id: 'three-layer', title: 'The Three-Layer Architecture' },
  { id: 'problem',     title: 'The Problem Without DI' },
  { id: 'constructor', title: 'Constructor Injection' },
  { id: 'ioc',         title: 'How the IoC Container Works' },
  { id: 'layers',      title: 'Putting the Layers Together' },
  { id: 'field',       title: 'Why Not Field Injection?' },
  { id: 'takeaways',   title: 'Key Takeaways' },
  { id: 'mistakes',    title: 'Common Mistakes' },
  { id: 'reading',     title: 'Further Reading' },
];

// ─── Pixel Character ──────────────────────────────────────────────────────────

const PixelCharacter = ({ char }: { char: CharacterProps }) => {
  const { skin, hairColor, clothingColor, gender, emotion = 'neutral', clothing = 'tshirt', variant = 'full' } = char;
  const skinDark = adjustColor(skin, -20);
  const skinLight = adjustColor(skin, 15);
  const hairDark = adjustColor(hairColor, -30);
  const hairLight = adjustColor(hairColor, 20);
  const clothDark = adjustColor(clothingColor, -25);
  const clothLight = adjustColor(clothingColor, 15);

  const breathVariants = { animate: { y: [0, -1.5, 0], transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const } } };
  const blinkVariants = { animate: { scaleY: [1, 1, 0.1, 1, 1], transition: { duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1], ease: 'easeInOut' as const } } };

  const renderEyes = () => {
    switch (emotion) {
      case 'happy': return (<><path d="M24 20 Q27 18 30 20" stroke="#1e3a8a" strokeWidth="2" fill="none" /><path d="M34 20 Q37 18 40 20" stroke="#1e3a8a" strokeWidth="2" fill="none" /></>);
      case 'angry': return (<><rect x="24" y="15" width="6" height="2" fill={hairDark} transform="rotate(10 27 16)" /><rect x="34" y="15" width="6" height="2" fill={hairDark} transform="rotate(-10 37 16)" /><rect x="24" y="18" width="6" height="5" fill="#ffffff" /><rect x="26" y="19" width="3" height="3" fill="#dc2626" /><rect x="27" y="20" width="2" height="2" fill="#1e1e1e" /><rect x="34" y="18" width="6" height="5" fill="#ffffff" /><rect x="35" y="19" width="3" height="3" fill="#dc2626" /><rect x="36" y="20" width="2" height="2" fill="#1e1e1e" /></>);
      case 'sad': return (<><rect x="24" y="16" width="6" height="2" fill={hairDark} transform="rotate(-8 27 17)" /><rect x="34" y="16" width="6" height="2" fill={hairDark} transform="rotate(8 37 17)" /><rect x="24" y="18" width="6" height="6" fill="#ffffff" /><rect x="26" y="19" width="3" height="4" fill="#60a5fa" /><rect x="27" y="20" width="2" height="2" fill="#1e3a8a" /><rect x="34" y="18" width="6" height="6" fill="#ffffff" /><rect x="35" y="19" width="3" height="4" fill="#60a5fa" /><rect x="36" y="20" width="2" height="2" fill="#1e3a8a" /><rect x="29" y="24" width="2" height="3" fill="#60a5fa" opacity="0.7" /></>);
      case 'surprised': return (<><rect x="24" y="14" width="6" height="2" fill={hairDark} /><rect x="34" y="14" width="6" height="2" fill={hairDark} /><rect x="23" y="17" width="8" height="8" fill="#ffffff" /><rect x="25" y="18" width="4" height="6" fill="#3b82f6" /><rect x="26" y="19" width="2" height="4" fill="#1e3a8a" /><rect x="25" y="18" width="1" height="1" fill="#ffffff" /><rect x="33" y="17" width="8" height="8" fill="#ffffff" /><rect x="35" y="18" width="4" height="6" fill="#3b82f6" /><rect x="36" y="19" width="2" height="4" fill="#1e3a8a" /><rect x="35" y="18" width="1" height="1" fill="#ffffff" /></>);
      default: return (<motion.g variants={blinkVariants} animate="animate" style={{ transformOrigin: '32px 21px' }}><rect x="24" y="16" width="6" height="2" fill={hairDark} /><rect x="34" y="16" width="6" height="2" fill={hairDark} /><rect x="24" y="18" width="6" height="6" fill="#ffffff" /><rect x="26" y="19" width="3" height="4" fill="#3b82f6" /><rect x="27" y="20" width="2" height="2" fill="#1e3a8a" /><rect x="26" y="19" width="1" height="1" fill="#ffffff" /><rect x="34" y="18" width="6" height="6" fill="#ffffff" /><rect x="35" y="19" width="3" height="4" fill="#3b82f6" /><rect x="36" y="20" width="2" height="2" fill="#1e3a8a" /><rect x="35" y="19" width="1" height="1" fill="#ffffff" /></motion.g>);
    }
  };

  const renderMouth = () => {
    switch (emotion) {
      case 'happy': return (<><rect x="28" y="27" width="8" height="3" fill="#be185d" /><rect x="29" y="28" width="6" height="2" fill="#ffffff" opacity="0.8" /></>);
      case 'angry': return (<><rect x="28" y="28" width="8" height="2" fill="#7f1d1d" /><rect x="27" y="27" width="2" height="2" fill="#7f1d1d" /><rect x="35" y="27" width="2" height="2" fill="#7f1d1d" /></>);
      case 'sad': return <path d="M28 30 Q32 27 36 30" stroke="#be185d" strokeWidth="2" fill="none" />;
      case 'surprised': return (<><ellipse cx="32" cy="29" rx="3" ry="4" fill="#be185d" /><ellipse cx="32" cy="28" rx="2" ry="2" fill="#111" /></>);
      default: return (<><rect x="28" y="28" width="8" height="2" fill="#be185d" /><rect x="29" y="28" width="6" height="1" fill="#f472b6" opacity="0.5" /></>);
    }
  };

  const renderTshirt = () => {
    const isFemale = gender === 'female';
    return (<g><rect x="20" y="34" width="24" height="28" fill={clothingColor} /><rect x="20" y="34" width="4" height="28" fill={clothDark} /><rect x="40" y="34" width="4" height="28" fill={clothDark} /><rect x="30" y="34" width="4" height="28" fill={clothLight} opacity="0.3" />{isFemale && (<><rect x="20" y="50" width="2" height="8" fill={clothDark} opacity="0.3" /><rect x="42" y="50" width="2" height="8" fill={clothDark} opacity="0.3" /><ellipse cx="28" cy="42" rx="4" ry="3" fill={clothDark} opacity="0.15" /><ellipse cx="36" cy="42" rx="4" ry="3" fill={clothDark} opacity="0.15" /></>)}{!isFemale ? (<><rect x="26" y="32" width="12" height="6" fill={skin} /><rect x="28" y="34" width="8" height="4" fill={skinDark} opacity="0.3" /><polygon points="28,38 32,44 36,38" fill={clothDark} /></>) : (<><rect x="24" y="32" width="16" height="6" fill={skin} /><rect x="26" y="34" width="12" height="4" fill={skinDark} opacity="0.3" /><ellipse cx="32" cy="38" rx="6" ry="3" fill={clothDark} /></>)}<rect x="20" y="58" width="24" height="4" fill="#0f172a" /><rect x="30" y="58" width="4" height="4" fill="#fbbf24" /></g>);
  };

  const renderClothing = () => {
    const isFemale = gender === 'female';
    switch (clothing) {
      case 'hoodie': return (<g><rect x="18" y="34" width="28" height="28" fill={clothingColor} /><rect x="18" y="34" width="4" height="28" fill={clothDark} /><rect x="42" y="34" width="4" height="28" fill={clothDark} /><rect x="16" y="28" width="32" height="10" fill={clothDark} /><rect x="22" y="48" width="20" height="10" fill={clothDark} opacity="0.5" /><rect x="22" y="48" width="20" height="2" fill={clothLight} opacity="0.3" /><rect x="28" y="38" width="2" height="12" fill={clothLight} /><rect x="34" y="38" width="2" height="12" fill={clothLight} /><rect x="24" y="32" width="16" height="4" fill={clothLight} opacity="0.4" />{isFemale ? <ellipse cx="32" cy="36" rx="6" ry="4" fill={skin} /> : <rect x="26" y="32" width="12" height="6" fill={skin} />}</g>);
      case 'jacket': return (<g><rect x="18" y="34" width="28" height="28" fill={clothingColor} /><rect x="31" y="34" width="2" height="28" fill="#71717a" /><rect x="30" y="38" width="1" height="2" fill="#a1a1aa" /><rect x="30" y="44" width="1" height="2" fill="#a1a1aa" /><rect x="30" y="50" width="1" height="2" fill="#a1a1aa" /><rect x="18" y="34" width="13" height="28" fill={clothingColor} /><rect x="18" y="34" width="4" height="28" fill={clothDark} /><rect x="33" y="34" width="13" height="28" fill={clothingColor} /><rect x="42" y="34" width="4" height="28" fill={clothDark} /><polygon points="24,34 28,40 28,34" fill={clothDark} /><polygon points="40,34 36,40 36,34" fill={clothDark} /><rect x="28" y="36" width="8" height="6" fill="#ffffff" />{isFemale ? <rect x="26" y="32" width="12" height="4" fill={skin} /> : <rect x="28" y="32" width="8" height="4" fill={skin} />}</g>);
      case 'dress': if (!isFemale) return renderTshirt(); return (<g><rect x="20" y="34" width="24" height="16" fill={clothingColor} /><rect x="20" y="34" width="4" height="16" fill={clothDark} /><rect x="40" y="34" width="4" height="16" fill={clothDark} /><polygon points="16,50 48,50 52,80 12,80" fill={clothingColor} /><polygon points="16,50 24,50 20,80 12,80" fill={clothDark} /><polygon points="40,50 48,50 52,80 44,80" fill={clothDark} /><rect x="24" y="52" width="2" height="26" fill={clothDark} opacity="0.3" /><rect x="32" y="52" width="2" height="26" fill={clothLight} opacity="0.3" /><rect x="38" y="52" width="2" height="26" fill={clothDark} opacity="0.3" /><ellipse cx="32" cy="36" rx="8" ry="4" fill={skin} /><rect x="30" y="38" width="4" height="3" fill={clothLight} /><rect x="28" y="39" width="2" height="2" fill={clothLight} /><rect x="34" y="39" width="2" height="2" fill={clothLight} /></g>);
      default: return renderTshirt();
    }
  };

  const renderLegs = () => {
    if (variant === 'closeup') return null;
    if (clothing === 'dress' && gender === 'female') return (<g><rect x="24" y="76" width="6" height="6" fill={skin} /><rect x="34" y="76" width="6" height="6" fill={skin} /></g>);
    return (<g><rect x="22" y="60" width="8" height="22" fill="#1e293b" /><rect x="22" y="60" width="2" height="22" fill="#0f172a" /><rect x="28" y="60" width="2" height="22" fill="#334155" /><rect x="34" y="60" width="8" height="22" fill="#1e293b" /><rect x="34" y="60" width="2" height="22" fill="#0f172a" /><rect x="40" y="60" width="2" height="22" fill="#334155" /><rect x="24" y="68" width="4" height="2" fill="#0f172a" opacity="0.5" /><rect x="36" y="68" width="4" height="2" fill="#0f172a" opacity="0.5" /></g>);
  };

  const renderShoes = () => {
    if (variant === 'closeup') return null;
    return (<g><rect x="20" y="80" width="12" height="8" fill="#111827" /><rect x="20" y="80" width="12" height="2" fill="#1f2937" /><rect x="18" y="84" width="4" height="4" fill="#111827" /><rect x="20" y="86" width="8" height="2" fill="#0a0a0a" /><rect x="32" y="80" width="12" height="8" fill="#111827" /><rect x="32" y="80" width="12" height="2" fill="#1f2937" /><rect x="42" y="84" width="4" height="4" fill="#111827" /><rect x="36" y="86" width="8" height="2" fill="#0a0a0a" /></g>);
  };

  const viewBox = variant === 'closeup' ? '12 0 40 60' : '0 0 64 96';

  return (
    <svg viewBox={viewBox} className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
      <defs>
        <linearGradient id="clothShine" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={clothLight} /><stop offset="50%" stopColor={clothingColor} /><stop offset="100%" stopColor={clothDark} /></linearGradient>
        <linearGradient id="hairShine" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor={hairLight} /><stop offset="100%" stopColor={hairDark} /></linearGradient>
      </defs>
      {variant === 'full' && <ellipse cx="32" cy="92" rx="18" ry="4" fill="rgba(0,0,0,0.4)" />}
      {renderLegs()}
      {renderShoes()}
      <motion.g variants={breathVariants} animate="animate">
        <g>
          <rect x="12" y="36" width="8" height="6" fill={clothingColor} /><rect x="12" y="36" width="2" height="6" fill={clothDark} /><rect x="14" y="42" width="6" height="14" fill={skin} /><rect x="14" y="42" width="2" height="14" fill={skinDark} /><rect x="18" y="42" width="2" height="14" fill={skinLight} /><rect x="14" y="54" width="6" height="6" fill={skin} /><rect x="12" y="56" width="2" height="4" fill={skin} />
          <rect x="44" y="36" width="8" height="6" fill={clothingColor} /><rect x="50" y="36" width="2" height="6" fill={clothDark} /><rect x="44" y="42" width="6" height="14" fill={skin} /><rect x="44" y="42" width="2" height="14" fill={skinDark} /><rect x="48" y="42" width="2" height="14" fill={skinLight} /><rect x="44" y="54" width="6" height="6" fill={skin} /><rect x="50" y="56" width="2" height="4" fill={skin} />
        </g>
        {renderClothing()}
        <rect x="28" y="28" width="8" height="8" fill={skin} /><rect x="28" y="28" width="2" height="8" fill={skinDark} /><rect x="34" y="28" width="2" height="8" fill={skinLight} />
        <g>
          <rect x="22" y="12" width="20" height="20" fill={skin} /><rect x="22" y="12" width="3" height="20" fill={skinDark} /><rect x="39" y="12" width="3" height="20" fill={skinDark} /><rect x="25" y="20" width="4" height="4" fill={skinLight} opacity="0.4" /><rect x="35" y="20" width="4" height="4" fill={skinLight} opacity="0.4" /><rect x="26" y="30" width="12" height="2" fill={skin} />
        </g>
        <g>
          {renderEyes()}
          <rect x="31" y="22" width="2" height="4" fill={skinDark} opacity="0.4" />
          {renderMouth()}
          {(emotion === 'happy' || emotion === 'surprised') && (<><rect x="23" y="24" width="3" height="2" fill="#fca5a5" opacity="0.4" /><rect x="38" y="24" width="3" height="2" fill="#fca5a5" opacity="0.4" /></>)}
        </g>
        {gender === 'male' ? (
          <g><rect x="20" y="8" width="24" height="10" fill={hairColor} /><rect x="22" y="6" width="20" height="4" fill={hairColor} /><rect x="24" y="4" width="16" height="4" fill={hairLight} /><rect x="18" y="10" width="6" height="12" fill={hairColor} /><rect x="40" y="10" width="6" height="12" fill={hairColor} /><rect x="24" y="6" width="2" height="8" fill={hairDark} /><rect x="30" y="5" width="2" height="9" fill={hairDark} /><rect x="36" y="6" width="2" height="8" fill={hairDark} /><rect x="26" y="6" width="2" height="4" fill={hairLight} opacity="0.6" /><rect x="34" y="6" width="2" height="4" fill={hairLight} opacity="0.6" /><rect x="22" y="10" width="4" height="4" fill={hairColor} /><rect x="38" y="10" width="4" height="4" fill={hairColor} /></g>
        ) : (
          <g><rect x="18" y="6" width="28" height="12" fill={hairColor} /><rect x="20" y="4" width="24" height="4" fill={hairLight} /><rect x="14" y="10" width="8" height="30" fill={hairColor} /><rect x="42" y="10" width="8" height="30" fill={hairColor} /><rect x="14" y="10" width="3" height="30" fill={hairDark} /><rect x="47" y="10" width="3" height="30" fill={hairDark} /><rect x="19" y="12" width="2" height="20" fill={hairLight} opacity="0.4" /><rect x="43" y="12" width="2" height="20" fill={hairLight} opacity="0.4" /><rect x="22" y="8" width="6" height="8" fill={hairColor} /><rect x="36" y="8" width="6" height="8" fill={hairColor} /><rect x="28" y="6" width="8" height="6" fill={hairLight} opacity="0.5" /><rect x="24" y="8" width="2" height="6" fill={hairDark} /><rect x="38" y="8" width="2" height="6" fill={hairDark} /><rect x="16" y="14" width="4" height="4" fill="#ec4899" /><rect x="17" y="15" width="2" height="2" fill="#f9a8d4" /></g>
        )}
        <rect x="20" y="18" width="4" height="6" fill={skin} /><rect x="40" y="18" width="4" height="6" fill={skin} /><rect x="21" y="19" width="2" height="4" fill={skinDark} opacity="0.3" /><rect x="41" y="19" width="2" height="4" fill={skinDark} opacity="0.3" />
      </motion.g>
    </svg>
  );
};

// ─── Tag Badge ────────────────────────────────────────────────────────────────

const TagBadge = ({ tag, mandatory, dark }: { tag: TagType; mandatory?: boolean; dark: boolean }) => {
  const s = dark ? TAG_DARK[tag] : TAG_LIGHT[tag];
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
      style={{ background: s.bg, color: s.text, borderColor: s.border }}>
      {TAG_ICONS[tag]}
      {tag}
      {mandatory && <span style={{ color: dark ? '#f87171' : '#e11d48' }} className="ml-0.5 font-bold">*Mandatory</span>}
    </span>
  );
};

// ─── Activity Card ────────────────────────────────────────────────────────────

const ActivityCard = ({ item, onClick, onToggleComplete, dark, isAdmin }: {
  item: ActivityItem;
  onClick: () => void;
  onToggleComplete?: (id: string) => void;
  dark: boolean;
  isAdmin?: boolean;
}) => {
  const s = dark ? TAG_DARK[item.tag] : TAG_LIGHT[item.tag];
  const dot = dark ? s.text : (TAG_LIGHT[item.tag] as any).dot ?? s.text;
  const clickable = item.tag === 'LESSON' || item.tag === 'SELF GUIDED';
  const accent = dark ? '#00ff88' : '#4f46e5';

  return (
    <motion.div
      whileHover={clickable ? { y: -1 } : {}}
      className="w-full text-left rounded-xl p-3.5 relative overflow-hidden group transition-all duration-200"
      style={{
        background: dark ? '#0f1713' : '#ffffff',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb'}`,
        boxShadow: dark ? 'none' : '0 1px 2px rgba(0,0,0,0.04)',
        cursor: clickable ? 'pointer' : 'default',
      }}
      onMouseEnter={e => clickable && ((e.currentTarget as HTMLDivElement).style.borderColor = dark ? 'rgba(0,255,136,0.25)' : s.border)}
      onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb')}
      onClick={clickable ? onClick : undefined}
    >
      {!dark && <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl" style={{ background: dot }} />}

      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
        {isAdmin && onToggleComplete && (
          <button
            onClick={e => { e.stopPropagation(); onToggleComplete(item.id); }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
            style={{ color: item.completed ? accent : '#6b7280' }}
            title="Toggle complete"
          >
            <CheckCircle2 size={13} />
          </button>
        )}
        {item.completed && !isAdmin && <CheckCircle2 size={13} style={{ color: dark ? '#00ff88' : '#0d9b6b' }} />}
        {item.completed && isAdmin && <CheckCircle2 size={13} style={{ color: dark ? '#00ff88' : '#0d9b6b' }} />}
      </div>

      <div className={`mb-2 ${!dark ? 'pl-2' : ''}`}>
        <TagBadge tag={item.tag} mandatory={item.mandatory} dark={dark} />
      </div>
      <p className={`text-sm font-semibold leading-snug pr-5 ${!dark ? 'pl-2' : ''}`}
        style={{ color: item.completed ? (dark ? '#6b7280' : '#9ca3af') : (dark ? '#e5e7eb' : '#111827') }}>
        {item.title}
      </p>
      {item.feedback && (
        <p className={`text-[10px] mt-1.5 flex items-center gap-1 font-medium ${!dark ? 'pl-2' : ''}`}
          style={{ color: dark ? '#00ff88' : '#4f46e5' }}>
          <Sparkles size={9} /> Feedback available
        </p>
      )}
    </motion.div>
  );
};

// ─── AI Chat Bubble (Floating) ────────────────────────────────────────────────

const AIChatBubble = ({ dark, apiKey, lessonTitle }: { dark: boolean; apiKey: string; lessonTitle?: string }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const accent = dark ? '#00ff88' : '#4f46e5';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || !apiKey) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const context = lessonTitle ? `You are an AI tutor for a Spring Boot course. The student is currently viewing the lesson "${lessonTitle}". ` : 'You are an AI tutor for a Spring Boot programming course. ';
      const reply = await callGemini(context + userMsg, apiKey);
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${e.message}` }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-80 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{
              background: dark ? '#0f1713' : '#fff',
              border: `1px solid ${dark ? 'rgba(0,255,136,0.2)' : '#e5e7eb'}`,
              height: 400,
            }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb'}` }}>
              <div className="flex items-center gap-2">
                <Sparkles size={14} style={{ color: accent }} />
                <span className="text-sm font-bold" style={{ color: dark ? '#e5e7eb' : '#111827' }}>Gemini AI Tutor</span>
              </div>
              <button onClick={() => setOpen(false)} style={{ color: dark ? '#9ca3af' : '#6b7280' }}>
                <X size={15} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 && (
                <div className="text-center text-xs mt-8" style={{ color: dark ? '#6b7280' : '#9ca3af' }}>
                  Ask me anything about {lessonTitle || 'Spring Boot'}!
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed"
                    style={{
                      background: m.role === 'user'
                        ? (dark ? 'rgba(0,255,136,0.15)' : '#eef2ff')
                        : (dark ? '#1a231e' : '#f9fafb'),
                      color: m.role === 'user'
                        ? (dark ? '#00ff88' : '#4f46e5')
                        : (dark ? '#d1d5db' : '#374151'),
                      border: `1px solid ${m.role === 'user' ? (dark ? 'rgba(0,255,136,0.2)' : '#c7d2fe') : (dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb')}`,
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-xl px-3 py-2 text-xs flex items-center gap-2"
                    style={{ background: dark ? '#1a231e' : '#f9fafb', color: accent, border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb'}` }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Sparkles size={12} />
                    </motion.div>
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-3 flex gap-2" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb'}` }}>
              <input
                className="flex-1 rounded-xl px-3 py-2 text-xs focus:outline-none"
                style={{ background: dark ? '#0a0f0d' : '#f9fafb', color: dark ? '#e5e7eb' : '#111827', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}` }}
                placeholder="Ask a question..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
              />
              <button onClick={send} className="p-2 rounded-xl font-bold text-xs"
                style={{ background: accent, color: dark ? '#000' : '#fff' }}>
                <Send size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(o => !o)}
        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: accent, color: dark ? '#000' : '#fff', boxShadow: `0 0 20px ${accent}44` }}
      >
        {open ? <X size={20} /> : <MessageSquare size={20} />}
      </motion.button>
    </div>
  );
};



// ─── Interactive Quiz ─────────────────────────────────────────────────────────

const InteractiveQuiz = ({ questions, dark, onClose, onRetry }: {
  questions: QuizQuestion[]; dark: boolean; onClose: () => void; onRetry: () => void;
}) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<{ selected: string; correct: string; isCorrect: boolean }[]>([]);
  const [showResults, setShowResults] = useState(false);

  const accent = dark ? '#00ff88' : '#4f46e5';
  const cardBg = dark ? '#0f1713' : '#f9fafb';
  const border = dark ? 'rgba(255,255,255,0.07)' : '#e5e7eb';
  const text = dark ? '#e5e7eb' : '#111827';
  const muted = dark ? '#9ca3af' : '#6b7280';
  const q = questions[current];
  const total = questions.length;
  const score = answers.filter(a => a.isCorrect).length;

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    setAnswers(prev => [...prev, { selected, correct: q.correct, isCorrect: selected === q.correct }]);
  };

  const handleNext = () => {
    if (current + 1 >= total) { setShowResults(true); }
    else { setCurrent(c => c + 1); setSelected(null); setSubmitted(false); }
  };

  const optionStyle = (opt: string) => {
    if (!submitted) return selected === opt
      ? { bg: dark ? 'rgba(0,255,136,0.12)' : '#eef2ff', border: accent, color: accent }
      : { bg: 'transparent', border: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb', color: dark ? '#d1d5db' : '#374151' };
    if (opt === q.correct) return { bg: dark ? 'rgba(34,197,94,0.12)' : '#f0fdf4', border: '#22c55e', color: '#22c55e' };
    if (opt === selected) return { bg: dark ? 'rgba(239,68,68,0.12)' : '#fff1f2', border: '#ef4444', color: '#ef4444' };
    return { bg: 'transparent', border: dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb', color: muted };
  };

  if (showResults) {
    const pct = Math.round((score / total) * 100);
    const emoji = pct === 100 ? '🏆' : pct >= 66 ? '🎯' : pct >= 33 ? '📚' : '💪';
    const msg = pct === 100 ? 'Perfect! You nailed it!' : pct >= 66 ? 'Great job! Almost perfect.' : pct >= 33 ? 'Good effort! Try again.' : 'Keep studying — you got this!';
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-8 text-center" style={{ background: cardBg, border: `1px solid ${border}` }}>
        <div className="text-6xl mb-4">{emoji}</div>
        <h3 className="text-2xl font-black mb-2" style={{ color: text }}>Quiz Complete!</h3>
        <p className="text-sm mb-6" style={{ color: muted }}>{msg}</p>
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-4xl font-black" style={{ color: accent }}>{score}/{total}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: muted }}>Score</p>
          </div>
          <div className="w-px h-12" style={{ background: border }} />
          <div className="text-center">
            <p className="text-4xl font-black" style={{ color: pct >= 66 ? '#22c55e' : pct >= 33 ? '#f59e0b' : '#ef4444' }}>{pct}%</p>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: muted }}>Accuracy</p>
          </div>
        </div>
        <div className="space-y-2 mb-6 text-left">
          {answers.map((a, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium"
              style={{ background: a.isCorrect ? (dark ? 'rgba(34,197,94,0.08)' : '#f0fdf4') : (dark ? 'rgba(239,68,68,0.08)' : '#fff1f2'), border: `1px solid ${a.isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`, color: text }}>
              <span className="text-base">{a.isCorrect ? '✅' : '❌'}</span>
              <span>Q{i + 1}: You chose <strong>{a.selected}</strong>{!a.isCorrect && <> — correct: <strong style={{ color: '#22c55e' }}>{a.correct}</strong></>}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onRetry} className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', color: muted, border: `1px solid ${border}` }}>
            <RefreshCw size={14} /> New Quiz
          </button>
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-sm"
            style={{ background: accent, color: dark ? '#000' : '#fff' }}>Done ✓</button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
      {/* Progress bar */}
      <div className="h-1.5 w-full" style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb' }}>
        <motion.div className="h-full rounded-r-full" animate={{ width: `${(current / total) * 100}%` }}
          transition={{ duration: 0.4 }} style={{ background: accent }} />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ background: dark ? 'rgba(0,255,136,0.1)' : '#eef2ff', color: accent }}>
              Q{current + 1} / {total}
            </span>
            <span className="text-xs font-bold" style={{ color: muted }}>{score} correct so far</span>
          </div>
          <button onClick={onClose} style={{ color: muted }}><X size={15} /></button>
        </div>

        <motion.p key={current} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
          className="text-base font-bold leading-relaxed mb-6" style={{ color: text }}>
          {q.question}
        </motion.p>

        <div className="space-y-3 mb-5">
          {q.options.map(opt => {
            const s = optionStyle(opt.label);
            const icon = submitted ? (opt.label === q.correct ? '✅' : opt.label === selected ? '❌' : null) : null;
            return (
              <motion.button key={opt.label}
                whileHover={!submitted ? { x: 4 } : {}}
                whileTap={!submitted ? { scale: 0.99 } : {}}
                disabled={submitted}
                onClick={() => !submitted && setSelected(opt.label)}
                className="w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 transition-all duration-200 text-sm font-medium"
                style={{ background: s.bg, border: `2px solid ${s.border}`, color: s.color, cursor: submitted ? 'default' : 'pointer' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-all"
                  style={{
                    background: submitted
                      ? opt.label === q.correct ? '#22c55e' : opt.label === selected ? '#ef4444' : (dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6')
                      : selected === opt.label ? accent : (dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'),
                    color: submitted
                      ? (opt.label === q.correct || opt.label === selected) ? '#fff' : muted
                      : selected === opt.label ? (dark ? '#000' : '#fff') : muted,
                  }}>
                  {icon || opt.label}
                </span>
                <span className="flex-1">{opt.text}</span>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {submitted && q.explanation && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="rounded-xl px-4 py-3 mb-5 text-xs leading-relaxed overflow-hidden"
              style={{ background: dark ? 'rgba(255,255,255,0.03)' : '#f9fafb', border: `1px solid ${border}`, color: muted }}>
              <span className="font-bold" style={{ color: accent }}>💡 Explanation: </span>{q.explanation}
            </motion.div>
          )}
        </AnimatePresence>

        {!submitted ? (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSubmit} disabled={!selected}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all"
            style={{ background: selected ? accent : (dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6'), color: selected ? (dark ? '#000' : '#fff') : muted, opacity: selected ? 1 : 0.6 }}>
            Submit Answer
          </motion.button>
        ) : (
          <motion.button initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            className="w-full py-3 rounded-xl font-bold text-sm"
            style={{ background: accent, color: dark ? '#000' : '#fff' }}>
            {current + 1 >= total ? '🏆 See Results' : 'Next Question →'}
          </motion.button>
        )}
      </div>
    </div>
  );
};

// ─── Lesson Detail ────────────────────────────────────────────────────────────

const LessonDetail = ({ title, onBack, dark, apiKey }: { title: string; onBack: () => void; dark: boolean; apiKey: string }) => {
  const [activeSection, setActiveSection] = useState('learn');
  const [aiMode, setAiMode] = useState<'quiz' | 'summary' | 'ask' | null>(null);
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');

  const loadQuiz = async () => {
    if (!apiKey) { setQuizError('⚠️ Set your Gemini API key in Settings first.'); setAiMode('quiz'); return; }
    setAiMode('quiz');
    setQuizLoading(true);
    setQuizQuestions([]);
    setQuizError('');
    try {
      const prompt = `Create a 5-question multiple choice quiz about "${title}" in Spring Boot / Java.

IMPORTANT: Reply with ONLY the raw JSON array below. No explanation, no markdown, no code block fences.

[
  {
    "question": "Question text?",
    "options": [
      {"label":"A","text":"option text"},
      {"label":"B","text":"option text"},
      {"label":"C","text":"option text"},
      {"label":"D","text":"option text"},
      {"label":"E","text":"option text"}
    ],
    "correct":"A",
    "explanation":"Why A is correct."
  }
]

Generate all 5 questions in this exact format.`;

      const raw = await callGemini(prompt, apiKey);
      console.log('Gemini raw response:', raw);
      const parsed = parseQuizJSON(raw);
      if (parsed.length === 0) throw new Error('Could not parse quiz. Raw: ' + raw.slice(0, 200));
      setQuizQuestions(parsed);
    } catch (e: any) {
      setQuizError(e.message);
    }
    setQuizLoading(false);
  };

  const callAI = async (prompt: string) => {
    if (!apiKey) { setAiResponse('⚠️ Please set your Gemini API key in Settings first.'); return; }
    setAiLoading(true); setAiResponse('');
    try {
      const t = await callGemini(prompt, apiKey);
      setAiResponse(t);
    } catch (e: any) { setAiResponse(`Error: ${e.message}`); }
    setAiLoading(false);
  };

  const handleAI = (mode: 'quiz' | 'summary' | 'ask') => {
    if (mode === 'quiz') { loadQuiz(); return; }
    setAiMode(mode); setAiResponse(''); setAiInput('');
    if (mode === 'summary') callAI(`Summarize the key concepts of "${title}" in Spring Boot in 4-5 concise bullet points for a student. Be practical and include code concepts where relevant.`);
  };

  const copyCode = (code: string) => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const accent = dark ? '#00ff88' : '#4f46e5';
  const accentBg = dark ? 'rgba(0,255,136,0.08)' : '#eef2ff';
  const accentBorder = dark ? 'rgba(0,255,136,0.2)' : '#c7d2fe';
  const bg = dark ? '#0a0f0d' : '#ffffff';
  const cardBg = dark ? '#0f1713' : '#f9fafb';
  const border = dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb';
  const text = dark ? '#e5e7eb' : '#111827';
  const muted = dark ? '#9ca3af' : '#6b7280';
  const codeBg = dark ? '#0a0f0d' : '#f3f4f6';
  const codeBorder = dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb';

  const code1 = `HTTP Request\n     |\n     v\n+------------------------+\n| Controller Layer        |  @RestController\n|  Receives requests      |\n+------------------------+\n     |\n     v\n+------------------------+\n| Service Layer           |  @Service\n|  Business logic         |\n+------------------------+\n     |\n     v\n+------------------------+\n| Repository Layer        |  @Repository\n|  Data access            |\n+------------------------+`;
  const code2 = `@RestController\n@RequestMapping("/api/books")\npublic class BookController {\n\n    private final BookService bookService;\n\n    // Constructor injection\n    public BookController(BookService bookService) {\n        this.bookService = bookService;\n    }\n\n    @GetMapping\n    public List<Book> getAllBooks() {\n        return bookService.findAll();\n    }\n}`;

  return (
    <div className="flex-1 flex overflow-hidden" style={{ background: bg }}>
      <div className="flex-1 overflow-y-auto px-12 py-10">
        <motion.button initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium mb-8 group transition-colors"
          style={{ color: muted }}
          onMouseEnter={e => (e.currentTarget.style.color = accent)}
          onMouseLeave={e => (e.currentTarget.style.color = muted)}>
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back to module
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="mb-3"><TagBadge tag="LESSON" dark={dark} /></div>
          <h1 className="text-4xl font-black leading-tight mb-8" style={{ color: text }}>{title}</h1>

          {/* AI Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            {([
              { mode: 'quiz' as const,    icon: <Sparkles size={13} />,              label: 'Generate Quiz' },
              { mode: 'summary' as const, icon: <AlignLeft size={13} />,             label: 'Summarize Lesson' },
              { mode: 'ask' as const,     icon: <MessageCircleQuestion size={13} />, label: 'Ask AI' },
            ]).map(({ mode, icon, label }) => (
              <motion.button key={mode} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleAI(mode)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={
                  dark
                    ? aiMode === mode
                      ? { background: 'linear-gradient(to right,rgba(0,255,136,0.15),rgba(0,255,136,0.05))', color: '#00ff88', border: '1px solid rgba(0,255,136,0.4)', boxShadow: '0 0 14px rgba(0,255,136,0.15)' }
                      : { background: 'rgba(15,23,19,0.8)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.15)' }
                    : aiMode === mode
                      ? { background: '#3730a3', color: '#fff', boxShadow: '0 4px 12px rgba(79,70,229,0.35)' }
                      : { background: '#4f46e5', color: '#fff', boxShadow: '0 2px 6px rgba(79,70,229,0.2)' }
                }
              >
                {icon} ✦ {label}
              </motion.button>
            ))}
          </div>

          {/* AI Panels */}
          <AnimatePresence>
            {/* ── QUIZ ── */}
            {aiMode === 'quiz' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-10 overflow-hidden">
                {quizLoading && (
                  <div className="rounded-2xl p-8 flex flex-col items-center gap-4"
                    style={{ background: accentBg, border: `1px solid ${accentBorder}` }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Sparkles size={28} style={{ color: accent }} />
                    </motion.div>
                    <p className="text-sm font-bold" style={{ color: accent }}>Gemini is generating your quiz…</p>
                  </div>
                )}
                {quizError && (
                  <div className="rounded-2xl p-6 flex items-center justify-between"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <p className="text-sm font-medium" style={{ color: '#f87171' }}>{quizError}</p>
                    <div className="flex gap-2">
                      <button onClick={loadQuiz} className="px-3 py-1.5 rounded-lg text-xs font-bold"
                        style={{ background: accent, color: dark ? '#000' : '#fff' }}>Retry</button>
                      <button onClick={() => { setAiMode(null); setQuizError(''); }} style={{ color: '#f87171' }}><X size={15} /></button>
                    </div>
                  </div>
                )}
                {quizQuestions.length > 0 && !quizLoading && (
                  <InteractiveQuiz
                    questions={quizQuestions}
                    dark={dark}
                    onClose={() => { setAiMode(null); setQuizQuestions([]); }}
                    onRetry={loadQuiz}
                  />
                )}
              </motion.div>
            )}

            {/* ── SUMMARY ── */}
            {aiMode === 'summary' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl p-6 mb-10 overflow-hidden"
                style={{ background: accentBg, border: `1px solid ${accentBorder}` }}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold flex items-center gap-2" style={{ color: accent }}>
                    <AlignLeft size={13} /> 📋 Summary
                    <span className="text-[10px] opacity-60">(Gemini 2.5 Flash)</span>
                  </span>
                  <button onClick={() => { setAiMode(null); setAiResponse(''); }} style={{ color: muted }}><X size={15} /></button>
                </div>
                {aiLoading && (
                  <div className="flex items-center gap-3 text-sm" style={{ color: accent }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Sparkles size={15} /></motion.div>
                    Gemini is thinking…
                  </div>
                )}
                {aiResponse && (
                  <div className="relative text-sm leading-relaxed whitespace-pre-wrap rounded-xl p-4 max-h-80 overflow-y-auto"
                    style={{ background: dark ? '#0a0f0d' : '#fff', color: muted, border: `1px solid ${codeBorder}` }}>
                    {aiResponse}
                    <button onClick={() => copyCode(aiResponse)} className="absolute top-2 right-2 p-1.5 rounded-lg"
                      style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', color: muted }}>
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── ASK AI ── */}
            {aiMode === 'ask' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl p-6 mb-10 overflow-hidden"
                style={{ background: accentBg, border: `1px solid ${accentBorder}` }}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold flex items-center gap-2" style={{ color: accent }}>
                    <MessageCircleQuestion size={13} /> 💬 Ask AI
                    <span className="text-[10px] opacity-60">(Gemini 2.5 Flash)</span>
                  </span>
                  <button onClick={() => { setAiMode(null); setAiResponse(''); setAiInput(''); }} style={{ color: muted }}><X size={15} /></button>
                </div>
                <div className="flex gap-3 mb-4">
                  <input
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    style={{ background: dark ? '#0a0f0d' : '#fff', border: `1px solid ${accentBorder}`, color: text }}
                    placeholder="Ask anything about this lesson…"
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && callAI(`Regarding "${title}" in Spring Boot: ${aiInput}`)}
                  />
                  <button onClick={() => callAI(`Regarding "${title}" in Spring Boot: ${aiInput}`)}
                    className="px-5 py-2.5 font-bold text-sm rounded-xl"
                    style={{ background: accent, color: dark ? '#000' : '#fff' }}>Ask</button>
                </div>
                {aiLoading && (
                  <div className="flex items-center gap-3 text-sm" style={{ color: accent }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Sparkles size={15} /></motion.div>
                    Gemini is thinking…
                  </div>
                )}
                {aiResponse && (
                  <div className="relative text-sm leading-relaxed whitespace-pre-wrap rounded-xl p-4 max-h-80 overflow-y-auto"
                    style={{ background: dark ? '#0a0f0d' : '#fff', color: muted, border: `1px solid ${codeBorder}` }}>
                    {aiResponse}
                    <button onClick={() => copyCode(aiResponse)} className="absolute top-2 right-2 p-1.5 rounded-lg"
                      style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', color: muted }}>
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lesson Content */}
          <div className="space-y-12">
            <section id="learn">
              <h2 className="text-2xl font-black mb-4" style={{ color: text }}>What You Will Learn</h2>
              <p className="leading-relaxed mb-5 text-sm" style={{ color: muted }}>
                Real applications have layers — controllers handle HTTP, services contain business logic, models represent data. Spring's answer is <strong style={{ color: text }}>dependency injection</strong>: you declare what you need, and Spring provides it.
              </p>
              <ul className="space-y-2.5">
                {['Understand how Spring Boot applications are organized into layers','Explain Inversion of Control (IoC) and the Application Context','Implement constructor injection in a Spring application','Distinguish between constructor injection and field injection'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: muted }}>
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" style={{ color: dark ? '#00ff88' : '#0d9b6b' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section id="three-layer">
              <h2 className="text-2xl font-black mb-4" style={{ color: text }}>The Three-Layer Architecture</h2>
              <div className="rounded-2xl overflow-hidden" style={{ background: codeBg, border: `1px solid ${codeBorder}` }}>
                <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${codeBorder}`, background: dark ? '#0a0f0d' : '#f3f4f6' }}>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: muted }}>Architecture Diagram</span>
                  <button onClick={() => copyCode(code1)} className="text-xs px-3 py-1 rounded-md flex items-center gap-1"
                    style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#fff', color: muted, border: `1px solid ${codeBorder}` }}>
                    {copied ? <Check size={10} /> : <Copy size={10} />} Copy
                  </button>
                </div>
                <pre className="p-5 font-mono text-sm leading-loose overflow-x-auto" style={{ color: dark ? '#d1d5db' : '#374151' }}>{code1}</pre>
              </div>
            </section>

            <section id="constructor">
              <h2 className="text-2xl font-black mb-4" style={{ color: text }}>Constructor Injection</h2>
              <div className="rounded-2xl overflow-hidden" style={{ background: codeBg, border: `1px solid ${codeBorder}` }}>
                <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${codeBorder}`, background: dark ? '#0a0f0d' : '#f3f4f6' }}>
                  <span className="text-xs font-bold" style={{ color: dark ? '#00ff88' : '#0d9b6b' }}>BookController.java</span>
                  <button onClick={() => copyCode(code2)} className="text-xs px-3 py-1 rounded-md flex items-center gap-1"
                    style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#fff', color: muted, border: `1px solid ${codeBorder}` }}>
                    {copied ? <Check size={10} /> : <Copy size={10} />} Copy
                  </button>
                </div>
                <pre className="p-5 font-mono text-sm leading-loose overflow-x-auto" style={{ color: dark ? '#d1d5db' : '#374151' }}>{code2}</pre>
              </div>
            </section>

            <section id="takeaways">
              <h2 className="text-2xl font-black mb-5" style={{ color: text }}>Key Takeaways</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: 'IoC Principle', desc: 'Spring manages object creation, not your code.' },
                  { title: 'Constructor Injection', desc: 'Preferred method — explicit, testable, immutable.' },
                  { title: '@Autowired', desc: 'Optional on single-constructor classes in modern Spring.' },
                  { title: 'Loose Coupling', desc: 'Layers depend on interfaces, not concrete classes.' },
                ].map((item, i) => (
                  <motion.div key={i} whileHover={{ y: -2 }} className="rounded-xl p-4 transition-all duration-200"
                    style={{ background: cardBg, border: `1px solid ${border}` }}
                    onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = dark ? 'rgba(0,255,136,0.3)' : '#a7e8ce')}
                    onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = border)}>
                    <h4 className="font-bold text-sm mb-1" style={{ color: dark ? '#00ff88' : '#0d9b6b' }}>{item.title}</h4>
                    <p className="text-xs leading-relaxed" style={{ color: muted }}>{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </motion.div>
      </div>

      {/* TOC Sidebar */}
      <aside className="w-56 p-6 overflow-y-auto shrink-0 hidden lg:block"
        style={{ borderLeft: `1px solid ${border}`, background: dark ? 'rgba(12,18,15,0.5)' : '#fafafa' }}>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: muted }}>Contents</h3>
        <nav className="space-y-0.5">
          {LESSON_SECTIONS.map(sec => (
            <button key={sec.id} onClick={() => setActiveSection(sec.id)}
              className="w-full text-left text-xs py-1.5 px-2 rounded transition-all duration-150"
              style={activeSection === sec.id ? { color: accent, fontWeight: 600, borderLeft: `2px solid ${accent}`, paddingLeft: 6 } : { color: muted }}
            >{sec.title}</button>
          ))}
        </nav>
      </aside>

      <AIChatBubble dark={dark} apiKey={apiKey} lessonTitle={title} />
    </div>
  );
};

// ─── Add Material Modal ───────────────────────────────────────────────────────

const AddMaterialModal = ({ dark, onClose, onAdd, existingDates }: {
  dark: boolean;
  onClose: () => void;
  onAdd: (date: string, item: ActivityItem) => void;
  existingDates: string[];
}) => {
  const [form, setForm] = useState({
    date: existingDates[0] || '',
    newDate: '',
    useNewDate: false,
    tag: 'LESSON' as TagType,
    title: '',
    mandatory: false,
    feedback: false,
    content: '',
  });
  const accent = dark ? '#00ff88' : '#4f46e5';

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const date = form.useNewDate ? form.newDate : form.date;
    if (!date) return;
    const newItem: ActivityItem = {
      id: Date.now().toString(),
      tag: form.tag,
      title: form.title.trim(),
      mandatory: form.mandatory,
      feedback: form.feedback,
      content: form.content,
    };
    onAdd(date, newItem);
    onClose();
  };

  const inputStyle = {
    background: dark ? '#0a0f0d' : '#f9fafb',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
    color: dark ? '#e5e7eb' : '#111827',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ background: dark ? '#0f1713' : '#fff', border: `1px solid ${dark ? 'rgba(0,255,136,0.15)' : '#e5e7eb'}` }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-lg" style={{ color: dark ? '#e5e7eb' : '#111827' }}>Add Material</h3>
          <button onClick={onClose} style={{ color: dark ? '#9ca3af' : '#6b7280' }}><X size={18} /></button>
        </div>

        <div className="space-y-4">
          {/* Date selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: dark ? '#9ca3af' : '#6b7280' }}>
              Date
            </label>
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setForm(f => ({ ...f, useNewDate: false }))}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: !form.useNewDate ? accent : (dark ? '#0a0f0d' : '#f3f4f6'), color: !form.useNewDate ? (dark ? '#000' : '#fff') : (dark ? '#9ca3af' : '#6b7280') }}>
                Existing Date
              </button>
              <button
                onClick={() => setForm(f => ({ ...f, useNewDate: true }))}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: form.useNewDate ? accent : (dark ? '#0a0f0d' : '#f3f4f6'), color: form.useNewDate ? (dark ? '#000' : '#fff') : (dark ? '#9ca3af' : '#6b7280') }}>
                New Date
              </button>
            </div>
            {form.useNewDate ? (
              <input
                className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                style={inputStyle}
                placeholder="e.g. 17 Mar 2026"
                value={form.newDate}
                onChange={e => setForm(f => ({ ...f, newDate: e.target.value }))}
              />
            ) : (
              <select
                className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}>
                {existingDates.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
          </div>

          {/* Tag */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: dark ? '#9ca3af' : '#6b7280' }}>Type</label>
            <div className="flex flex-wrap gap-2">
              {(['LESSON', 'SELF GUIDED', 'LAB', 'HOMEWORK', 'EXTRA'] as TagType[]).map(tag => {
                const s = dark ? TAG_DARK[tag] : TAG_LIGHT[tag];
                return (
                  <button key={tag} onClick={() => setForm(f => ({ ...f, tag }))}
                    className="text-[9px] font-bold px-2.5 py-1 rounded border uppercase transition-all"
                    style={{
                      background: form.tag === tag ? s.bg : 'transparent',
                      color: form.tag === tag ? s.text : (dark ? '#6b7280' : '#9ca3af'),
                      borderColor: form.tag === tag ? s.border : (dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb'),
                      transform: form.tag === tag ? 'scale(1.05)' : 'scale(1)',
                    }}>
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: dark ? '#9ca3af' : '#6b7280' }}>Title *</label>
            <input
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              style={inputStyle}
              placeholder="Lesson title..."
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* Flags */}
          <div className="flex gap-4">
            {[
              { key: 'mandatory', label: 'Mandatory' },
              { key: 'feedback', label: 'Has Feedback' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setForm(f => ({ ...f, [key]: !f[key as keyof typeof f] }))}
                  className="w-4 h-4 rounded flex items-center justify-center transition-all"
                  style={{
                    background: form[key as keyof typeof form] ? accent : 'transparent',
                    border: `2px solid ${form[key as keyof typeof form] ? accent : (dark ? 'rgba(255,255,255,0.2)' : '#d1d5db')}`,
                  }}>
                  {form[key as keyof typeof form] && <Check size={10} color={dark ? '#000' : '#fff'} />}
                </div>
                <span className="text-xs font-medium" style={{ color: dark ? '#9ca3af' : '#6b7280' }}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', color: dark ? '#9ca3af' : '#6b7280' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: accent, color: dark ? '#000' : '#fff' }}>
            Add Material
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Module Page ──────────────────────────────────────────────────────────────

const ModulePage = ({ onSelectLesson, dark, moduleData, setModuleData, isAdmin }: {
  onSelectLesson: (t: string) => void;
  dark: boolean;
  moduleData: DayColumn[];
  setModuleData: React.Dispatch<React.SetStateAction<DayColumn[]>>;
  isAdmin?: boolean;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = moduleData
    .map(day => ({ ...day, items: searchQuery ? day.items.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase())) : day.items }))
    .filter(day => day.items.length > 0);

  const mandatoryCount = moduleData.flatMap(d => d.items).filter(i => i.mandatory).length;
  const completedCount = moduleData.flatMap(d => d.items).filter(i => i.completed).length;
  const totalCount = moduleData.flatMap(d => d.items).length;

  const handleAddMaterial = (date: string, item: ActivityItem) => {
    setModuleData(prev => {
      const existing = prev.find(d => d.date === date);
      if (existing) return prev.map(d => d.date === date ? { ...d, items: [...d.items, item] } : d);
      return [...prev, { date, items: [item] }];
    });
  };

  const handleToggleComplete = (id: string) => {
    setModuleData(prev => prev.map(day => ({
      ...day,
      items: day.items.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    })));
  };

  const handleDeleteItem = (id: string) => {
    setModuleData(prev => prev.map(day => ({ ...day, items: day.items.filter(i => i.id !== id) })).filter(d => d.items.length > 0));
  };

  const bg = dark ? '#0a0f0d' : '#f9fafb';
  const text = dark ? '#e5e7eb' : '#111827';
  const muted = dark ? '#9ca3af' : '#6b7280';
  const border = dark ? 'rgba(255,255,255,0.06)' : '#e5e7eb';
  const btnBg = dark ? '#0f1713' : '#ffffff';
  const accent = dark ? '#00ff88' : '#4f46e5';

  return (
    <div className="flex-1 overflow-y-auto px-10 py-8" style={{ background: bg }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
          <h1 className="text-3xl font-black" style={{ color: text }}>
            <span style={{ color: muted }}>Unit 2</span>
            <span className="mx-3" style={{ color: border }}>|</span>
            Spring Boot & REST APIs
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <AnimatePresence>
              {showSearch && (
                <motion.input initial={{ width: 0, opacity: 0 }} animate={{ width: 200, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                  className="rounded-xl px-4 py-2 text-sm focus:outline-none"
                  style={{ background: btnBg, border: `1px solid ${border}`, color: text }}
                  placeholder="Search lessons..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus />
              )}
            </AnimatePresence>
            <button onClick={() => { setShowSearch(s => !s); setSearchQuery(''); }}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-medium transition-all"
              style={{ background: btnBg, color: muted, border: `1px solid ${border}` }}>
              <Search size={14} /> Search
            </button>
            {isAdmin && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl font-bold transition-all"
                style={{ background: accent, color: dark ? '#000' : '#fff', boxShadow: `0 0 15px ${accent}33` }}>
                <Plus size={14} /> Add Material
              </motion.button>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: dark ? 'rgba(0,255,136,0.05)' : '#f3f4f6', color: dark ? '#00ff88' : '#374151', border: `1px solid ${dark ? 'rgba(0,255,136,0.2)' : '#e5e7eb'}` }}>
            {mandatoryCount} mandatory
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ background: dark ? 'rgba(168,85,247,0.05)' : '#f5f3ff', color: dark ? '#a855f7' : '#6d28d9', border: `1px solid ${dark ? 'rgba(168,85,247,0.2)' : '#ddd6fe'}` }}>
            {completedCount}/{totalCount} completed
          </div>
          <div className="flex-1 max-w-xs">
            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#e5e7eb' }}>
              <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                animate={{ width: `${Math.round((completedCount / totalCount) * 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ background: accent }} />
            </div>
          </div>
          <span className="text-xs font-bold" style={{ color: accent }}>{Math.round((completedCount / totalCount) * 100)}%</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filtered.map((day, di) => (
          <motion.div key={day.date} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.04 }} className="space-y-2">
            <h2 className="text-sm font-semibold mb-3 pb-2" style={{ color: muted, borderBottom: `1px solid ${border}` }}>{day.date}</h2>
            {day.items.map((item) => (
              <div key={item.id} className="relative group/card">
                <ActivityCard item={item} onClick={() => onSelectLesson(item.title)} onToggleComplete={isAdmin ? handleToggleComplete : undefined} dark={dark} isAdmin={isAdmin} />
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
                    style={{ background: '#ef4444', color: '#fff', boxShadow: '0 2px 6px rgba(239,68,68,0.4)' }}>
                    <X size={10} />
                  </button>
                )}
              </div>
            ))}
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full rounded-xl p-2.5 text-center text-xs font-medium transition-all opacity-0 group-hover:opacity-100 border-dashed"
                style={{ color: muted, border: `1px dashed ${dark ? 'rgba(255,255,255,0.1)' : '#d1d5db'}` }}>
                + Add here
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddMaterialModal
            dark={dark}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddMaterial}
            existingDates={moduleData.map(d => d.date)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Settings Page ────────────────────────────────────────────────────────────

const SettingsPage = ({ dark, apiKey, setApiKey }: { dark: boolean; apiKey: string; setApiKey: (k: string) => void }) => {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setApiKey(keyInput);
    localStorage.setItem('gemini_api_key', keyInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const accent = dark ? '#00ff88' : '#4f46e5';
  const text = dark ? '#e5e7eb' : '#111827';
  const muted = dark ? '#9ca3af' : '#6b7280';
  const cardBg = dark ? '#0f1713' : '#ffffff';
  const cardBorder = dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb';
  const inputBg = dark ? '#0a0f0d' : '#f9fafb';

  return (
    <div className="p-10 max-w-2xl mx-auto w-full space-y-8">
      <h2 className="text-3xl font-black" style={{ color: text }}>Settings</h2>

      {/* API Key */}
      <div className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
        <h3 className="font-bold mb-1" style={{ color: text }}>🤖 Gemini API Key</h3>
        <p className="text-xs mb-4" style={{ color: muted }}>Required for AI features (Quiz, Summary, Ask AI, Chat). Uses Gemini 2.5 Flash.</p>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type={showKey ? 'text' : 'password'}
              className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none pr-10"
              style={{ background: inputBg, border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`, color: text }}
              placeholder="AIza..."
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: muted }} onClick={() => setShowKey(s => !s)}>
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={save}
            className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
            style={{ background: saved ? '#22c55e' : accent, color: dark ? '#000' : '#fff' }}>
            {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Key</>}
          </motion.button>
        </div>
        {apiKey && (
          <p className="text-[10px] mt-2 flex items-center gap-1.5 font-medium" style={{ color: '#22c55e' }}>
            <Check size={10} /> API key is set and active
          </p>
        )}
      </div>

      {/* App Info */}
      <div className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
        <h3 className="font-bold mb-4" style={{ color: text }}>ℹ️ App Info</h3>
        <div className="space-y-3 text-sm">
          {[
            { label: 'Version', value: '2.0.0' },
            { label: 'AI Model', value: 'Gemini 2.5 Flash' },
            { label: 'Framework', value: 'React + Framer Motion' },
            { label: 'Theme', value: dark ? 'Dark (HeroCode)' : 'Light' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span style={{ color: muted }}>{label}</span>
              <span className="font-medium" style={{ color: text }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Admin Panel ──────────────────────────────────────────────────────────────

const AdminPanelPage = ({ dark, moduleData, setModuleData }: {
  dark: boolean;
  moduleData: DayColumn[];
  setModuleData: React.Dispatch<React.SetStateAction<DayColumn[]>>;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeView, setActiveView] = useState<'users' | 'materials' | 'stats'>('users');

  const accent = dark ? '#00ff88' : '#4f46e5';
  const text = dark ? '#e5e7eb' : '#111827';
  const muted = dark ? '#9ca3af' : '#6b7280';
  const cardBg = dark ? '#0f1713' : '#ffffff';
  const cardBorder = dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb';
  const bg = dark ? '#0a0f0d' : '#f9fafb';

  const [users, setUsers] = useState([
    { id: 1, username: 'Hero_Coder_2026', email: 'coder@adnsue.edu.az', level: 42, status: 'Online', skills: [{ name: 'JS', progress: 85 }, { name: 'C#', progress: 95 }] },
    { id: 2, username: 'AlgoMaster', email: 'algo@gmail.com', level: 99, status: 'Offline', skills: [{ name: 'Py', progress: 90 }, { name: 'JS', progress: 40 }] },
    { id: 3, username: 'ByteCommander', email: 'byte@code.az', level: 85, status: 'Online', skills: [{ name: 'C#', progress: 70 }] },
    { id: 4, username: 'DebugQueen', email: 'debug@herocode.az', level: 38, status: 'Online', skills: [{ name: 'JS', progress: 55 }, { name: 'Py', progress: 30 }] },
    { id: 5, username: 'ScriptKid', email: 'script@gmail.com', level: 25, status: 'Offline', skills: [{ name: 'JS', progress: 20 }] },
  ]);

  const deleteUser = (id: number) => setUsers(prev => prev.filter(u => u.id !== id));
  const toggleUserStatus = (id: number) => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Online' ? 'Offline' : 'Online' } : u));

  const allItems = moduleData.flatMap(d => d.items);
  const completedItems = allItems.filter(i => i.completed).length;
  const mandatoryItems = allItems.filter(i => i.mandatory).length;

  const handleAddMaterial = (date: string, item: ActivityItem) => {
    setModuleData(prev => {
      const existing = prev.find(d => d.date === date);
      if (existing) return prev.map(d => d.date === date ? { ...d, items: [...d.items, item] } : d);
      return [...prev, { date, items: [item] }];
    });
  };

  const handleDeleteMaterial = (id: string) => {
    setModuleData(prev => prev.map(d => ({ ...d, items: d.items.filter(i => i.id !== id) })).filter(d => d.items.length > 0));
  };

  const handleToggleComplete = (id: string) => {
    setModuleData(prev => prev.map(day => ({
      ...day,
      items: day.items.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
    })));
  };

  const stats = [
    { label: 'Total Users', val: users.length.toString(), icon: Users, color: 'text-blue-400', delta: '+2' },
    { label: 'Online Now', val: users.filter(u => u.status === 'Online').length.toString(), icon: PlayCircle, color: 'text-green-400', delta: '+1' },
    { label: 'Total Materials', val: allItems.length.toString(), icon: BookOpen, color: 'text-yellow-400', delta: `+${allItems.length}` },
    { label: 'Completion Rate', val: `${Math.round((completedItems / allItems.length) * 100)}%`, icon: Target, color: 'text-purple-400', delta: '↑' },
  ];

  const viewTabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'materials', label: 'Materials', icon: BookOpen },
    { id: 'stats', label: 'Stats', icon: BarChart2 },
  ] as const;

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: bg }}>
      <div className="p-8 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.25)' }}>
              <ShieldCheck size={22} style={{ color: '#a855f7' }} />
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{ color: text }}>Admin Dashboard</h1>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: muted }}>HeroCode Control Center</p>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: accent, color: dark ? '#000' : '#fff', boxShadow: `0 0 15px ${accent}33` }}>
            <Plus size={15} /> Add Material
          </motion.button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl"
              style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-xl ${stat.color}`} style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }}>
                  <stat.icon size={18} />
                </div>
                <span className="text-[10px] font-bold" style={{ color: accent }}>{stat.delta}</span>
              </div>
              <p className="text-2xl font-black italic" style={{ color: text }}>{stat.val}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: muted }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* View Tabs */}
        <div className="flex gap-2">
          {viewTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveView(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={activeView === tab.id
                ? { background: accent, color: dark ? '#000' : '#fff' }
                : { background: cardBg, color: muted, border: `1px solid ${cardBorder}` }}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* USERS TABLE */}
        {activeView === 'users' && (
          <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            <div className="p-5 flex justify-between items-center" style={{ borderBottom: `1px solid ${cardBorder}` }}>
              <h2 className="font-bold flex items-center gap-2" style={{ color: text }}>
                <Users size={16} style={{ color: accent }} /> Users ({users.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase())).length})
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ color: muted }} />
                <input className="rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none w-52"
                  style={{ background: dark ? '#0a0f0d' : '#f9fafb', border: `1px solid ${cardBorder}`, color: text }}
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ background: dark ? 'rgba(255,255,255,0.02)' : '#f9fafb' }}>
                    {['User', 'Level & Status', 'Skills', 'Email', 'Actions'].map((h, i) => (
                      <th key={h} className="p-5 text-[10px] font-black uppercase tracking-widest" style={{ color: muted, textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase())).map((user, i) => (
                    <tr key={user.id} className="group transition-colors"
                      style={{ borderTop: `1px solid ${cardBorder}` }}
                      onMouseEnter={e => (e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.01)' : '#fafafa')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm"
                            style={{ background: dark ? 'rgba(0,255,136,0.1)' : '#eef2ff', color: accent, border: `1px solid ${dark ? 'rgba(0,255,136,0.2)' : '#c7d2fe'}` }}>
                            {user.username[0]}
                          </div>
                          <div>
                            <p className="font-bold text-sm" style={{ color: text }}>{user.username}</p>
                            <p className="text-[10px] font-mono" style={{ color: muted }}>UID: #00{user.id}294</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="font-black italic text-sm" style={{ color: accent }}>LVL {user.level}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Online' ? 'bg-green-500' : 'bg-gray-500'}`}
                            style={{ boxShadow: user.status === 'Online' ? '0 0 6px rgba(34,197,94,0.6)' : 'none' }} />
                          <span className="text-[10px] font-bold uppercase" style={{ color: muted }}>{user.status}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="space-y-2 min-w-[130px]">
                          {user.skills.map((skill, idx) => (
                            <div key={idx}>
                              <div className="flex justify-between text-[9px] font-bold uppercase mb-1">
                                <span style={{ color: muted }}>{skill.name}</span>
                                <span style={{ color: accent }}>{skill.progress}%</span>
                              </div>
                              <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb' }}>
                                <div className="h-full rounded-full" style={{ width: `${skill.progress}%`, background: accent }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-5 text-xs font-mono italic" style={{ color: muted }}>{user.email}</td>
                      <td className="p-5">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => toggleUserStatus(user.id)}
                            className="p-2 rounded-lg transition-all"
                            style={{ color: user.status === 'Online' ? '#fbbf24' : '#22c55e' }}
                            onMouseEnter={e => (e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            title="Toggle status">
                            <Zap size={15} />
                          </button>
                          <button onClick={() => deleteUser(user.id)}
                            className="p-2 rounded-lg transition-all"
                            style={{ color: '#ef4444' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            title="Delete user">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MATERIALS VIEW */}
        {activeView === 'materials' && (
          <div className="space-y-4">
            {moduleData.map(day => (
              <div key={day.date} className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${cardBorder}` }}>
                  <h3 className="font-bold text-sm" style={{ color: text }}>{day.date}</h3>
                  <span className="text-xs" style={{ color: muted }}>{day.items.length} items</span>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {day.items.map(item => {
                    const s = dark ? TAG_DARK[item.tag] : TAG_LIGHT[item.tag];
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-xl group"
                        style={{ background: dark ? '#0a0f0d' : '#f9fafb', border: `1px solid ${cardBorder}` }}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0"
                            style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
                            {item.tag}
                          </span>
                          <span className="text-xs truncate" style={{ color: item.completed ? muted : text }}>{item.title}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleToggleComplete(item.id)}
                            style={{ color: item.completed ? accent : muted }}>
                            <CheckCircle2 size={13} />
                          </button>
                          <button onClick={() => handleDeleteMaterial(item.id)} style={{ color: '#ef4444' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STATS VIEW */}
        {activeView === 'stats' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: text }}>
                <TrendingUp size={16} style={{ color: accent }} /> Completion by Tag
              </h3>
              {(['LESSON', 'LAB', 'HOMEWORK', 'SELF GUIDED', 'EXTRA'] as TagType[]).map(tag => {
                const tagItems = allItems.filter(i => i.tag === tag);
                const done = tagItems.filter(i => i.completed).length;
                const pct = tagItems.length > 0 ? Math.round((done / tagItems.length) * 100) : 0;
                const s = dark ? TAG_DARK[tag] : TAG_LIGHT[tag];
                return (
                  <div key={tag} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: s.text }}>{tag}</span>
                      <span style={{ color: muted }}>{done}/{tagItems.length} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#e5e7eb' }}>
                      <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{ background: s.text }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl p-6" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: text }}>
                <Calendar size={16} style={{ color: accent }} /> Activity by Date
              </h3>
              {moduleData.slice(0, 6).map(day => (
                <div key={day.date} className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-mono w-20 shrink-0" style={{ color: muted }}>{day.date.split(' ').slice(0, 2).join(' ')}</span>
                  <div className="flex-1 flex gap-1">
                    {day.items.map(item => {
                      const s = dark ? TAG_DARK[item.tag] : TAG_LIGHT[item.tag];
                      return (
                        <div key={item.id} className="h-4 flex-1 rounded-sm" title={item.title}
                          style={{ background: item.completed ? s.text : s.bg, border: `1px solid ${s.border}`, opacity: item.completed ? 1 : 0.5 }} />
                      );
                    })}
                  </div>
                  <span className="text-[10px]" style={{ color: muted }}>{day.items.filter(i => i.completed).length}/{day.items.length}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddMaterialModal
            dark={dark}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddMaterial}
            existingDates={moduleData.map(d => d.date)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Notification Panel ───────────────────────────────────────────────────────

const NotificationPanel = ({ dark, onClose }: { dark: boolean; onClose: () => void }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'New Lab Available', message: 'LAB | REST API (Part 2) is now unlocked.', time: '2m ago', read: false, type: 'info' },
    { id: '2', title: 'Homework Due', message: 'Final Project Sprint 1 is due in 2 days!', time: '1h ago', read: false, type: 'warning' },
    { id: '3', title: 'Feedback Ready', message: 'Your LAB | Spring Boot Intro has new feedback.', time: '3h ago', read: true, type: 'success' },
    { id: '4', title: 'Level Up!', message: 'You reached Level 12. Keep it up! 🎉', time: '1d ago', read: true, type: 'success' },
  ]);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const unread = notifications.filter(n => !n.read).length;
  const accent = dark ? '#00ff88' : '#4f46e5';
  const text = dark ? '#e5e7eb' : '#111827';
  const muted = dark ? '#9ca3af' : '#6b7280';
  const bg = dark ? '#0f1713' : '#fff';
  const border = dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb';

  const typeColor = { info: '#3b82f6', success: '#22c55e', warning: '#f59e0b' };

  return (
    <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="absolute top-full right-0 mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden z-50"
      style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${border}` }}>
        <span className="font-bold text-sm" style={{ color: text }}>Notifications {unread > 0 && <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-bold" style={{ background: accent, color: dark ? '#000' : '#fff' }}>{unread}</span>}</span>
        <div className="flex items-center gap-2">
          {unread > 0 && <button className="text-[10px] font-medium" style={{ color: accent }} onClick={markAllRead}>Mark all read</button>}
          <button onClick={onClose} style={{ color: muted }}><X size={14} /></button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {notifications.map(n => (
          <div key={n.id} className="p-4 flex gap-3 transition-colors cursor-pointer"
            style={{ borderBottom: `1px solid ${border}`, background: n.read ? 'transparent' : (dark ? 'rgba(0,255,136,0.02)' : '#fafff9') }}
            onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = dark ? 'rgba(255,255,255,0.02)' : '#f9fafb')}
            onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = n.read ? 'transparent' : (dark ? 'rgba(0,255,136,0.02)' : '#fafff9'))}
            onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}>
            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.read ? 'transparent' : typeColor[n.type], border: n.read ? `1px solid ${border}` : 'none' }} />
            <div>
              <p className="text-xs font-bold" style={{ color: n.read ? muted : text }}>{n.title}</p>
              <p className="text-[11px] mt-0.5" style={{ color: muted }}>{n.message}</p>
              <p className="text-[10px] mt-1" style={{ color: dark ? '#4b5563' : '#d1d5db' }}>{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [dark, setDark] = useState(true);
  const [moduleData, setModuleData] = useState<DayColumn[]>(INITIAL_MODULE_DATA);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || 'AIzaSyBJE1Ra-0jm-_zgB4qGkKtbHStia_TM9iU');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Click outside to close notifications
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const bg          = dark ? '#0a0f0d' : '#f9fafb';
  const sidebarBg   = dark ? 'rgba(12,18,15,0.8)' : '#ffffff';
  const sidebarBrd  = dark ? 'rgba(255,255,255,0.06)' : '#e5e7eb';
  const accent      = dark ? '#00ff88' : '#4f46e5';
  const text        = dark ? '#ffffff' : '#111827';
  const muted       = dark ? '#9ca3af' : '#6b7280';
  const cardBg      = dark ? '#0f1713' : '#ffffff';
  const cardBorder  = dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb';
  const navActive   = dark
    ? { background: 'linear-gradient(to right,rgba(0,255,136,0.15),rgba(0,255,136,0.05))', color: '#00ff88', boxShadow: '0 0 20px rgba(0,255,136,0.18)' }
    : { background: '#eef2ff', color: '#4f46e5' };
  const navInactive = dark ? { color: '#9ca3af' } : { color: '#6b7280' };

  // Simulated user data
  const displayUser = {
    username: 'Hero_Coder_2026',
    fullName: 'Əli Həsənov',
    email: 'coder@adnsue.edu.az',
    birthDate: '15 Apr 2003',
    skillLevel: 'intermediate',
    currentLevel: 12,
    xp: 2400,
    languages: [
      { name: 'JavaScript', stage: 'Beginner', progress: 28, totalLevels: 10 },
      { name: 'Python', stage: 'Not Started', progress: 0, totalLevels: 10 },
      { name: 'C#', stage: 'Not Started', progress: 0, totalLevels: 10 },
    ],
    character: { gender: 'male' as const, emotion: 'neutral' as EmotionType, clothing: 'tshirt' as ClothingType, hairColor: '#b96321', skin: '#ffdbac', clothingColor: '#3b82f6' },
  };

  const leaderboardData = [
    { rank: 1, name: 'AlgoMaster', level: 99, xp: 12500, trend: '+125' },
    { rank: 2, name: 'ByteCommander', level: 85, xp: 10200, trend: '+88' },
    { rank: 3, name: displayUser.username, level: displayUser.currentLevel, xp: displayUser.xp, isMe: true, trend: '+240' },
    { rank: 4, name: 'DebugQueen', level: 38, xp: 7100, trend: '+55' },
    { rank: 5, name: 'ScriptKid', level: 25, xp: 4500, trend: '+30' },
  ];

  const topics: Record<string, string[]> = {
    JavaScript: ['Dəyişənlər', 'Data Tipləri', 'Funksiyalar', 'Döngülər', 'DOM', 'Events', 'Promises', 'Async/Await', 'ES6+', 'Final Boss'],
    Python: ['Syntax', 'Lists', 'Tuples', 'Dictionaries', 'Functions', 'OOP', 'Pip', 'Flask/Django', 'Data Sci', 'Neural Nets'],
    'C#': ['Basics', 'Classes', 'Methods', 'Inheritance', 'Interfaces', 'LINQ', 'Async', 'Unity API', 'Networking', 'Optimization'],
  };

  const unreadNotifCount = 2;

  const navItems = [
    { id: 'profile', icon: User, label: 'Profil' },
    { id: 'modules', icon: BookOpen, label: 'Modules' },
    { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const renderLevelMap = (langName: string, progress: number, totalLevels: number) => {
    const currentLevel = Math.ceil((progress / 100) * totalLevels);
    const currentTopics = topics[langName] || Array(totalLevels).fill('Kodlama');
    return (
      <div className="mt-6 p-8 rounded-[40px] shadow-2xl transition-all duration-700"
        style={{ background: dark ? 'rgba(12,18,15,0.6)' : '#f9fafb', border: dark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #e5e7eb' }}>
        <h4 className="font-bold mb-12 text-center text-xl tracking-widest uppercase" style={{ color: accent }}>{langName} Yol Xəritəsi</h4>
        <div className="relative max-w-md mx-auto py-10">
          <div className="absolute top-0 bottom-0 left-1/2 w-1 -translate-x-1/2 rounded-full" style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb' }} />
          <div className="space-y-16">
            {[...Array(totalLevels)].map((_, i) => {
              const levelNum = i + 1;
              const isCompleted = levelNum < currentLevel;
              const isCurrent = levelNum === currentLevel;
              const isLocked = levelNum > currentLevel;
              return (
                <div key={i}
                  className={`relative flex items-center gap-6 transition-all duration-500 ${i % 2 === 0 ? 'md:translate-x-12 flex-row' : 'md:-translate-x-12 flex-row-reverse'}`}>
                  <button className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group ${isCompleted ? 'text-black shadow-[0_0_20px_rgba(0,255,136,0.3)]' : isCurrent ? 'border-4 border-purple-500 shadow-[0_0_25px_rgba(0,255,136,0.6)]' : dark ? 'bg-[#1a231e] text-gray-600 border border-white/10 grayscale' : 'bg-gray-100 text-gray-400 border border-gray-200 grayscale'}`}
                    style={(isCompleted || isCurrent) ? { background: accent } : {}}>
                    {isCompleted ? <CheckCircle2 size={24} /> : isLocked ? <Lock size={20} /> : <span className="font-black text-lg" style={{ color: dark ? '#fff' : '#111' }}>{levelNum}</span>}
                    <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-purple-600 text-white text-[10px] px-2 py-1 rounded-md font-bold">BAŞLAT</div>
                  </button>
                  <div className={`flex flex-col ${i % 2 === 0 ? 'text-left' : 'text-right'} max-w-[150px]`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: isLocked ? muted : '#a855f7' }}>Level {levelNum}</span>
                    <h5 className="text-sm font-bold leading-tight" style={{ color: isLocked ? muted : text }}>{currentTopics[i]}</h5>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans flex overflow-hidden" style={{ background: bg }}>
      {dark && <div className="fixed inset-0 pointer-events-none opacity-20" style={{ background: 'radial-gradient(circle at 50% -20%,rgba(0,255,136,0.13),transparent 50%)' }} />}

      {/* ── Sidebar ── */}
      <aside className="w-64 p-6 flex flex-col gap-6 shrink-0 z-10 backdrop-blur-md"
        style={{ background: sidebarBg, borderRight: `1px solid ${sidebarBrd}`, boxShadow: dark ? 'none' : '2px 0 8px rgba(0,0,0,0.04)' }}>

        {/* Logo row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl cursor-pointer" style={{ color: accent }}>
            <Code2 size={26} /><span>HeroCode</span>
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setDark(d => !d)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb' }}>
            {dark ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#4f46e5" />}
          </motion.button>
        </div>

        {/* Mini user info */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: dark ? 'rgba(255,255,255,0.03)' : '#f9fafb', border: `1px solid ${sidebarBrd}` }}>
          <div className="w-8 h-8 rounded-lg overflow-hidden" style={{ border: `1px solid ${accent}44` }}>
            <PixelCharacter char={{ ...displayUser.character, variant: 'closeup' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate" style={{ color: text }}>{displayUser.username}</p>
            <p className="text-[10px]" style={{ color: accent }}>LVL {displayUser.currentLevel}</p>
          </div>
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotifications(s => !s)} className="relative p-1" style={{ color: muted }}>
              {unreadNotifCount > 0 ? <BellDot size={16} style={{ color: accent }} /> : <Bell size={16} />}
            </button>
            <AnimatePresence>
              {showNotifications && <NotificationPanel dark={dark} onClose={() => setShowNotifications(false)} />}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map(tab => (
            <button key={tab.id}
              onClick={() => { setActiveTab(tab.id); setOpenLesson(null); }}
              className="group relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 text-sm font-semibold"
              style={activeTab === tab.id ? navActive : navInactive}
              onMouseEnter={e => activeTab !== tab.id && ((e.currentTarget as HTMLButtonElement).style.color = text)}
              onMouseLeave={e => activeTab !== tab.id && ((e.currentTarget as HTMLButtonElement).style.color = muted)}>
              {activeTab === tab.id && (
                <motion.div layoutId="nav-pill" className="absolute rounded-full"
                  style={{ left: -4, top: '50%', translateY: '-50%', width: 6, height: 32, background: accent }}
                  initial={{ height: 0 }} animate={{ height: 32 }} transition={{ duration: 0.35 }} />
              )}
              <tab.icon size={19} className="transition-transform group-hover:scale-110" />
              {tab.label}
            </button>
          ))}

          {/* Admin toggle */}
          <button
            onClick={() => { setIsAdmin(a => !a); if (!isAdmin) setActiveTab('admin'); else setActiveTab('profile'); }}
            className="group relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 text-sm font-semibold mt-1"
            style={activeTab === 'admin' ? { background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.25)' } : navInactive}
            onMouseEnter={e => activeTab !== 'admin' && ((e.currentTarget as HTMLButtonElement).style.color = text)}
            onMouseLeave={e => activeTab !== 'admin' && ((e.currentTarget as HTMLButtonElement).style.color = muted)}>
            <ShieldCheck size={19} className="transition-transform group-hover:scale-110" />
            Admin Panel
            {isAdmin && <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-black" style={{ background: '#a855f7', color: '#fff' }}>ON</span>}
          </button>

          {/* Live Match */}
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}
            className="group relative flex items-center gap-3.5 px-5 py-4 rounded-2xl mt-2 overflow-hidden transition-all duration-300"
            style={{ background: 'linear-gradient(135deg,rgba(185,28,28,0.3),rgba(220,38,38,0.2),rgba(153,27,27,0.15))', border: '1px solid rgba(239,68,68,0.4)', color: '#fecaca', boxShadow: '0 4px 20px rgba(239,68,68,0.25),inset 0 1px 0 rgba(255,255,255,0.08)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.7)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.4)'; (e.currentTarget as HTMLButtonElement).style.color = '#fecaca'; }}>
            <div className="flex items-center gap-3.5 relative">
              <Crown size={24} className="text-yellow-400/90" strokeWidth={2.3} />
              <span className="font-semibold tracking-wide text-base">Live Match</span>
            </div>
            <motion.div className="absolute top-1 right-1.5 text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider"
              style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', border: '1px solid rgba(239,68,68,0.6)', boxShadow: '0 2px 8px rgba(239,68,68,0.4)' }}
              initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.25 }}>
              NEW
            </motion.div>
          </motion.button>
        </nav>

        <button className="flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-medium"
          style={{ color: '#f87171' }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.08)')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}>
          <LogOut size={18} /> Çıxış et
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto flex flex-col relative">

        {/* Modules tab */}
        {activeTab === 'modules' && (
          openLesson
            ? <LessonDetail title={openLesson} onBack={() => setOpenLesson(null)} dark={dark} apiKey={apiKey} />
            : <ModulePage onSelectLesson={setOpenLesson} dark={dark} moduleData={moduleData} setModuleData={setModuleData} isAdmin={isAdmin} />
        )}

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <div className="p-10 space-y-12">
            {/* Hero row */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(0,255,136,0.2)]"
                style={{ border: `2px solid ${accent}`, background: dark ? '#0f1713' : '#f3f4f6' }}>
                <PixelCharacter char={{ ...displayUser.character, variant: 'closeup' }} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: muted }}>Qəhrəman Səviyyəsi</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black italic tracking-tighter" style={{ color: accent }}>LVL {displayUser.currentLevel}</span>
                  <span className="font-bold text-sm" style={{ color: '#a855f7' }}>{displayUser.skillLevel.toUpperCase()}</span>
                </div>
                <span className="text-xl mt-2 font-semibold" style={{ color: text }}>{displayUser.fullName}</span>
              </div>
              {/* XP bar */}
              <div className="ml-auto">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={13} style={{ color: accent }} />
                  <span className="text-xs font-bold" style={{ color: accent }}>{displayUser.xp.toLocaleString()} XP</span>
                </div>
                <div className="w-40 h-2 rounded-full overflow-hidden" style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#e5e7eb' }}>
                  <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: '62%' }} transition={{ duration: 1, ease: 'easeOut' }}
                    style={{ background: `linear-gradient(to right, ${accent}, #a855f7)` }} />
                </div>
                <p className="text-[10px] mt-1 text-right" style={{ color: muted }}>Next: LVL {displayUser.currentLevel + 1}</p>
              </div>
            </motion.div>

            <div className="max-w-4xl mx-auto space-y-8">
              {/* Profile card */}
              <section className="rounded-3xl p-8 shadow-2xl" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {[
                      { label: 'İstifadəçi Adı', value: displayUser.username, size: 'text-2xl font-semibold' },
                      { label: 'Ad Soyad', value: displayUser.fullName, size: 'text-xl' },
                      { label: 'E-poçt', value: displayUser.email, size: 'text-lg' },
                      { label: 'Doğum Tarixi', value: displayUser.birthDate, size: 'text-lg italic font-mono' },
                    ].map(item => (
                      <div key={item.label}>
                        <label className="text-xs font-bold uppercase tracking-widest" style={{ color: muted }}>{item.label}</label>
                        <p className={item.size} style={{ color: item.label === 'İstifadəçi Adı' ? text : muted }}>{item.value}</p>
                      </div>
                    ))}

                    {/* Module progress summary */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest" style={{ color: muted }}>Module Progress</label>
                      <div className="mt-2 space-y-1.5">
                        {[
                          { label: 'Spring Boot Unit 2', val: Math.round((moduleData.flatMap(d => d.items).filter(i => i.completed).length / moduleData.flatMap(d => d.items).length) * 100) },
                        ].map(({ label, val }) => (
                          <div key={label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span style={{ color: muted }}>{label}</span>
                              <span style={{ color: accent }}>{val}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#e5e7eb' }}>
                              <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 1 }}
                                style={{ background: accent }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center pl-8" style={{ borderLeft: `1px solid ${cardBorder}` }}>
                    <div className="w-48 h-72 rounded-3xl border flex items-center justify-center relative p-4"
                      style={{ background: dark ? '#050807' : '#f9fafb', borderColor: dark ? 'rgba(168,85,247,0.3)' : '#e5e7eb', boxShadow: dark ? '0 0 30px rgba(168,85,247,0.2)' : '0 4px 20px rgba(0,0,0,0.06)' }}>
                      <PixelCharacter char={{ ...displayUser.character, variant: 'full' }} />
                      <div className="absolute -bottom-3 bg-purple-600 text-white text-xs px-5 py-1.5 rounded-full font-bold uppercase tracking-widest shadow-lg">
                        {displayUser.character.gender.toUpperCase()} CHARACTER
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Language cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {displayUser.languages.map((lang, i) => (
                  <motion.div key={i} whileHover={{ y: -2 }}
                    onClick={() => setSelectedLanguage(selectedLanguage === lang.name ? null : lang.name)}
                    className="cursor-pointer p-6 rounded-2xl transition-all duration-300"
                    style={{
                      background: cardBg,
                      border: `1px solid ${selectedLanguage === lang.name ? accent : cardBorder}`,
                      boxShadow: selectedLanguage === lang.name ? `0 0 15px ${dark ? 'rgba(0,255,136,0.1)' : 'rgba(79,70,229,0.1)'}` : 'none',
                    }}>
                    <div className="flex justify-between items-center mb-4 font-bold" style={{ color: accent }}>
                      <h3>{lang.name}</h3>
                      <span className="text-[10px] px-2 py-1 rounded uppercase" style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', color: muted }}>{lang.stage}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: dark ? '#000' : '#e5e7eb' }}>
                      <div className="h-full rounded-full" style={{ width: `${lang.progress}%`, background: accent }} />
                    </div>
                    <p className="text-right text-[10px] mt-2 font-bold" style={{ color: accent }}>{lang.progress}%</p>
                  </motion.div>
                ))}
              </div>

              {selectedLanguage && displayUser.languages.filter(l => l.name === selectedLanguage).map(l => renderLevelMap(l.name, l.progress, l.totalLevels))}
            </div>
          </div>
        )}

        {/* Leaderboard tab */}
        {activeTab === 'leaderboard' && (
          <div className="p-10 max-w-4xl mx-auto w-full space-y-8">
            <h2 className="text-3xl font-bold flex items-center gap-3" style={{ color: text }}>
              <Trophy style={{ color: accent }} /> Global Sıralama
            </h2>

            {/* My rank card */}
            <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: cardBg, border: `1px solid ${accent}44` }}>
              <div className="text-3xl font-black italic" style={{ color: accent }}>#3</div>
              <div className="w-10 h-10 rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}44` }}>
                <PixelCharacter char={{ ...displayUser.character, variant: 'closeup' }} />
              </div>
              <div>
                <p className="font-bold" style={{ color: text }}>{displayUser.username}</p>
                <p className="text-xs" style={{ color: muted }}>Your current rank</p>
              </div>
              <div className="ml-auto text-right">
                <p className="font-black" style={{ color: '#a855f7' }}>{displayUser.xp.toLocaleString()} XP</p>
                <p className="text-xs font-bold" style={{ color: '#22c55e' }}>+240 this week</p>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              <table className="w-full text-left">
                <thead>
                  <tr style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f9fafb' }}>
                    {['Sıra', 'Oyunçu', 'Səviyyə', 'XP', 'Bu Həftə'].map((h, i) => (
                      <th key={h} className="p-6 text-xs font-black uppercase tracking-widest" style={{ color: muted, textAlign: i >= 3 ? 'right' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ borderTop: `1px solid ${cardBorder}` }}>
                  {leaderboardData.map((player, i) => (
                    <tr key={player.rank}
                      style={{ background: player.isMe ? (dark ? 'rgba(0,255,136,0.03)' : 'rgba(79,70,229,0.03)') : 'transparent', borderTop: i > 0 ? `1px solid ${cardBorder}` : undefined }}>
                      <td className="p-6 font-mono font-bold" style={{ color: player.rank <= 3 ? ['#fbbf24', '#94a3b8', '#cd7c39'][player.rank - 1] : muted }}>
                        {player.rank <= 3 ? ['🥇', '🥈', '🥉'][player.rank - 1] : `#${player.rank}`}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold"
                            style={{ background: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: muted }}>{player.name[0]}</div>
                          <span className={player.isMe ? 'font-bold' : ''} style={{ color: player.isMe ? accent : text }}>{player.name} {player.isMe && '(You)'}</span>
                        </div>
                      </td>
                      <td className="p-6" style={{ color: muted }}>LVL {player.level}</td>
                      <td className="p-6 text-right font-mono font-bold" style={{ color: '#a855f7' }}>{player.xp.toLocaleString()}</td>
                      <td className="p-6 text-right text-xs font-bold" style={{ color: '#22c55e' }}>{player.trend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <SettingsPage dark={dark} apiKey={apiKey} setApiKey={setApiKey} />
        )}

        {/* Admin tab */}
        {activeTab === 'admin' && (
          <AdminPanelPage dark={dark} moduleData={moduleData} setModuleData={setModuleData} />
        )}
      </main>

      {/* Floating AI Chat (only on lessons / profile) */}
      {(activeTab === 'modules' || activeTab === 'profile') && (
        <AIChatBubble dark={dark} apiKey={apiKey} lessonTitle={openLesson || undefined} />
      )}
    </div>
  );
};

export default ProfilePage;