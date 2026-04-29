/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * DATABASE CONNECTION CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Establishes connection to MongoDB Atlas
 * Called once during server startup in app.ts
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 * - MONGO_URI: MongoDB Atlas connection string (includes username, password, cluster)
 * 
 * ERROR HANDLING:
 * - Validates MONGO_URI is set before attempting connection
 * - Provides helpful error messages for common connection issues
 * - Exits process on connection failure
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Connects to MongoDB Atlas database
 * Also provides diagnostic information for troubleshooting connection issues
 */
export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI tapilmadi. .env faylini yoxlayin.');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('MongoDB Atlas ilə əlaqə quruldu');
  } catch (error: any) {
    console.error('MongoDB bağlantı xətası:', error?.message || error);
    console.error(
      'Atlas yoxlama: Network Access-da IP icazesi verin (ya 0.0.0.0/0), Database Access-da istifadeci/parol duzgun olsun, URI-de DB adi olsun.'
    );
    process.exit(1);
  }
};