"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_controller_1 = require("../controllers/blog.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', blog_controller_1.getAllBlogs);
router.get('/:id', blog_controller_1.getBlogById);
// Protected routes
router.post('/', auth_middleware_1.protect, blog_controller_1.createBlog);
router.get('/user/my-blogs', auth_middleware_1.protect, blog_controller_1.getUserBlogs);
router.put('/:id', auth_middleware_1.protect, blog_controller_1.updateBlog);
router.delete('/:id', auth_middleware_1.protect, blog_controller_1.deleteBlog);
router.post('/:id/like', auth_middleware_1.protect, blog_controller_1.likeBlog);
router.post('/:id/comment', auth_middleware_1.protect, blog_controller_1.addCommentOrReply); // həm comment, həm reply üçün
exports.default = router;
//# sourceMappingURL=blog.routes.js.map