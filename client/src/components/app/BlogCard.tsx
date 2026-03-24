import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, Eye, Clock } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface Author {
  _id: string;
  username: string;
  email: string;
}

export interface BlogPost {
  _id: string;
  author: Author;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  difficulty: string;
  reads: number;
  likes: string[];
  comments: Array<{
    _id: string;
    user: string;
    userId?: string;
    text: string;
    createdAt: string;
    replies: any[];
  }>;
  tags: string[];
  coverImage?: string;
  createdAt: string;
}

interface BlogCardProps {
  post: BlogPost;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
  onOpen?: () => void;
}

const CATEGORY_STYLES: Record<string, string> = {
  Web3: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-500',
  JavaScript: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
  React: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
  Advanced: 'bg-purple-500/10 border-purple-500/30 text-purple-500',
  Beginner: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
};

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: 'text-emerald-500',
  Intermediate: 'text-blue-500',
  Advanced: 'text-purple-500',
  Expert: 'text-rose-500',
};

function estimateReadTime(content: string): number {
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}

export default function BlogCard({
  post,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
  onOpen,
}: BlogCardProps) {
  const isDark = useTheme();

  // Defensive defaults
  const safePost = {
    ...post,
    reads: post.reads ?? 0,
    likes: Array.isArray(post.likes) ? post.likes : [],
    comments: Array.isArray(post.comments) ? post.comments : [],
    tags: Array.isArray(post.tags) ? post.tags : [],
  };

  const readTime = estimateReadTime(safePost.content);
  const categoryStyle =
    CATEGORY_STYLES[post.category] ?? 'bg-gray-500/10 border-gray-500/30 text-gray-500';
  const difficultyStyle =
    DIFFICULTY_STYLES[post.difficulty] ?? 'text-gray-500';

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={onOpen}
      className={`
        group relative flex flex-col rounded-2xl cursor-pointer overflow-hidden
        border transition-all duration-300
        ${isDark
          ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-black/30'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xl hover:shadow-black/5'
        }
      `}
    >
      {/* Cover Image */}
      {post.coverImage ? (
        <div className="relative overflow-hidden h-48 flex-shrink-0">
          <img
            src={post.coverImage}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            className={`absolute inset-0 ${
              isDark ? 'bg-gradient-to-t from-slate-900/60 to-transparent' : 'bg-gradient-to-t from-black/20 to-transparent'
            }`}
          />
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold border backdrop-blur-sm ${categoryStyle}`}
          >
            {post.category}
          </span>
        </div>
      ) : (
        <div
          className={`relative h-48 flex-shrink-0 flex items-center justify-center ${
            isDark ? 'bg-slate-800' : 'bg-gray-100'
          }`}
        >
          <div
            className={`text-6xl font-black opacity-10 select-none ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {post.title.charAt(0).toUpperCase()}
          </div>
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold border ${categoryStyle}`}
          >
            {post.category}
          </span>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Author row */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-bold">
              {post.author?.username?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            {post.author?.username || 'Unknown'}
          </span>
          <span className={`text-xs ${isDark ? 'text-slate-600' : 'text-gray-400'}`}>·</span>
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            {timeAgo(post.createdAt)}
          </span>

          <div className={`ml-auto flex items-center gap-1 text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
            <Clock className="w-3 h-3" />
            <span>{readTime} min</span>
          </div>
        </div>

        {/* Title */}
        <h3
          className={`font-bold leading-snug line-clamp-2 text-base transition-colors group-hover:text-violet-500 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        <p
          className={`text-sm leading-relaxed line-clamp-2 flex-1 ${
            isDark ? 'text-slate-400' : 'text-gray-500'
          }`}
        >
          {post.excerpt}
        </p>

        {/* Tags */}
        {safePost.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {safePost.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`text-xs px-2 py-0.5 rounded-md ${
                  isDark ? 'text-slate-500 bg-slate-800' : 'text-gray-500 bg-gray-100'
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className={`border-t ${isDark ? 'border-slate-800' : 'border-gray-100'}`} />

        {/* Stats row */}
        <div className={`flex items-center gap-4 text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{safePost.reads.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            <span>{safePost.likes.length.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{safePost.comments.length.toLocaleString()}</span>
          </div>

          <span
            className={`ml-auto px-2 py-0.5 rounded-md text-[10px] font-semibold ${difficultyStyle} ${
              isDark ? 'bg-slate-800' : 'bg-gray-100'
            }`}
          >
            {post.difficulty}
          </span>
        </div>

        {/* Action buttons */}
        <div
          className={`flex items-center justify-around -mx-2 pt-1 border-t ${
            isDark ? 'border-slate-800' : 'border-gray-100'
          }`}
        >
          <ActionBtn
            isDark={isDark}
            active={isLiked}
            activeColor="text-rose-500"
            hoverBg={isDark ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50'}
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
            icon={<Heart className={`w-4 h-4 transition-all ${isLiked ? 'fill-current scale-110' : ''}`} />}
            label="Like"
          />

          <ActionBtn
            isDark={isDark}
            active={false}
            activeColor="text-blue-500"
            hoverBg={isDark ? 'hover:bg-blue-500/10' : 'hover:bg-blue-50'}
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.(); // Comment yazmaq üçün blogu açır
            }}
            icon={<MessageCircle className="w-4 h-4" />}
            label="Comment"
          />

          <ActionBtn
            isDark={isDark}
            active={false}
            activeColor="text-cyan-500"
            hoverBg={isDark ? 'hover:bg-cyan-500/10' : 'hover:bg-cyan-50'}
            onClick={(e) => {
              e.stopPropagation();
              // Share funksiyasını sonra əlavə edə bilərsən
              navigator.clipboard.writeText(window.location.origin + `/blog/${post._id}`);
              alert('Link copied to clipboard!');
            }}
            icon={<Share2 className="w-4 h-4" />}
            label="Share"
          />

          <ActionBtn
            isDark={isDark}
            active={isBookmarked}
            activeColor="text-amber-500"
            hoverBg={isDark ? 'hover:bg-amber-500/10' : 'hover:bg-amber-50'}
            onClick={(e) => {
              e.stopPropagation();
              onBookmark();
            }}
            icon={<Bookmark className={`w-4 h-4 transition-all ${isBookmarked ? 'fill-current' : ''}`} />}
            label="Save"
          />
        </div>
      </div>
    </motion.article>
  );
}

interface ActionBtnProps {
  isDark: boolean;
  active: boolean;
  activeColor: string;
  hoverBg: string;
  onClick: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  label: string;
}

function ActionBtn({ isDark, active, activeColor, hoverBg, onClick, icon, label }: ActionBtnProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
        transition-colors
        ${active ? activeColor : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-gray-400 hover:text-gray-600'}
        ${hoverBg}
      `}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}