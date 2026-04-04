"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("../utils/jwt");
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, dateOfBirth, username, skillLevel, reason } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email və parol mütləqdir' });
        }
        let user = await User_1.default.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'Bu email artıq qeydiyyatdan keçib' });
        }
        // Username unikallığını yoxla
        if (username) {
            const existingUsername = await User_1.default.findOne({ username });
            if (existingUsername) {
                return res.status(400).json({ success: false, message: 'Bu istifadəçi adı artıq istifadə olunub' });
            }
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        user = new User_1.default({
            email,
            password: hashedPassword,
            username,
            firstName,
            lastName,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            skillLevel,
            reason,
            isAdmin: process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()).includes(email.toLowerCase()) || false,
        });
        await user.save();
        const token = (0, jwt_1.generateToken)(user._id.toString(), user.isAdmin);
        res.status(201).json({
            success: true,
            accessToken: token,
            data: {
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                skillLevel: user.skillLevel,
                isAdmin: user.isAdmin,
                character: user.character
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email və parol mütləqdir' });
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Email və ya parol səhvdir' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Email və ya parol səhvdir' });
        }
        const token = (0, jwt_1.generateToken)(user._id.toString(), user.isAdmin);
        res.json({
            success: true,
            accessToken: token,
            data: {
                id: user._id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                skillLevel: user.skillLevel,
                xp: user.xp,
                level: user.level,
                isAdmin: user.isAdmin,
                character: user.character
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.login = login;
//# sourceMappingURL=auth.controller.js.map