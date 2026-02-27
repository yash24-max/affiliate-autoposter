import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSchedule, updateSchedule, activateSchedule, deactivateSchedule, getScheduleHistory } from "../api/schedule";
import type { ScheduleResponse } from "../types";
import toast from "react-hot-toast";

export const useSchedule = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["schedule"],
        queryFn: getSchedule,
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<ScheduleResponse>) => updateSchedule(data),
        onSuccess: (response) => {
            queryClient.setQueryData(["schedule"], response);
            toast.success("Schedule updated successfully");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error?.response?.data?.error?.message || "Failed to update schedule");
        }
    });

    const activateMutation = useMutation({
        mutationFn: activateSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["schedule"] });
            toast.success("Schedule activated");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error?.response?.data?.error?.message || "Failed to activate schedule");
        }
    });

    const deactivateMutation = useMutation({
        mutationFn: deactivateSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["schedule"] });
            toast.success("Schedule paused");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast.error(error?.response?.data?.error?.message || "Failed to pause schedule");
        }
    });

    return {
        ...query,
        updateSchedule: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        activateSchedule: activateMutation.mutate,
        isActivating: activateMutation.isPending,
        deactivateSchedule: deactivateMutation.mutate,
        isDeactivating: deactivateMutation.isPending
    };
};

export const useScheduleHistory = (page: number = 0, size: number = 10) => {
    return useQuery({
        queryKey: ["scheduleHistory", page, size],
        queryFn: () => getScheduleHistory(page, size),
    });
};
