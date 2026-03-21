import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, Eye } from "lucide-react";

interface Author {
  name: string;
  username: string;
  avatar: string;
}

interface BlogCardProps {
  post: {
    id: string;
    author: Author;
    title: string;
    excerpt: string;
    content: string;
    category: "Web3" | "JavaScript" | "React" | "Advanced" | "Beginner";
    difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    reads: number;
    likes: number;
    comments: number;
    shares: number;
    timestamp: string;
    tags: string[];
  };
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
}

const categoryColors = {
  Web3: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
  JavaScript: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  React: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  Advanced: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  Beginner: "bg-green-500/10 border-green-500/30 text-green-400",
};

const difficultyColors = {
  Beginner: "text-green-400",
  Intermediate: "text-blue-400",
  Advanced: "text-purple-400",
  Expert: "text-red-400",
};

const BlogCard = ({
  post,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
}: BlogCardProps) => {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="m-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">{post.author.avatar}</span>
          </div>

          {/* Author Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900 dark:text-slate-50">
                {post.author.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-400">{post.author.username}</span>
              <span className="text-xs text-gray-500 dark:text-slate-400">·</span>
              <span className="text-xs text-gray-500 dark:text-slate-400">{post.timestamp}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-slate-50 mb-2 line-clamp-2 hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-3 mb-3">
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
              categoryColors[post.category]
            }`}
          >
            {post.category}
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-gray-300 dark:border-slate-700 ${
              difficultyColors[post.difficulty]
            }`}
          >
            {post.difficulty}
          </span>
        </div>

        {/* Other Tags */}
        <div className="flex gap-2 flex-wrap">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-gray-500 dark:text-slate-500 hover:text-primary transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-slate-400 mb-4 py-3 border-t border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>{post.reads.toLocaleString()} reads</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className="w-4 h-4" />
          <span>{post.likes.toLocaleString()} likes</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          <span>{post.comments.toLocaleString()} comments</span>
        </div>
        <div className="flex items-center gap-1">
          <Share2 className="w-4 h-4" />
          <span>{post.shares.toLocaleString()} shares</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-around text-gray-600 dark:text-slate-400">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLike}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-slate-800 transition-colors group"
        >
          <Heart
            className={`w-4 h-4 transition-all ${
              isLiked ? "fill-red-500 text-red-500" : "group-hover:text-red-500"
            }`}
          />
          <span className={`text-xs ${isLiked ? "text-red-500" : "text-gray-600 dark:text-slate-400"}`}>
            Like
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors group"
        >
          <MessageCircle className="w-4 h-4 group-hover:text-blue-500" />
          <span className="text-xs">Reply</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cyan-50 dark:hover:bg-slate-800 transition-colors group"
        >
          <Share2 className="w-4 h-4 group-hover:text-cyan-500" />
          <span className="text-xs">Share</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBookmark}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-slate-800 transition-colors group"
        >
          <Bookmark
            className={`w-4 h-4 transition-all ${
              isBookmarked
                ? "fill-yellow-500 text-yellow-500"
                : "group-hover:text-yellow-500"
            }`}
          />
          <span
            className={`text-xs ${
              isBookmarked ? "text-yellow-500" : "text-gray-600 dark:text-slate-400"
            }`}
          >
            Save
          </span>
        </motion.button>
      </div>
    </motion.article>
  );
};

export default BlogCard;
