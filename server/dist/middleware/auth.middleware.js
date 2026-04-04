"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ message: 'Token tələb olunur' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, isAdmin: !!decoded.isAdmin };
        next();
    }
    catch (err) {
        res.status(401).json({ message: 'Token etibarsızdır' });
    }
};
exports.protect = protect;
const adminOnly = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Yalnız admin icazəsi ilə' });
    }
    next();
};
exports.adminOnly = adminOnly;
//# sourceMappingURL=auth.middleware.js.map