/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUTHENTICATION MIDDLEWARE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Middleware for protecting routes that require JWT authentication.
 * 
 * FUNCTIONS:
 * - protect: Verifies JWT token from Authorization header and attaches user info to request
 * - adminOnly: Additional middleware to restrict routes to admin users only
 * 
 * USAGE:
 * router.get('/protected-route', protect, controllerFunction);
 * router.post('/admin-route', protect, adminOnly, controllerFunction);
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Extended Request interface that includes authenticated user information
 */
export interface AuthRequest extends Request {
  user?: { id: string; isAdmin: boolean };
}

/**
 * Middleware to verify JWT token and protect routes
 * 
 * Looks for token in Authorization header with format: "Bearer <token>"
 * If valid, attaches user ID and admin status to req.user for use in downstream controllers
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Token tələb olunur' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; isAdmin?: boolean };
    req.user = { id: decoded.id, isAdmin: !!decoded.isAdmin };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token etibarsızdır' });
  }
};


/**
 * Middleware to restrict routes to admin users only
 * Must be used AFTER protect middleware
 * 
 * @param req - Express request object (must have user info from protect middleware)
 * @param res - Express response object
 * @param next - Express next function
 */
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Yalnız admin icazəsi ilə' });
  }
  next();
};