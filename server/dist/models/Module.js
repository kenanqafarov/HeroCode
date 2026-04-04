"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const moduleSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    language: { type: String, required: true, trim: true }, // JavaScript, Python, Rust, Go, etc.
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    description: { type: String, required: true, trim: true },
    content: { type: String, required: true }, // HTML or Markdown content
    tags: [{ type: String, trim: true }],
    questions: [
        {
            question: { type: String, required: true },
            options: [{ type: String, required: true }],
            correctAnswer: { type: Number, required: true },
            explanation: { type: String, default: '' }
        }
    ],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Module', moduleSchema);
//# sourceMappingURL=Module.js.map