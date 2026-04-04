"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI tapilmadi. .env faylini yoxlayin.');
        }
        await mongoose_1.default.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        console.log('MongoDB Atlas ilə əlaqə quruldu');
    }
    catch (error) {
        console.error('MongoDB bağlantı xətası:', error?.message || error);
        console.error('Atlas yoxlama: Network Access-da IP icazesi verin (ya 0.0.0.0/0), Database Access-da istifadeci/parol duzgun olsun, URI-de DB adi olsun.');
        process.exit(1);
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map