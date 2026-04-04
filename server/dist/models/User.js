"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const knowledgeProfileSchema = new mongoose_1.Schema({
    knownTopics: [String],
    weakTopics: [String],
    lastQuizScore: { type: Number, default: 0 },
    adaptationData: {
        preferredPace: { type: String, enum: ['slow', 'medium', 'fast'], default: 'medium' },
        learningStyle: { type: String, enum: ['visual', 'textual', 'interactive'], default: 'interactive' },
        difficultyMultiplier: { type: Number, default: 1 },
        mistakesCount: { type: Number, default: 0 }
    }
}, { _id: false });
const moduleProgressSchema = new mongoose_1.Schema({
    currentUnit: { type: Number, default: 0 },
    unitsCompleted: [Number],
    totalXP: { type: Number, default: 0 },
    stars: { type: Map, of: Number, default: new Map() },
    timeSpent: { type: Number, default: 0 },
    completedAt: Date
}, { _id: false });
const userSchema = new mongoose_1.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    username: { type: String, unique: true, sparse: true, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    dateOfBirth: Date,
    skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
    reason: String,
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    character: {
        gender: { type: String, enum: ['male', 'female'], default: 'male' },
        emotion: { type: String, default: 'neutral' },
        clothing: { type: String, default: 'tshirt' },
        hairColor: { type: String, default: '#b96321' },
        skin: { type: String, default: '#ffdbac' },
        clothingColor: { type: String, default: '#3b82f6' },
        username: String
    },
    // Gamified Learning System Fields
    knowledgeProfile: { type: Map, of: knowledgeProfileSchema, default: new Map() },
    moduleProgress: { type: Map, of: moduleProgressSchema, default: new Map() },
    unlockedModules: { type: [String], default: ['javascript-basics', 'web-development'] },
    totalLessonXP: { type: Number, default: 0 },
    learnedLanguages: [{
            language: { type: String, required: true },
            level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' }
        }],
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
exports.default = (0, mongoose_1.model)('User', userSchema);
//# sourceMappingURL=User.js.map