import { apiClient } from "./client";
import type { ScheduleResponse, ApiResponse } from "../types";

export const getSchedule = async (): Promise<ApiResponse<ScheduleResponse>> => {
    const response = await apiClient.get<ApiResponse<ScheduleResponse>>("/schedule");
    return response.data;
};

export const updateSchedule = async (data: Partial<ScheduleResponse>): Promise<ApiResponse<ScheduleResponse>> => {
    const response = await apiClient.put<ApiResponse<ScheduleResponse>>("/schedule", data);
    return response.data;
};

export const activateSchedule = async (): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>("/schedule/activate");
    return response.data;
};

export const deactivateSchedule = async (): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>("/schedule/deactivate");
    return response.data;
};

// Assuming history returns an array of objects for now, can refine type if needed
export const getScheduleHistory = async (page: number = 0, size: number = 10): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.get<ApiResponse<unknown>>("/schedule/history", {
        params: { page, size }
    });
    return response.data;
};
