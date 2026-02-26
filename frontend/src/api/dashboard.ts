import { apiClient } from "./client";
import type { DashboardSummary, RecentPost, CategoryBreakdown, ApiResponse } from "../types";

export const getDashboardSummary = async (): Promise<ApiResponse<DashboardSummary>> => {
    const response = await apiClient.get<ApiResponse<DashboardSummary>>("/dashboard/summary");
    return response.data;
};

// The docs mention `RecentPost` is paginated. Let's assume a standard Spring Data Page or similar format
// For now, wrapper type `PaginatedResponse<T>` could represent that. Let's use `any` wrapper temporarily if exact format isn't specified,
// or assume `ApiResponse<{ content: T[], totalPages: number }>`
export interface PaginatedData<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export const getRecentPosts = async (page: number = 0, size: number = 10): Promise<ApiResponse<PaginatedData<RecentPost>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedData<RecentPost>>>("/dashboard/recent-posts", {
        params: { page, size }
    });
    return response.data;
};

export const getCategoryBreakdown = async (): Promise<ApiResponse<CategoryBreakdown[]>> => {
    const response = await apiClient.get<ApiResponse<CategoryBreakdown[]>>("/dashboard/category-breakdown");
    return response.data;
};
