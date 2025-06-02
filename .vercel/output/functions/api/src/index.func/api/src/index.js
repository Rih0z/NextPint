/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { templateRoutes } from './routes/templates';
import { healthRoutes } from './routes/health';
const app = new Hono();
// Security headers
app.use('*', secureHeaders({
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'strict-origin-when-cross-origin',
    xXssProtection: '1; mode=block',
}));
// CORS middleware - Allow only specific origins
app.use('*', cors({
    origin: [
        'https://nextpint-web.pages.dev',
        'http://localhost:3000',
        'http://localhost:8081'
    ],
    allowHeaders: ['Content-Type', 'Accept', 'Authorization'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    exposeHeaders: [],
    maxAge: 86400,
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
    // Only log errors in development
    if (c.env.ENVIRONMENT === 'development') {
        console.error(`Error: ${err.message}`, err);
    }
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
//# sourceMappingURL=index.js.map