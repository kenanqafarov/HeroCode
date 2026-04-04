"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCommentOrReply = exports.likeBlog = exports.deleteBlog = exports.updateBlog = exports.getUserBlogs = exports.getBlogById = exports.getAllBlogs = exports.createBlog = void 0;
const Blog_1 = __importDefault(require("../models/Blog"));
const User_1 = __importDefault(require("../models/User"));
// ─── Create Blog ───────────────────────────────────────────────────────────────
const createBlog = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { title, excerpt, content, category, difficulty, tags, coverImage } = req.body;
        if (!title?.trim() || !excerpt?.trim() || !content?.trim()) {
            return res.status(400).json({ success: false, message: 'Title, excerpt and content are required' });
        }
        const user = await User_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        const blog = await Blog_1.default.create({
            title: title.trim(),
            excerpt: excerpt.trim(),
            content,
            coverImage: coverImage || '',
            category: category || 'Beginner',
            difficulty: difficulty || 'Beginner',
            tags: tags || [],
            author: {
                _id: userId,
                username: user.username || 'Unknown',
                email: user.email,
            },
        });
        res.status(201).json({ success: true, message: 'Blog created successfully', data: blog });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createBlog = createBlog;
// ─── Get All Blogs ─────────────────────────────────────────────────────────────
const getAllBlogs = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 10);
        const search = req.query.search;
        const category = req.query.category;
        const tag = req.query.tag;
        const skip = (page - 1) * limit;
        const query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } },
            ];
        }
        if (category)
            query.category = category;
        if (tag)
            query.tags = { $in: [tag] };
        const [blogs, total] = await Promise.all([
            Blog_1.default.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Blog_1.default.countDocuments(query),
        ]);
        res.json({
            success: true,
            data: blogs,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getAllBlogs = getAllBlogs;
// ─── Get Blog By ID ────────────────────────────────────────────────────────────
const getBlogById = async (req, res) => {
    try {
        const blog = await Blog_1.default.findByIdAndUpdate(req.params.id, { $inc: { reads: 1 } }, { new: true });
        if (!blog)
            return res.status(404).json({ success: false, message: 'Blog not found' });
        res.json({ success: true, data: blog });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getBlogById = getBlogById;
// ─── Get User Blogs ────────────────────────────────────────────────────────────
const getUserBlogs = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const blogs = await Blog_1.default.find({ 'author._id': userId }).sort({ createdAt: -1 });
        res.json({ success: true, data: blogs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getUserBlogs = getUserBlogs;
// ─── Update Blog ───────────────────────────────────────────────────────────────
const updateBlog = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const blog = await Blog_1.default.findById(req.params.id);
        if (!blog)
            return res.status(404).json({ success: false, message: 'Blog not found' });
        if (blog.author._id !== userId)
            return res.status(403).json({ success: false, message: 'Forbidden' });
        const { title, excerpt, content, category, difficulty, tags, coverImage } = req.body;
        if (title)
            blog.title = title.trim();
        if (excerpt)
            blog.excerpt = excerpt.trim();
        if (content)
            blog.content = content;
        if (category)
            blog.category = category;
        if (difficulty)
            blog.difficulty = difficulty;
        if (tags)
            blog.tags = tags;
        if (coverImage !== undefined)
            blog.coverImage = coverImage;
        await blog.save();
        res.json({ success: true, message: 'Blog updated successfully', data: blog });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateBlog = updateBlog;
// ─── Delete Blog ───────────────────────────────────────────────────────────────
const deleteBlog = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const blog = await Blog_1.default.findById(req.params.id);
        if (!blog)
            return res.status(404).json({ success: false, message: 'Blog not found' });
        if (blog.author._id !== userId)
            return res.status(403).json({ success: false, message: 'Forbidden' });
        await blog.deleteOne();
        res.json({ success: true, message: 'Blog deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteBlog = deleteBlog;
// ─── Like / Unlike Blog ────────────────────────────────────────────────────────
const likeBlog = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const blog = await Blog_1.default.findById(req.params.id);
        if (!blog)
            return res.status(404).json({ success: false, message: 'Blog not found' });
        const idx = blog.likes.indexOf(userId);
        if (idx > -1) {
            blog.likes.splice(idx, 1);
        }
        else {
            blog.likes.push(userId);
        }
        await blog.save();
        res.json({
            success: true,
            message: idx > -1 ? 'Like removed' : 'Liked',
            data: { likes: blog.likes },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.likeBlog = likeBlog;
// ─── Add Comment or Reply (Nested) ─────────────────────────────────────────────
const addCommentOrReply = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        const { text, parentId } = req.body;
        if (!text?.trim())
            return res.status(400).json({ success: false, message: 'Comment text is required' });
        const blog = await Blog_1.default.findById(req.params.id);
        if (!blog)
            return res.status(404).json({ success: false, message: 'Blog not found' });
        const user = await User_1.default.findById(userId);
        const username = user?.username || 'Anonymous';
        const newComment = {
            user: username,
            userId,
            text: text.trim(),
            createdAt: new Date(),
            replies: [],
        };
        if (!parentId) {
            // Əsas comment
            blog.comments.push(newComment);
        }
        else {
            // Reply əlavə et (recursive)
            const addReply = (comments) => {
                for (const comment of comments) {
                    if (comment._id.toString() === parentId) {
                        comment.replies.push(newComment);
                        return true;
                    }
                    if (comment.replies && addReply(comment.replies)) {
                        return true;
                    }
                }
                return false;
            };
            const added = addReply(blog.comments);
            if (!added) {
                return res.status(404).json({ success: false, message: 'Parent comment not found' });
            }
        }
        await blog.save();
        res.json({
            success: true,
            message: parentId ? 'Reply added successfully' : 'Comment added successfully',
            data: blog.comments,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addCommentOrReply = addCommentOrReply;
//# sourceMappingURL=blog.controller.js.map