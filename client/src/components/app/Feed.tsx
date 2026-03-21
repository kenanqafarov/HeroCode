import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Bookmark, Eye } from "lucide-react";
import BlogCard from "./BlogCard";
import BlogEditor from "./BlogEditor";
import { toast } from "sonner";
import { blogAPI } from "../../services/api";

interface BlogPost {
  _id: string;
  author: {
    _id: string;
    username: string;
    email: string;
  };
  title: string;
  excerpt: string;
  content: string;
  category: "Web3" | "JavaScript" | "React" | "Advanced" | "Beginner";
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  reads: number;
  likes: string[];
  comments: Array<{ user: string; text: string; createdAt: string }>;
  tags: string[];
  createdAt: string;
}

interface FeedProps {
  refreshing: boolean;
  onBlogCreated?: () => void;
}

const Feed = ({ refreshing, onBlogCreated }: FeedProps) => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [isBlogEditorOpen, setIsBlogEditorOpen] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, [refreshing]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await blogAPI.getAll(1, 20);
      if (data.success) {
        setBlogs(data.data);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (blogId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      const data = await blogAPI.like(blogId);
      if (data.success) {
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          if (newSet.has(blogId)) {
            newSet.delete(blogId);
          } else {
            newSet.add(blogId);
          }
          return newSet;
        });
        
        // Update blogs state
        setBlogs(blogs.map(blog => 
          blog._id === blogId ? { ...blog, likes: data.data.likes } : blog
        ));
      }
    } catch (error) {
      console.error("Error liking blog:", error);
      toast.error("Failed to like blog");
    }
  };

  const handleBookmark = (blogId: string) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blogId)) {
        newSet.delete(blogId);
      } else {
        newSet.add(blogId);
      }
      return newSet;
    });
  };

  const handleCreateBlog = async (blogData: {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    difficulty: string;
    tags: string[];
  }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      const data = await blogAPI.create(blogData);
      if (data.success) {
        toast.success("Blog published successfully!");
        setBlogs([data.data, ...blogs]);
        setIsBlogEditorOpen(false);
        onBlogCreated?.();
      } else {
        toast.error(data.message || "Failed to create blog");
      }
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error("Failed to create blog");
    }
  };

  if (loading && blogs.length === 0) {
    return <main className="flex-1 flex items-center justify-center">Loading...</main>;
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 w-full">
        <div className="max-w-4xl mx-auto w-full pt-24">
          {/* Blog Posts Feed */}
          {blogs.length > 0 ? (
            <div className="divide-y divide-border/30 dark:divide-slate-800/30">
              {blogs.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <BlogCard
                    post={{
                      id: post._id,
                      author: {
                        name: post.author.username,
                        username: `@${post.author.username}`,
                        avatar: post.author.username.substring(0, 2).toUpperCase()
                      },
                      title: post.title,
                      excerpt: post.excerpt,
                      content: post.content,
                      category: post.category,
                      difficulty: post.difficulty,
                      reads: post.reads,
                      likes: post.likes.length,
                      comments: post.comments.length,
                      shares: 0,
                      timestamp: new Date(post.createdAt).toLocaleDateString(),
                      tags: post.tags
                    }}
                    isLiked={likedPosts.has(post._id)}
                    isBookmarked={bookmarkedPosts.has(post._id)}
                    onLike={() => handleLike(post._id)}
                    onBookmark={() => handleBookmark(post._id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 dark:text-slate-400">No blogs yet. Be the first to share!</p>
            </div>
          )}

          {/* Spacer */}
          <div className="h-12" />
        </div>
      </main>

      {/* Blog Editor Modal */}
      <BlogEditor
        isOpen={isBlogEditorOpen}
        onClose={() => setIsBlogEditorOpen(false)}
        onSubmit={handleCreateBlog}
      />

      {/* Expose blog editor state to parent */}
      {typeof window !== "undefined" && (
        (window as any).openBlogEditor = () => setIsBlogEditorOpen(true)
      )}
    </>
  );
};

export default Feed;
