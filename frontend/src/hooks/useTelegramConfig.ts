import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTelegramConfig, updateTelegramConfig, testTelegramConnection } from "../api/config";
import type { TelegramConfigResponse } from "../types";
import toast from "react-hot-toast";

export const useTelegramConfig = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["telegramConfig"],
        queryFn: getTelegramConfig,
    });

    const mutation = useMutation({
        mutationFn: (data: Partial<TelegramConfigResponse>) => updateTelegramConfig(data),
        onSuccess: (response) => {
            queryClient.setQueryData(["telegramConfig"], response);
            toast.success("Telegram configuration saved");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error?.response?.data?.error?.message || "Failed to save Telegram configuration");
        }
    });

    const testConnectionMutation = useMutation({
        mutationFn: testTelegramConnection,
        onSuccess: (response) => {
            toast.success(response.data?.message || "Test message sent successfully!");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error?.response?.data?.error?.message || "Failed to send test message");
        }
    });

    return {
        ...query,
        updateConfig: mutation.mutate,
        isUpdating: mutation.isPending,
        testConnection: testConnectionMutation.mutate,
        isTesting: testConnectionMutation.isPending
    };
};
