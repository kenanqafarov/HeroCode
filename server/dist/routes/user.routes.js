"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
router.get('/me', auth_middleware_1.protect, user_controller_1.getMe);
router.patch('/me', auth_middleware_1.protect, user_controller_1.updateMe);
router.put('/character', auth_middleware_1.protect, user_controller_1.updateCharacter);
router.get('/:id', auth_middleware_1.protect, user_controller_1.getUserById);
exports.default = router;
//# sourceMappingURL=user.routes.js.map