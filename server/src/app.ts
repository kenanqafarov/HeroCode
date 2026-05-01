/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * HEROCODE BACKEND - EXPRESS SERVER ENTRY POINT
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This file serves as the main Express.js application setup and initialization.
 * It configures:
 * - CORS for frontend communication (supports multiple origins for production)
 * - Express middleware (JSON parsing, routing)
 * - Socket.IO server for real-time features (matchmaking, live battles)
 * - All API routes for authentication, users, modules, blogs, matchmaking, admin
 * - Database connection via MongoDB Atlas
 * 
 * KEY FEATURES:
 * - Multi-origin CORS support for localhost and production Vercel deployments
 * - JWT token verification middleware for Socket.IO connections
 * - Organized route mounting with protection middleware where needed
 * - Real-time game state synchronization via WebSocket
 * 
 * DEPENDENCIES:
 * - Express: HTTP server framework
 * - Socket.IO: Real-time bidirectional communication
 * - CORS: Cross-origin resource sharing middleware
 * - Custom routes and socket handlers defined in /routes and /sockets
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import matchmakingRoutes from './routes/matchmaking.routes';
import adminRoutes from './routes/admin.routes';
import blogRoutes from './routes/blog.routes';
import lessonRoutes from './routes/lesson.routes';
import moduleRoutes from './routes/module.routes';
import { matchmakingSocket } from './sockets/matchmaking.socket';
import { setIo } from './sockets/io';
import { protect } from './middleware/auth.middleware';
import jwt from 'jsonwebtoken';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
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
setIo(io);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  'https://herocodeai.vercel.app',
  'https://herocode-h4m0mctc1-knanqafaros-projects.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// ── API ROUTES ──────────────────────────────────────────────────────────────
// All API endpoints are prefixed with /api and organized by feature
app.use('/api/auth', authRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/matchmaking', protect, matchmakingRoutes);
app.use('/api/admin', protect, adminRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/lesson-modules', lessonRoutes);
app.use('/api/modules', moduleRoutes);

// ── WEBSOCKET MIDDLEWARE ────────────────────────────────────────────────────
// Verify JWT tokens for Socket.IO connections before allowing socket events
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Token tələb olunur'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; isAdmin?: boolean };
    socket.handshake.auth.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Etibarsız token'));
  }
});

// ── SOCKET.IO CONNECTIONS ──────────────────────────────────────────────────
// Real-time game features (matchmaking, battle updates, live chat)
matchmakingSocket(io);

// ── SERVER STARTUP ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} üzərində işləyir`);
    console.log(`WebSocket ws://localhost:${PORT} hazırdır`);
  });
})();
