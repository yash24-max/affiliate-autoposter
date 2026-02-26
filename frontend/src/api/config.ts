import { apiClient } from "./client";
import type { AmazonConfigResponse, TelegramConfigResponse, ApiResponse } from "../types";

export const getAmazonConfig = async (): Promise<ApiResponse<AmazonConfigResponse>> => {
    const response = await apiClient.get<ApiResponse<AmazonConfigResponse>>("/amazon-config");
    return response.data;
};

export const updateAmazonConfig = async (data: Partial<AmazonConfigResponse>): Promise<ApiResponse<AmazonConfigResponse>> => {
    const response = await apiClient.put<ApiResponse<AmazonConfigResponse>>("/amazon-config", data);
    return response.data;
};

export const getTelegramConfig = async (): Promise<ApiResponse<TelegramConfigResponse>> => {
    const response = await apiClient.get<ApiResponse<TelegramConfigResponse>>("/telegram-config");
    return response.data;
};

export const updateTelegramConfig = async (data: Partial<TelegramConfigResponse>): Promise<ApiResponse<TelegramConfigResponse>> => {
    const response = await apiClient.put<ApiResponse<TelegramConfigResponse>>("/telegram-config", data);
    return response.data;
};

export const testTelegramConnection = async (): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>("/telegram-config/test");
    return response.data;
};
