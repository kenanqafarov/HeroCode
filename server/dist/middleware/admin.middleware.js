"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const protect = (req, res, next) => {
    let token = req.headers.authorization?.startsWith('Bearer')
        ? req.headers.authorization.split(' ')[1]
        : null;
    if (!token) {
        return res.status(401).json({ success: false, message: 'Token tələb olunur' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, isAdmin: !!decoded.isAdmin };
        next();
    }
    catch (err) {
        return res.status(401).json({ success: false, message: 'Etibarsız token' });
    }
};
exports.protect = protect;
const adminOnly = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ success: false, message: 'Yalnız admin icazəsi ilə' });
    }
    next();
};
exports.adminOnly = adminOnly;
//# sourceMappingURL=admin.middleware.js.map