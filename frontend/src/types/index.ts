export interface User {
    id: string;
    email: string;
    name: string;
    plan: 'FREE' | 'PRO' | 'AGENCY';
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface AmazonConfigResponse {
    affiliateTag: string;
    categories: string[];
    minDiscountPct: number;
    minRating: number;
    isActive: boolean;
}

export interface TelegramConfigResponse {
    channelId: string;
    channelName: string;
    isActive: boolean;
    lastVerifiedAt: string;
}

export interface ScheduleResponse {
    postsPerDay: number;
    postingTimes: string[]; // ["09:00", "12:00", ...]
    activeCategories: string[];
    timezone: string;
    isActive: boolean;
    jobStatus: string;
}

export interface DashboardSummary {
    postsToday: number;
    postsThisWeek: number;
    postsAllTime: number;
    successRate: number;
    schedulerStatus: string;
}

export interface RecentPost {
    productTitle: string;
    category: string;
    discountPct: number;
    status: 'POSTED' | 'FAILED' | 'PENDING';
    platform: string;
    postedAt: string;
}

export interface CategoryBreakdown {
    category: string;
    postCount: number;
    successCount: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    traceId?: string;
    timestamp?: string;
}

export interface ApiError {
    errorCode: string;
    message: string;
    traceId?: string;
    timestamp?: string;
}

export interface ApiFailureResponse {
    success: boolean;
    data: null;
    error: ApiError;
}
