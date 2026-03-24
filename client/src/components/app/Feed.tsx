import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import BlogCard from "./BlogCard";
import BlogEditor from "../BlogEditor";
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

interface FeedProps {
  refreshing: boolean;
  onBlogCreated?: () => void;
}

const Feed = ({ refreshing, onBlogCreated }: FeedProps) => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("likedPosts");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bookmarkedPosts");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    }
    return new Set();
  });

  const [isBlogEditorOpen, setIsBlogEditorOpen] = useState(false);
  const [blogToView, setBlogToView] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const categories = ["All", "Web3", "JavaScript", "React", "Advanced", "Beginner"];

  // Persist likedPosts to localStorage
  useEffect(() => {
    localStorage.setItem("likedPosts", JSON.stringify(Array.from(likedPosts)));
  }, [likedPosts]);

  // Persist bookmarkedPosts to localStorage
  useEffect(() => {
    localStorage.setItem("bookmarkedPosts", JSON.stringify(Array.from(bookmarkedPosts)));
  }, [bookmarkedPosts]);

  useEffect(() => {
    fetchBlogs(1, searchQuery, selectedCategory);
  }, [refreshing, selectedCategory]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBlogs(1, searchQuery, selectedCategory);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).openBlogEditor = () => {
        setBlogToView(null);
        setIsBlogEditorOpen(true);
      };
    }
  }, []);

  const fetchBlogs = async (page = 1, search = "", category = "") => {
    try {
      setLoading(true);
      const catParam = category === "All" ? "" : category;
      const data = await blogAPI.getAll(page, 10, search, catParam);

      if (data.success) {
        if (page === 1) {
          setBlogs(data.data);
        } else {
          setBlogs((prev) => [...prev, ...data.data]);
        }
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.pages) {
      fetchBlogs(pagination.page + 1, searchQuery, selectedCategory);
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
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(blogId)) {
            newSet.delete(blogId);
          } else {
            newSet.add(blogId);
          }
          return newSet;
        });

        setBlogs((prevBlogs) =>
          prevBlogs.map((blog) =>
            blog._id === blogId ? { ...blog, likes: data.data.likes } : blog
          )
        );
      }
    } catch (error) {
      console.error("Error liking blog:", error);
      toast.error("Failed to like blog");
    }
  };

  const handleBookmark = (blogId: string) => {
    setBookmarkedPosts((prev) => {
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
    coverImage: string;
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
      const payload = {
        title: blogData.title?.trim() || "",
        excerpt: blogData.excerpt?.trim() || "",
        content: blogData.content?.trim() || "",
        category: blogData.category || "Beginner",
        difficulty: blogData.difficulty || "Beginner",
        tags: blogData.tags || [],
        coverImage: blogData.coverImage || "",
      };

      console.log("📤 Final payload to backend:", payload);

      const data = await blogAPI.create(payload);

      if (data.success) {
        toast.success("Blog published successfully! ✅");
        setBlogs([data.data, ...blogs]);
        setIsBlogEditorOpen(false);
        onBlogCreated?.();
      } else {
        toast.error(data.message || "Failed to create blog");
      }
    } catch (error: any) {
      console.error("❌ Error creating blog:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "Failed to create blog";
      toast.error(errorMsg);
    }
  };

  if (loading && blogs.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 w-full">
        <div className="max-w-4xl mx-auto w-full pt-24 px-6 md:px-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-8 p-6 rounded-2xl bg-gray-50 dark:bg-slate-900/50 animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-slate-800 rounded-xl mb-4" />
              <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (isBlogEditorOpen) {
    return (
      <BlogEditor
        mode="edit"
        initialData={undefined}
        onSave={handleCreateBlog}
        onClose={() => setIsBlogEditorOpen(false)}
      />
    );
  }

  if (blogToView) {
    navigate(`/blog/${blogToView._id}`);
    setBlogToView(null);
    return null;
  }

  return (
    <>
      <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 w-full scrollbar-hide">
        <div className="max-w-4xl mx-auto w-full pt-24 px-4 sm:px-6">
          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search HeroCode blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex-shrink-0 p-2 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
                <Filter className="w-4 h-4 text-gray-500" />
              </div>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-800 hover:border-primary/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

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
                      _id: post._id,
                      author: {
                        _id: post.author._id,
                        username: post.author.username,
                        email: post.author.email,
                      },
                      title: post.title,
                      excerpt: post.excerpt,
                      content: post.content,
                      category: post.category,
                      difficulty: post.difficulty,
                      reads: post.reads,
                      likes: post.likes,
                      comments: post.comments,
                      tags: post.tags,
                      coverImage: post.coverImage || "",
                      createdAt: post.createdAt,
                    }}
                    isLiked={likedPosts.has(post._id)}
                    isBookmarked={bookmarkedPosts.has(post._id)}
                    onLike={() => handleLike(post._id)}
                    onBookmark={() => handleBookmark(post._id)}
                    onOpen={() => setBlogToView(post)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-slate-900 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 dark:text-slate-400 text-lg font-medium">No results found</p>
              <p className="text-gray-400 dark:text-slate-500 text-sm">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Load More */}
          {pagination.page < pagination.pages && (
            <div className="flex justify-center py-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-8 py-3 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 font-medium hover:border-primary/50 transition-all disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More Posts"}
              </button>
            </div>
          )}

          <div className="h-12" />
        </div>
      </main>
    </>
  );
};

export default Feed;