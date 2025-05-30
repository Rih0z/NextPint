import { PromptTemplate } from '@/types';

const API_BASE_URL = 'https://nextpint-api.riho-dare.workers.dev';

export class ApiService {
  private static instance: ApiService;
  
  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }

  async getHealth(): Promise<{ status: string; timestamp: string; version: string; environment: string }> {
    return this.request('/v1/health');
  }

  async getTemplates(params?: {
    version?: string;
    category?: string;
    locale?: string;
  }): Promise<{
    status: string;
    data: {
      templates: PromptTemplate[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        hasNext: boolean;
      };
      meta: {
        latestVersion: string;
        totalCategories: number;
      };
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.version) searchParams.append('version', params.version);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.locale) searchParams.append('locale', params.locale);
    
    const query = searchParams.toString();
    const endpoint = `/v1/templates${query ? `?${query}` : ''}`;
    
    return this.request(endpoint);
  }

  async getTemplate(id: string): Promise<{
    status: string;
    data: {
      template: PromptTemplate;
    };
  }> {
    return this.request(`/v1/templates/${id}`);
  }
}

export const apiService = ApiService.getInstance();