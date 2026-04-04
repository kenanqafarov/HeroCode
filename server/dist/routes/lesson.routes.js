"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const lesson_controller_1 = require("../controllers/lesson.controller");
const router = (0, express_1.Router)();
/**
 * Lesson Modules Routes
 * All routes require authentication
 */
// Get all modules and user progress
router.get('/', auth_middleware_1.protect, lesson_controller_1.getLessonModules);
// Start a module - generate pre-quiz
router.post('/:moduleId/start', auth_middleware_1.protect, lesson_controller_1.startModule);
// Submit pre-quiz and get personalized module
router.post('/:moduleId/pre-quiz-submit', auth_middleware_1.protect, lesson_controller_1.submitPreQuiz);
// Submit unit quiz and advance
router.post('/:moduleId/unit/:unitId/quiz-submit', auth_middleware_1.protect, lesson_controller_1.submitUnitQuiz);
// Submit battle result
router.post('/:moduleId/battle/result', auth_middleware_1.protect, lesson_controller_1.submitBattleResult);
exports.default = router;
//# sourceMappingURL=lesson.routes.js.map