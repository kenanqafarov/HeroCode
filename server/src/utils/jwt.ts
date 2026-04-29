/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JWT TOKEN GENERATION UTILITY
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Centralized JWT token generation function
 * Uses environment variables: JWT_SECRET and JWT_EXPIRES_IN
 * All authentication tokens in the system are created through this function
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import jwt from 'jsonwebtoken';

/**
 * Generates a signed JWT token for a user
 * 
 * @param userId - MongoDB user ID (converted to string)
 * @param isAdmin - Whether user has admin privileges (default: false)
 * @returns Signed JWT token string
 */
export const generateToken = (userId: string, isAdmin: boolean = false) => {
  return jwt.sign(
    { id: userId, isAdmin },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
  );
};