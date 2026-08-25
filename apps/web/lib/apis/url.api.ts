import { api } from '@/lib/axios';
import { ApiResponse } from '@/types/api.type';
import { UrlDetailResponse, UrlListResponse } from '@/types/url.type';
import type { CreateUrlInput } from '../validators/url.validator';

const PREFIX = '/api/v1';

export const urlApi = {
    /**
     * Create a new url
     */
    create(workspaceId: string | undefined, data: CreateUrlInput) {
        return api.post<ApiResponse<UrlDetailResponse>>(`${PREFIX}/workspaces/${workspaceId}/urls`, data);
    },
    /**
     * Get all urls
     */
    getAll(workspaceId: string | undefined, page: number, limit: number, search?: string) {
        return api.get<ApiResponse<UrlListResponse>>(
            `${PREFIX}/workspaces/${workspaceId}/urls?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`,
        );
    },

    /**
     * Get url by id
     */
    getById(workspaceId: string | undefined, id: string) {
        return api.get<ApiResponse<UrlDetailResponse>>(`${PREFIX}/workspaces/${workspaceId}/urls/${id}`);
    },
};