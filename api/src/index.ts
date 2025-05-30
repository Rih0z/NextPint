import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { templateRoutes } from './routes/templates';
import { healthRoutes } from './routes/health';

export type WorkerEnv = {
  DB: D1Database;
  ENVIRONMENT: string;
  API_VERSION: string;
}

const app = new Hono<{ Bindings: WorkerEnv }>();

// CORS middleware
app.use('*', cors({
  origin: '*', // 開発・テスト用に一時的に全てのオリジンを許可
  allowHeaders: ['Content-Type', 'Accept'],
  allowMethods: ['GET', 'OPTIONS'],
  exposeHeaders: [],
  maxAge: 600,
  credentials: false,
}));

// Base route
app.get('/', (c) => {
  return c.json({
    name: 'NextPint API',
    version: c.env.API_VERSION || 'v1',
    environment: c.env.ENVIRONMENT || 'production',
  });
});

// Mount routes
app.route('/v1/templates', templateRoutes);
app.route('/v1/health', healthRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({
    status: 'error',
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
    },
    timestamp: new Date().toISOString(),
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`, err);
  
  return c.json({
    status: 'error',
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal server error occurred',
      details: c.env.ENVIRONMENT === 'development' ? err.message : undefined,
    },
    timestamp: new Date().toISOString(),
  }, 500);
});

export default app;