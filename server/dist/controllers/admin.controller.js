"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminBlogs = exports.getAdminModules = exports.getAllMatches = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const Match_1 = __importDefault(require("../models/Match"));
const Module_1 = __importDefault(require("../models/Module"));
const Blog_1 = __importDefault(require("../models/Blog"));
// ════════════════════════════════════════════════════════
// USER MANAGEMENT
// ════════════════════════════════════════════════════════
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.default.find().select('-password');
        res.json({ success: true, data: users });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-password');
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { isAdmin, learnedLanguages, xp } = req.body;
        const user = await User_1.default.findById(id);
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        if (typeof isAdmin === 'boolean')
            user.isAdmin = isAdmin;
        if (learnedLanguages)
            user.learnedLanguages = learnedLanguages;
        if (typeof xp === 'number')
            user.xp = xp;
        await user.save();
        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.default.findByIdAndDelete(req.params.id);
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'User deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.deleteUser = deleteUser;
// ════════════════════════════════════════════════════════
// MATCH MANAGEMENT
// ════════════════════════════════════════════════════════
const getAllMatches = async (req, res) => {
    try {
        const matches = await Match_1.default.find()
            .populate('player1Id player2Id winnerId', 'username email');
        res.json({ success: true, data: matches });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAllMatches = getAllMatches;
// ════════════════════════════════════════════════════════
// MODULE MANAGEMENT (Alternative to /api/modules routes)
// ════════════════════════════════════════════════════════
const getAdminModules = async (req, res) => {
    try {
        const modules = await Module_1.default.find()
            .populate('createdBy', 'username email')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: modules });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAdminModules = getAdminModules;
// ════════════════════════════════════════════════════════
// BLOG MANAGEMENT
// ════════════════════════════════════════════════════════
const getAdminBlogs = async (req, res) => {
    try {
        const blogs = await Blog_1.default.find()
            .populate('author', 'username email')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: blogs });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAdminBlogs = getAdminBlogs;
//# sourceMappingURL=admin.controller.js.map