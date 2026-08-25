import { urlApi } from '@/lib/apis/url.api';
import { UrlDetailResponse, UrlListResponse } from '@/types/url.type';
import type { CreateUrlInput } from '@/lib/validators/url.validator';

class UrlService {
    /**
     * Get all urls
     */
    async getAll(workspaceId: string | undefined, page: number, limit: number, search?: string): Promise<UrlListResponse> {
        const response = await urlApi.getAll(workspaceId, page, limit, search);
        return response.data.data;
    }

    /**
     * Get url by id
     */
    async getById(workspaceId: string | undefined, id: string): Promise<UrlDetailResponse> {
        const response = await urlApi.getById(workspaceId, id);
        return response.data.data;
    }

    /**
     * Create a new url
     */
    async create(workspaceId: string | undefined, data: CreateUrlInput): Promise<UrlDetailResponse> {
        const response = await urlApi.create(workspaceId, data);
        return response.data.data;
    }
}

export const urlService = new UrlService();