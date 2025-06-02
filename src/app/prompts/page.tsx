'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles,
  Search,
  Filter,
  Copy,
  Check,
  Heart,
  Star,
  Download,
  Share2,
  Plus,
  BookOpen,
  Zap,
  Target,
  BarChart3,
  Coffee,
  Users,
  Globe
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { ServiceFactory } from '@/application/factories/ServiceFactory';
import { PromptTemplate, PromptCategory } from '@/types';

type CategoryFilter = 'all' | PromptCategory.SEARCH | PromptCategory.ANALYSIS | PromptCategory.COMPARISON | PromptCategory.IMPORT;

export default function PromptsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadTemplates();
    loadFavorites();
    // Track page view
    ServiceFactory.getAnalyticsService().trackEvent('page_view', { page: 'prompts' });
  }, []);

  const loadTemplates = async () => {
    try {
      const promptService = ServiceFactory.getPromptService();
      const templatesData = await promptService.getTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem('nextpint_favorite_prompts');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = (newFavorites: string[]) => {
    try {
      localStorage.setItem('nextpint_favorite_prompts', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const toggleFavorite = (templateId: string) => {
    const newFavorites = favorites.includes(templateId)
      ? favorites.filter(id => id !== templateId)
      : [...favorites, templateId];
    
    saveFavorites(newFavorites);
    
    ServiceFactory.getAnalyticsService().trackEvent('prompt_favorite_toggle', {
      templateId,
      isFavorite: newFavorites.includes(templateId)
    });
  };

  const copyTemplate = async (template: PromptTemplate) => {
    try {
      await navigator.clipboard.writeText(template.template);
      setCopiedTemplate(template.id);
      setTimeout(() => setCopiedTemplate(null), 2000);
      
      ServiceFactory.getAnalyticsService().trackEvent('prompt_template_copied', {
        templateId: template.id,
        category: template.category
      });
    } catch (error) {
      console.error('Failed to copy template:', error);
    }
  };

  const shareTemplate = async (template: PromptTemplate) => {
    try {
      const shareData = {
        title: `NextPint: ${template.name}`,
        text: template.description,
        url: `${window.location.origin}/prompts?template=${template.id}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
        ServiceFactory.getAnalyticsService().trackEvent('prompt_template_shared', {
          templateId: template.id,
          method: 'native'
        });
      } else {
        await navigator.clipboard.writeText(`${template.name}\n\n${template.description}\n\n${window.location.href}`);
        alert('プロンプト情報をクリップボードにコピーしました');
        ServiceFactory.getAnalyticsService().trackEvent('prompt_template_shared', {
          templateId: template.id,
          method: 'clipboard'
        });
      }
    } catch (error) {
      console.error('Error sharing template:', error);
    }
  };

  const filteredTemplates = templates
    .filter(template => {
      // Category filter
      if (categoryFilter !== 'all' && template.category !== categoryFilter) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          template.name.toLowerCase().includes(searchLower) ||
          template.description.toLowerCase().includes(searchLower) ||
          template.variables.some(v => v.name.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Favorites first
      const aIsFavorite = favorites.includes(a.id);
      const bIsFavorite = favorites.includes(b.id);
      
      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;
      
      // Then by name
      return a.name.localeCompare(b.name);
    });

  const categories = [
    { 
      value: 'all', 
      label: 'すべて', 
      icon: Globe, 
      count: templates.length,
      description: '全てのプロンプトテンプレート'
    },
    { 
      value: PromptCategory.SEARCH, 
      label: 'ビール発見', 
      icon: Target, 
      count: templates.filter(t => t.category === PromptCategory.SEARCH).length,
      description: '新しいビールを発見するためのプロンプト'
    },
    { 
      value: PromptCategory.ANALYSIS, 
      label: '分析', 
      icon: BarChart3, 
      count: templates.filter(t => t.category === PromptCategory.ANALYSIS).length,
      description: 'あなたの好みを分析するプロンプト'
    },
    { 
      value: PromptCategory.COMPARISON, 
      label: '比較', 
      icon: Search, 
      count: templates.filter(t => t.category === PromptCategory.COMPARISON).length,
      description: 'ビールを比較するプロンプト'
    },
    { 
      value: PromptCategory.IMPORT, 
      label: 'インポート', 
      icon: Coffee, 
      count: templates.filter(t => t.category === PromptCategory.IMPORT).length,
      description: 'データインポートのプロンプト'
    }
  ];

  const getCategoryIcon = (category: PromptCategory) => {
    const categoryMap: Record<PromptCategory, any> = {
      [PromptCategory.SEARCH]: Target,
      [PromptCategory.ANALYSIS]: BarChart3,
      [PromptCategory.COMPARISON]: Search,
      [PromptCategory.IMPORT]: Coffee
    };
    return categoryMap[category] || Sparkles;
  };

  const getCategoryColor = (category: PromptCategory) => {
    const colorMap: Record<PromptCategory, string> = {
      [PromptCategory.SEARCH]: 'text-green-400 bg-green-500/20',
      [PromptCategory.ANALYSIS]: 'text-blue-400 bg-blue-500/20',
      [PromptCategory.COMPARISON]: 'text-purple-400 bg-purple-500/20',
      [PromptCategory.IMPORT]: 'text-orange-400 bg-orange-500/20'
    };
    return colorMap[category] || 'text-primary-400 bg-primary-500/20';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center animate-fade-in">
            <div className="spinner mx-auto mb-6"></div>
            <p className="text-lg text-text-secondary">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navigation />
      
      <main className="mobile-container mobile-section pb-24 lg:pb-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">プロンプトライブラリ</h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            AIビール発見のための厳選されたプロンプトテンプレート集。<br />
            あなたの目的に合わせて最適なプロンプトを選んでください。
          </p>
        </div>

        {/* Search and Filters */}
        <div className="glass-card rounded-xl p-4 mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="プロンプトを検索..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-background-secondary border border-gray-700 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.value}
                  onClick={() => setCategoryFilter(category.value as CategoryFilter)}
                  className={`
                    p-4 rounded-lg border text-left transition-all
                    ${categoryFilter === category.value
                      ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                      : 'border-gray-700 bg-background-secondary hover:border-gray-600'
                    }
                  `}
                  title={category.description}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={20} />
                    <span className="font-medium">{category.label}</span>
                  </div>
                  <div className="text-sm text-text-secondary">
                    {category.count}個のテンプレート
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-6 opacity-50">🔍</div>
            <h3 className="text-xl font-semibold mb-3">
              {searchTerm ? '条件に一致するプロンプトが見つかりません' : 'プロンプトがありません'}
            </h3>
            <p className="text-text-secondary mb-6">
              {searchTerm 
                ? '検索条件を変更してみてください'
                : 'プロンプトテンプレートを追加してください'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="btn-secondary"
              >
                検索をクリア
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTemplates.map((template) => {
              const CategoryIcon = getCategoryIcon(template.category);
              const isFavorite = favorites.includes(template.id);
              const isCopied = copiedTemplate === template.id;
              
              return (
                <div key={template.id} className="glass-card rounded-xl p-6 hover:scale-[1.02] transition-all duration-200">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getCategoryColor(template.category)}`}>
                        <CategoryIcon size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                        <p className="text-sm text-text-secondary line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleFavorite(template.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isFavorite 
                          ? 'text-red-400 bg-red-500/20' 
                          : 'text-text-tertiary hover:text-red-400 hover:bg-red-500/10'
                      }`}
                    >
                      <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Variables */}
                  {template.variables.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-text-secondary mb-2">使用する変数:</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.slice(0, 4).map((variable) => (
                          <span 
                            key={variable.name}
                            className="px-2 py-1 bg-background-secondary rounded text-xs text-text-tertiary"
                          >
                            {variable.name}
                          </span>
                        ))}
                        {template.variables.length > 4 && (
                          <span className="px-2 py-1 bg-background-secondary rounded text-xs text-text-tertiary">
                            +{template.variables.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* AI Compatibility */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-text-secondary mb-2">対応AI:</h4>
                    <div className="flex gap-2">
                      {template.metadata.supportedAI.map((ai) => (
                        <span 
                          key={ai}
                          className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs"
                        >
                          {ai.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Template Preview */}
                  <div className="bg-background-secondary rounded-lg p-3 mb-4">
                    <div className="text-xs text-text-secondary mb-2">プロンプトプレビュー:</div>
                    <div className="text-sm line-clamp-3">
                      {template.template.substring(0, 150)}...
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyTemplate(template)}
                      className={`
                        flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-all
                        ${isCopied 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                        }
                      `}
                    >
                      {isCopied ? <Check size={16} /> : <Copy size={16} />}
                      {isCopied ? 'コピー済み' : 'コピー'}
                    </button>
                    
                    <button
                      onClick={() => shareTemplate(template)}
                      className="px-4 py-2 bg-background-secondary text-text-secondary hover:text-text-primary hover:bg-background-tertiary rounded-lg transition-colors"
                    >
                      <Share2 size={16} />
                    </button>
                    
                    <button
                      onClick={() => router.push(`/sessions/create?template=${template.id}`)}
                      className="px-4 py-2 bg-secondary-500/20 text-secondary-400 hover:bg-secondary-500/30 rounded-lg transition-colors"
                    >
                      <Zap size={16} />
                    </button>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-text-tertiary mt-4 pt-4 border-t border-gray-700">
                    <span>v{template.version}</span>
                    <span>{new Date(template.updatedAt).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 glass-card rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <BookOpen size={24} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">プロンプトの使い方</h3>
              <div className="text-text-secondary space-y-2 text-sm">
                <p>1. 目的に合ったプロンプトテンプレートを選択</p>
                <p>2. 「コピー」ボタンでプロンプトをクリップボードにコピー</p>
                <p>3. ChatGPT、Claude、Geminiなどのお好みのAIサービスに貼り付け</p>
                <p>4. AIからの返答を参考にビール発見を楽しもう！</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}