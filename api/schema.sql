-- プロンプトテンプレートテーブル
CREATE TABLE IF NOT EXISTS prompt_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  version TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'ja-JP',
  template TEXT NOT NULL,
  variables TEXT, -- JSON配列
  metadata TEXT,  -- JSONオブジェクト
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックス
CREATE INDEX idx_templates_category ON prompt_templates(category);
CREATE INDEX idx_templates_locale ON prompt_templates(locale);
CREATE INDEX idx_templates_version ON prompt_templates(version);
CREATE INDEX idx_templates_active ON prompt_templates(is_active);

-- テンプレートバージョンテーブル
CREATE TABLE IF NOT EXISTS template_versions (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  version TEXT NOT NULL,
  changelog TEXT,
  is_latest BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES prompt_templates(id)
);

-- インデックス
CREATE UNIQUE INDEX idx_template_version ON template_versions(template_id, version);
CREATE INDEX idx_latest_version ON template_versions(is_latest);

-- テンプレートカテゴリテーブル
CREATE TABLE IF NOT EXISTS template_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- アプリバージョンテーブル
CREATE TABLE IF NOT EXISTS app_versions (
  version TEXT PRIMARY KEY,
  min_supported_version TEXT,
  release_notes TEXT,
  is_latest BOOLEAN DEFAULT false,
  force_update BOOLEAN DEFAULT false,
  released_at DATETIME DEFAULT CURRENT_TIMESTAMP
);