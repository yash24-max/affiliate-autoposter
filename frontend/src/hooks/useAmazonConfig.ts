import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAmazonConfig, updateAmazonConfig } from "../api/config";
import type { AmazonConfigResponse } from "../types";
import toast from "react-hot-toast";

export const useAmazonConfig = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["amazonConfig"],
        queryFn: getAmazonConfig,
    });

    const mutation = useMutation({
        mutationFn: (data: Partial<AmazonConfigResponse>) => updateAmazonConfig(data),
        onSuccess: (response) => {
            queryClient.setQueryData(["amazonConfig"], response);
            toast.success("Amazon configuration saved");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error?.message || "Failed to save Amazon configuration");
        }
    });

    return {
        ...query,
        updateConfig: mutation.mutate,
        isUpdating: mutation.isPending,
    };
};
