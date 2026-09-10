import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import apiRouter from './routes';
import healthRouter from './domains/platform/health';
import { errorHandler } from './common/middleware/errorHandler';
import { requestLogger } from './common/middleware/requestLogger';

const app = express();

// Global request logger applied first
app.use(requestLogger);

// Security middleware to set default headers and protect app
app.use(helmet({
  contentSecurityPolicy: false
}));

// Cross-Origin Resource Sharing setup (needed to allow mobile dev server to talk to backend)
app.use(cors());

// Request payload body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register global API routes
app.use('/api', apiRouter);

// Health-check router to verify server status
app.use('/health', healthRouter);

// Serve Web SPA static assets
const webDistPath = path.resolve(__dirname, '../../web/dist');
app.use(express.static(webDistPath));

// Serve media uploads publicly
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// Fallback all non-API requests to index.html for SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
    return next();
  }
  res.sendFile(path.join(webDistPath, 'index.html'));
});

// Register the centralized global error handler middleware
app.use(errorHandler as any);

export default app;
