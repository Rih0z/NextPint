import { Hono } from 'hono';
import { Env } from '../index';

const templates = new Hono<{ Bindings: Env }>();

// GET /v1/templates
templates.get('/', async (c) => {
  const { version, category, locale = 'ja-JP' } = c.req.query();
  
  try {
    let query = `
      SELECT id, name, description, category, version, locale, template, variables, metadata, created_at, updated_at
      FROM prompt_templates
      WHERE is_active = true AND locale = ?
    `;
    const params: any[] = [locale];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (version) {
      query += ' AND version = ?';
      params.push(version);
    }

    query += ' ORDER BY created_at DESC LIMIT 20';

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    // Parse JSON fields
    const templates = results.map((row: any) => ({
      ...row,
      variables: JSON.parse(row.variables || '[]'),
      metadata: JSON.parse(row.metadata || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return c.json({
      status: 'success',
      data: {
        templates,
        pagination: {
          total: templates.length,
          page: 1,
          limit: 20,
          hasNext: false,
        },
        meta: {
          latestVersion: '1.0.0',
          totalCategories: 4,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }
});

// GET /v1/templates/:id
templates.get('/:id', async (c) => {
  const { id } = c.req.param();
  
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT id, name, description, category, version, locale, template, variables, metadata, created_at, updated_at
      FROM prompt_templates
      WHERE id = ? AND is_active = true
    `).bind(id).all();

    if (results.length === 0) {
      return c.json({
        status: 'error',
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: '指定されたテンプレートが見つかりません',
          details: {
            templateId: id,
          },
        },
        timestamp: new Date().toISOString(),
      }, 404);
    }

    const row = results[0] as any;
    const template = {
      ...row,
      variables: JSON.parse(row.variables || '[]'),
      metadata: JSON.parse(row.metadata || '{}'),
      examples: [], // TODO: Load from separate table if needed
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return c.json({
      status: 'success',
      data: {
        template,
      },
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    throw error;
  }
});

export const templateRoutes = templates;