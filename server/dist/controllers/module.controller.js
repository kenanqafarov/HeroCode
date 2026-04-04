"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteModule = exports.updateModule = exports.getModuleById = exports.getAllModules = exports.createModule = void 0;
const Module_1 = __importDefault(require("../models/Module"));
// Admin: Create a new module
const createModule = async (req, res) => {
    try {
        const { title, language, difficulty, description, content, tags, questions } = req.body;
        if (!title || !language || !description || !content) {
            return res.status(400).json({ success: false, message: 'Title, language, description, and content are required' });
        }
        const module = new Module_1.default({
            title,
            language,
            difficulty: difficulty || 'beginner',
            description,
            content,
            tags: tags || [],
            questions: questions || [],
            createdBy: req.user.id
        });
        await module.save();
        res.status(201).json({
            success: true,
            message: 'Module created successfully',
            data: module
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createModule = createModule;
// Get all modules (public, with optional filters)
const getAllModules = async (req, res) => {
    try {
        const { language, difficulty } = req.query;
        let filter = {};
        if (language)
            filter.language = language;
        if (difficulty)
            filter.difficulty = difficulty;
        const modules = await Module_1.default.find(filter)
            .populate('createdBy', 'username email')
            .sort({ createdAt: -1 });
        res.json({
            success: true,
            data: modules
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAllModules = getAllModules;
// Get a single module by ID
const getModuleById = async (req, res) => {
    try {
        const { id } = req.params;
        const module = await Module_1.default.findById(id)
            .populate('createdBy', 'username email');
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }
        res.json({
            success: true,
            data: module
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getModuleById = getModuleById;
// Admin: Update a module
const updateModule = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, language, difficulty, description, content, tags, questions } = req.body;
        const module = await Module_1.default.findById(id);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }
        // Only the creator (admin) can update
        if (module.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You do not have permission to update this module' });
        }
        if (title)
            module.title = title;
        if (language)
            module.language = language;
        if (difficulty)
            module.difficulty = difficulty;
        if (description)
            module.description = description;
        if (content)
            module.content = content;
        if (tags)
            module.tags = tags;
        if (questions)
            module.questions = questions;
        await module.save();
        res.json({
            success: true,
            message: 'Module updated successfully',
            data: module
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateModule = updateModule;
// Admin: Delete a module
const deleteModule = async (req, res) => {
    try {
        const { id } = req.params;
        const module = await Module_1.default.findById(id);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }
        // Only the creator (admin) can delete
        if (module.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You do not have permission to delete this module' });
        }
        await Module_1.default.findByIdAndDelete(id);
        res.json({
            success: true,
            message: 'Module deleted successfully'
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.deleteModule = deleteModule;
//# sourceMappingURL=module.controller.js.map