import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Heart, MessageCircle, Bookmark, Clock, Eye,
  Twitter, Linkedin, Copy, User as UserIcon,
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { toast } from 'sonner';
import { blogAPI } from '../services/api';
import { useTheme } from '../hooks/useTheme';
import TopBar from '../components/app/TopBar';
import Sidebar from '../components/app/Sidebar';

interface BlogPost {
  _id: string;
  author: { _id: string; username: string; email: string };
  title: string;
  excerpt: string;
  content: string;
  category: string;
  difficulty: string;
  reads: number;
  likes: string[];
  comments: Array<{ user: string; text: string; createdAt: string }>;
  tags: string[];
  coverImage?: string;
  createdAt: string;
}

function estimateReadTime(content: string) {
  return Math.max(1, Math.round(content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200));
}

export default function BlogDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDark = useTheme();

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (id) fetchBlog(id);
  }, [id]);

  async function fetchBlog(blogId: string) {
    try {
      setLoading(true);
      const data = await blogAPI.getById(blogId);
      if (data.success) {
        setBlog(data.data);
        const userId = localStorage.getItem('userId');
        if (userId) setIsLiked(data.data.likes.includes(userId));
      }
    } catch {
      toast.error('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  }

  async function handleLike() {
    if (!blog) return;
    if (!localStorage.getItem('token')) { toast.error('Please login to like posts'); return; }
    try {
      const data = await blogAPI.like(blog._id);
      if (data.success) {
        setIsLiked(p => !p);
        setBlog(b => b ? { ...b, likes: data.data.likes } : b);
      }
    } catch {
      toast.error('Failed to like post');
    }
  }

  function shareTwitter() {
    const text = `Check out: ${blog?.title}`;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(text)}`, '_blank');
  }

  function copyLink() {
    navigator.clipboard.writeText(location.href);
    toast.success('Link copied!');
  }

  /* ── Theme vars ─────────────────────────────────────────────────────────*/
  const bg = isDark ? 'bg-slate-950' : 'bg-gray-50';
  const surface = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200';
  const text = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-slate-400' : 'text-gray-500';
  const border = isDark ? 'border-slate-800' : 'border-gray-200';

  /* ── Loading ────────────────────────────────────────────────────────────*/
  if (loading) return (
    <div className={`flex min-h-screen ${bg}`}>
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
    </div>
  );

  /* ── Not found ──────────────────────────────────────────────────────────*/
  if (!blog) return (
    <div className={`flex min-h-screen ${bg}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`}>
          <Eye className={`w-8 h-8 ${muted}`} />
        </div>
        <h2 className={`text-2xl font-bold ${text}`}>Post not found</h2>
        <p className={muted}>This post doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-2 px-6 py-2.5 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-500 transition-colors"
        >
          Back to Feed
        </button>
      </div>
    </div>
  );

  const readTime = estimateReadTime(blog.content);

  return (
    <div className={`flex min-h-screen ${bg} overflow-x-hidden`}>
      <Sidebar />
      <div className="flex-1 min-w-0">
        <TopBar />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-24">

          {/* Back */}
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-1.5 text-sm font-medium mb-8 transition-colors group ${muted} hover:text-violet-500`}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Feed
          </button>

          {/* Category + meta */}
          <div className="flex items-center gap-3 mb-5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/10 text-violet-500 border border-violet-500/20 uppercase tracking-wider">
              {blog.category}
            </span>
            <span className={`flex items-center gap-1 text-xs ${muted}`}>
              <Clock className="w-3.5 h-3.5" /> {readTime} min read
            </span>
            <span className={`flex items-center gap-1 text-xs ${muted}`}>
              <Eye className="w-3.5 h-3.5" /> {blog.reads.toLocaleString()} reads
            </span>
          </div>

          {/* Title */}
          <h1 className={`text-4xl md:text-5xl font-extrabold leading-tight mb-6 ${text}`}>
            {blog.title}
          </h1>

          {/* Excerpt */}
          <p className={`text-lg leading-relaxed mb-8 ${muted}`}>{blog.excerpt}</p>

          {/* Author row */}
          <div className={`flex flex-wrap items-center justify-between gap-4 py-5 border-y ${border} mb-10`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 p-[2px]">
                <div className={`w-full h-full rounded-full flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                  <UserIcon className={`w-5 h-5 ${muted}`} />
                </div>
              </div>
              <div>
                <p className={`text-sm font-semibold ${text}`}>{blog.author.username}</p>
                <p className={`text-xs ${muted}`}>
                  {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[
                { icon: <Twitter className="w-4 h-4" />, action: shareTwitter, hover: 'hover:text-[#1DA1F2]' },
                { icon: <Linkedin className="w-4 h-4" />, action: () => {}, hover: 'hover:text-[#0A66C2]' },
                { icon: <Copy className="w-4 h-4" />, action: copyLink, hover: 'hover:text-violet-500' },
              ].map(({ icon, action, hover }, i) => (
                <button
                  key={i}
                  onClick={action}
                  className={`p-2 rounded-lg border transition-colors ${muted} ${hover}
                    ${isDark ? 'border-slate-700 bg-slate-800 hover:border-slate-600' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Cover image */}
          {blog.coverImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-12 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-violet-500/20"
            >
              <img src={blog.coverImage} alt={blog.title} className="w-full aspect-video object-cover" />
            </motion.div>
          )}

          {/* Article */}
          <article
            className={`prose max-w-none prose-lg mb-12
              ${isDark
                ? 'prose-invert prose-p:text-slate-300 prose-headings:text-white prose-a:text-violet-400 prose-code:text-violet-300 prose-blockquote:border-violet-500 prose-blockquote:text-slate-400'
                : 'prose-gray prose-a:text-violet-600 prose-blockquote:border-violet-500'
              }
              prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
              prose-headings:font-bold
            `}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}
          />

          {/* Tags */}
          {blog.tags.length > 0 && (
            <div className={`flex flex-wrap gap-2 mb-12 pb-8 border-b ${border}`}>
              {blog.tags.map(tag => (
                <span
                  key={tag}
                  className={`px-3 py-1.5 rounded-xl text-sm border transition-colors cursor-pointer
                    ${isDark ? 'border-slate-700 text-slate-400 bg-slate-800 hover:border-violet-500 hover:text-violet-400' : 'border-gray-200 text-gray-500 hover:border-violet-400 hover:text-violet-600'}`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Engagement strip */}
          <div className={`rounded-2xl border p-6 flex flex-wrap items-center justify-between gap-6 mb-12 ${surface}`}>
            <div className="flex items-center gap-6">
              {/* Like */}
              <button onClick={handleLike} className="flex items-center gap-3 group">
                <div className={`p-3 rounded-xl transition-all
                  ${isLiked
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                    : isDark ? 'bg-slate-800 text-slate-400 group-hover:text-rose-400' : 'bg-gray-100 text-gray-400 group-hover:text-rose-500'
                  }`}>
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${text}`}>{blog.likes.length} Likes</p>
                  <p className={`text-xs ${muted}`}>Show some love</p>
                </div>
              </button>

              {/* Comments count */}
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-400'}`}>
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className={`text-sm font-bold ${text}`}>{blog.comments.length} Comments</p>
                  <p className={`text-xs ${muted}`}>Join the discussion</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsBookmarked(p => !p)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-semibold text-sm transition-all
                ${isBookmarked
                  ? 'border-amber-500 text-amber-500 bg-amber-500/10'
                  : isDark ? 'border-slate-700 text-slate-300 hover:border-violet-500' : 'border-gray-200 text-gray-700 hover:border-violet-500'
                }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              {isBookmarked ? 'Saved' : 'Save Post'}
            </button>
          </div>

          {/* Author card */}
          <div className={`rounded-2xl border p-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left bg-gradient-to-br
            ${isDark ? 'from-violet-500/5 to-cyan-500/5 border-violet-500/10' : 'from-violet-50 to-cyan-50 border-violet-100'}`}>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 p-[2px] flex-shrink-0">
              <div className={`w-full h-full rounded-full flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                <UserIcon className={`w-10 h-10 ${muted}`} />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-violet-500 text-xs font-bold uppercase tracking-widest mb-1">About the author</p>
              <h3 className={`text-xl font-bold mb-2 ${text}`}>{blog.author.username}</h3>
              <p className={`text-sm leading-relaxed mb-4 ${muted}`}>
                Writer and developer sharing knowledge about Web3, React, and modern web development.
              </p>
              <button className="px-5 py-2 rounded-xl border border-violet-500/30 text-violet-500 text-sm font-semibold hover:bg-violet-500/10 transition-colors">
                Follow
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}