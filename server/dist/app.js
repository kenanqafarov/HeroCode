"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const db_1 = require("./config/db");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const matchmaking_routes_1 = __importDefault(require("./routes/matchmaking.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const blog_routes_1 = __importDefault(require("./routes/blog.routes"));
const lesson_routes_1 = __importDefault(require("./routes/lesson.routes"));
const module_routes_1 = __importDefault(require("./routes/module.routes"));
const matchmaking_socket_1 = require("./sockets/matchmaking.socket");
const auth_middleware_1 = require("./middleware/auth.middleware");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: [
            'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:8080',
            'https://herocodeai.vercel.app',
            'https://herocode-h4m0mctc1-knanqafaros-projects.vercel.app'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
    'https://herocodeai.vercel.app',
    'https://herocode-h4m0mctc1-knanqafaros-projects.vercel.app'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', auth_middleware_1.protect, user_routes_1.default);
app.use('/api/matchmaking', auth_middleware_1.protect, matchmaking_routes_1.default);
app.use('/api/admin', auth_middleware_1.protect, admin_routes_1.default);
app.use('/api/blogs', blog_routes_1.default);
app.use('/api/lesson-modules', lesson_routes_1.default);
app.use('/api/modules', module_routes_1.default);
// Socket.IO middleware (token yoxlama)
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token)
        return next(new Error('Token tələb olunur'));
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        socket.handshake.auth.userId = decoded.id;
        next();
    }
    catch (err) {
        next(new Error('Etibarsız token'));
    }
});
// Socket bağlantıları
(0, matchmaking_socket_1.matchmakingSocket)(io);
// Server start
const PORT = process.env.PORT || 5000;
(async () => {
    await (0, db_1.connectDB)();
    server.listen(PORT, () => {
        console.log(`Server http://localhost:${PORT} üzərində işləyir`);
        console.log(`WebSocket ws://localhost:${PORT} hazırdır`);
    });
})();
//# sourceMappingURL=app.js.map