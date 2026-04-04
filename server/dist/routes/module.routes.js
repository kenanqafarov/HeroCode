"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const module_controller_1 = require("../controllers/module.controller");
const router = (0, express_1.Router)();
// Public routes
router.get('/', module_controller_1.getAllModules);
router.get('/:id', module_controller_1.getModuleById);
// Admin only routes
router.post('/', auth_middleware_1.protect, auth_middleware_1.adminOnly, module_controller_1.createModule);
router.put('/:id', auth_middleware_1.protect, auth_middleware_1.adminOnly, module_controller_1.updateModule);
router.delete('/:id', auth_middleware_1.protect, auth_middleware_1.adminOnly, module_controller_1.deleteModule);
exports.default = router;
//# sourceMappingURL=module.routes.js.map