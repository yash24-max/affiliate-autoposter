import { apiClient } from "./client";

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
}

export const authService = {
    async login(email: string, password: string): Promise<AuthResponse> {
        const { data } = await apiClient.post<AuthResponse>("/auth/login", {
            email,
            password,
        });
        return data;
    },

    async register(name: string, email: string, password: string): Promise<AuthResponse> {
        const { data } = await apiClient.post<AuthResponse>("/auth/register", {
            name,
            email,
            password,
        });
        return data;
    },

    async getMe(): Promise<{ user: User }> {
        const { data } = await apiClient.get<{ user: User }>("/auth/me");
        return data;
    },

    async forgotPassword(email: string): Promise<{ message: string }> {
        const { data } = await apiClient.post<{ message: string }>("/auth/forgot-password", { email });
        return data;
    },

    async resetPassword(req: ResetPasswordRequest): Promise<{ message: string }> {
        const { data } = await apiClient.post<{ message: string }>("/auth/reset-password", req);
        return data;
    },
};
