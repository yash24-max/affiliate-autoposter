import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary, getRecentPosts, getCategoryBreakdown } from "../api/dashboard";

export const useDashboardSummary = () => {
    return useQuery({
        queryKey: ["dashboardSummary"],
        queryFn: getDashboardSummary,
    });
};

export const useRecentPosts = (page: number = 0, size: number = 10) => {
    return useQuery({
        queryKey: ["recentPosts", page, size],
        queryFn: () => getRecentPosts(page, size),
    });
};

export const useCategoryBreakdown = () => {
    return useQuery({
        queryKey: ["categoryBreakdown"],
        queryFn: getCategoryBreakdown,
    });
};
