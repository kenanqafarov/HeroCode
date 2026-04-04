"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const matchmaking_controller_1 = require("../controllers/matchmaking.controller");
const router = (0, express_1.Router)();
router.post('/join', auth_middleware_1.protect, matchmaking_controller_1.joinQueue);
router.delete('/leave-queue', auth_middleware_1.protect, matchmaking_controller_1.leaveQueue);
router.get('/my-match', auth_middleware_1.protect, matchmaking_controller_1.getMyMatch);
router.post('/attack', auth_middleware_1.protect, matchmaking_controller_1.attack);
router.post('/leave-match', auth_middleware_1.protect, matchmaking_controller_1.leaveMatch);
router.get('/start-game-questions', auth_middleware_1.protect, matchmaking_controller_1.startGameQuestions);
exports.default = router;
//# sourceMappingURL=matchmaking.routes.js.map