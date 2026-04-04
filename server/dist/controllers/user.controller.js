"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.updateCharacter = exports.updateMe = exports.getMe = void 0;
const User_1 = __importDefault(require("../models/User"));
const getMe = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.id).select('-password');
        if (!user)
            return res.status(404).json({ success: false, message: 'İstifadəçi tapılmadı' });
        res.json({ success: true, data: user });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getMe = getMe;
const updateMe = async (req, res) => {
    try {
        const { learnedLanguages, xp, firstName, lastName, dateOfBirth, skillLevel, email, } = req.body;
        const user = await User_1.default.findById(req.user.id);
        if (!user)
            return res.status(404).json({ success: false, message: 'İstifadəçi tapılmadı' });
        if (firstName !== undefined) {
            user.firstName = String(firstName).trim() || undefined;
        }
        if (lastName !== undefined) {
            user.lastName = String(lastName).trim() || undefined;
        }
        if (email !== undefined) {
            const normalizedEmail = String(email).trim().toLowerCase();
            const existing = await User_1.default.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
            if (existing) {
                return res.status(400).json({ success: false, message: 'Bu email artıq istifadə olunur' });
            }
            user.email = normalizedEmail;
        }
        if (dateOfBirth !== undefined) {
            const parsed = new Date(dateOfBirth);
            if (Number.isNaN(parsed.getTime())) {
                return res.status(400).json({ success: false, message: 'Tarix formatı yanlışdır' });
            }
            user.dateOfBirth = parsed;
        }
        if (skillLevel !== undefined) {
            const allowed = ['beginner', 'intermediate', 'advanced', 'expert'];
            if (!allowed.includes(skillLevel)) {
                return res.status(400).json({ success: false, message: 'Skill level yanlışdır' });
            }
            user.skillLevel = skillLevel;
        }
        if (learnedLanguages !== undefined) {
            user.learnedLanguages = learnedLanguages;
        }
        if (typeof xp === 'number') {
            user.xp = xp;
        }
        await user.save();
        const safeUser = await User_1.default.findById(user._id).select('-password');
        res.json({ success: true, data: safeUser });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateMe = updateMe;
const updateCharacter = async (req, res) => {
    try {
        const { gender, emotion, clothing, hairColor, skin, clothingColor, username } = req.body;
        const user = await User_1.default.findById(req.user.id);
        if (!user)
            return res.status(404).json({ success: false, message: 'İstifadəçi tapılmadı' });
        // Character fields güncəllə
        if (gender)
            user.character.gender = gender;
        if (emotion)
            user.character.emotion = emotion;
        if (clothing)
            user.character.clothing = clothing;
        if (hairColor)
            user.character.hairColor = hairColor;
        if (skin)
            user.character.skin = skin;
        if (clothingColor)
            user.character.clothingColor = clothingColor;
        if (username) {
            // Character username unikallığını yoxla
            const existingUser = await User_1.default.findOne({ 'character.username': username, _id: { $ne: user._id } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Bu personaj adı artıq istifadə olunub' });
            }
            user.character.username = username;
        }
        await user.save();
        res.json({ success: true, data: user.character });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateCharacter = updateCharacter;
const getUserById = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-password -email');
        if (!user)
            return res.status(404).json({ success: false, message: 'İstifadəçi tapılmadı' });
        res.json({ success: true, data: user });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getUserById = getUserById;
//# sourceMappingURL=user.controller.js.map