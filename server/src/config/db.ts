import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('MongoDB Atlas ilə əlaqə quruldu');
  } catch (error) {
    console.error('MongoDB bağlantı xətası:', error);
    process.exit(1);
  }
};