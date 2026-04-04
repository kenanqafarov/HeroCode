"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// User Management
router.get('/users', auth_middleware_1.protect, auth_middleware_1.adminOnly, admin_controller_1.getAllUsers);
router.get('/users/:id', auth_middleware_1.protect, auth_middleware_1.adminOnly, admin_controller_1.getUserById);
router.patch('/users/:id', auth_middleware_1.protect, auth_middleware_1.adminOnly, admin_controller_1.updateUser);
router.delete('/users/:id', auth_middleware_1.protect, auth_middleware_1.adminOnly, admin_controller_1.deleteUser);
// Match Management
router.get('/matches', auth_middleware_1.protect, auth_middleware_1.adminOnly, admin_controller_1.getAllMatches);
// Module Management
router.get('/modules', auth_middleware_1.protect, auth_middleware_1.adminOnly, admin_controller_1.getAdminModules);
// Blog Management
router.get('/blogs', auth_middleware_1.protect, auth_middleware_1.adminOnly, admin_controller_1.getAdminBlogs);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map