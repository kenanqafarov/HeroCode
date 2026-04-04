"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    user: { type: String, required: true },
    userId: { type: String },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    parentId: { type: mongoose_1.Schema.Types.ObjectId, default: null },
    replies: [{ type: mongoose_1.Schema.Types.Mixed }], // recursive nested replies
}, { _id: true });
const blogSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    coverImage: { type: String, default: '' },
    author: {
        _id: { type: String, required: true },
        username: { type: String, required: true },
        email: { type: String, required: true },
    },
    category: {
        type: String,
        enum: ['Web3', 'JavaScript', 'React', 'Advanced', 'Beginner'],
        default: 'Beginner',
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        default: 'Beginner',
    },
    tags: [{ type: String, trim: true }],
    reads: { type: Number, default: 0 },
    likes: [{ type: String }],
    comments: [commentSchema],
}, { timestamps: true });
// Full-text search index
blogSchema.index({ title: 'text', excerpt: 'text' });
exports.default = (0, mongoose_1.model)('Blog', blogSchema);
//# sourceMappingURL=Blog.js.map