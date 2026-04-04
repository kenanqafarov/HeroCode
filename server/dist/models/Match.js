"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const matchSchema = new mongoose_1.Schema({
    player1Id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    player2Id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    player1Health: { type: Number, default: 100 },
    player2Health: { type: Number, default: 100 },
    status: { type: String, enum: ['Waiting', 'Active', 'Finished'], default: 'Waiting' },
    winnerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
    questions: [{ type: String }],
    currentQuestionIndex: { type: Number, default: 0 }
});
exports.default = (0, mongoose_1.model)('Match', matchSchema);
//# sourceMappingURL=Match.js.map