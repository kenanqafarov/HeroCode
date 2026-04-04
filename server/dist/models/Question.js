"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const questionSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    functionSignature: { type: String, required: true },
    testCases: [{ input: mongoose_1.Schema.Types.Mixed, output: mongoose_1.Schema.Types.Mixed }],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
});
exports.default = (0, mongoose_1.model)('Question', questionSchema);
//# sourceMappingURL=Question.js.map