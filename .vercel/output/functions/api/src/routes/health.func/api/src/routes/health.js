import { Hono } from 'hono';
const health = new Hono();
// GET /v1/health
health.get('/', (c) => {
    return c.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: c.env.API_VERSION || 'v1',
        environment: c.env.ENVIRONMENT || 'production',
    });
});
// GET /v1/version
health.get('/version', (c) => {
    return c.json({
        status: 'success',
        data: {
            latestVersion: '1.0.0',
            supportedVersions: ['1.0.0'],
            deprecatedVersions: [],
            releaseNotes: '初回リリース - プロンプトテンプレート配信機能',
        },
    });
});
export const healthRoutes = health;
//# sourceMappingURL=health.js.map