import {
    Clock,
    Calendar,
    Plus,
    ChevronDown,
    Save,
    Power,
    Info,
    RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../../utils/cn";
import { useSchedule } from "../../hooks/useSchedule";

export default function SchedulePage() {
    const { data: response, isLoading, updateSchedule, activateSchedule, deactivateSchedule, isUpdating, isActivating, isDeactivating } = useSchedule();
    const schedule = response?.data;

    // Local form state
    const [postsPerDay, setPostsPerDay] = useState(5);
    const [timezone, setTimezone] = useState("UTC");
    const [isActive, setIsActive] = useState(false);

    // Sync API data to local state when it loads
    useEffect(() => {
        if (schedule) {
            /* eslint-disable react-hooks/set-state-in-effect */
            setPostsPerDay(schedule.postsPerDay || 5);
            setTimezone(schedule.timezone || "UTC");
            setIsActive(schedule.isActive || false);
            /* eslint-enable react-hooks/set-state-in-effect */
        }
    }, [schedule]);

    const handleSave = () => {
        updateSchedule({
            postsPerDay,
            timezone,
            // Keep existing values for fields we aren't editing in this basic UI yet
            postingTimes: schedule?.postingTimes || [],
            activeCategories: schedule?.activeCategories || []
        });
    };

    const handleToggleActive = () => {
        if (isActive) {
            deactivateSchedule();
        } else {
            activateSchedule();
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="flex justify-between">
                    <div className="h-8 w-64 bg-bg-subtle rounded" />
                    <div className="h-10 w-40 bg-bg-subtle rounded-xl" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 h-96 bg-bg-subtle rounded-3xl" />
                    <div className="h-96 bg-bg-subtle rounded-3xl" />
                </div>
            </div>
        );
    }

    const isBusy = isUpdating || isActivating || isDeactivating;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">Schedule Management</h1>
                        <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors",
                            isActive ? "bg-success-ui/10 text-success-ui border border-success-ui/20" : "bg-bg-subtle text-text-secondary border border-border-ui"
                        )}>
                            {isActive ? "Active" : "Paused"}
                        </span>
                    </div>
                    <p className="text-text-secondary">Control when and how often your affiliate posts are published.</p>
                </div>

                <button
                    onClick={handleToggleActive}
                    disabled={isBusy}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all border",
                        isActive
                            ? "bg-danger-ui/10 border-danger-ui/30 text-danger-ui hover:bg-danger-ui/20"
                            : "bg-success-ui border-success-ui text-white glow-brand",
                        isBusy && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {isActivating || isDeactivating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                    {isActive ? "Pause Schedule" : "Resume Schedule"}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Time Slots Visualizer */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="glass rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-brand-primary" />
                                Weekly Time Slots
                            </h2>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-subtle border border-border-ui rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">
                                <Plus className="w-4 h-4" />
                                Add Slot
                            </button>
                        </div>

                        <div className="grid grid-cols-8 border border-border-ui rounded-xl overflow-hidden text-[10px] text-text-secondary">
                            <div className="p-3 border-r border-b border-border-ui bg-bg-subtle font-bold">UTC</div>
                            {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(day => (
                                <div key={day} className="p-3 border-r border-b border-border-ui bg-bg-subtle text-center font-bold">{day}</div>
                            ))}

                            {[6, 9, 12, 15, 18, 21].map(hour => (
                                <div className="contents" key={hour}>
                                    <div key={hour} className="p-3 border-r border-b border-border-ui text-right font-medium">{hour}:00</div>
                                    {Array.from({ length: 7 }).map((_, i) => {
                                        const isScheduled = (hour === 9 || hour === 15 || hour === 21) && i < 5;
                                        return (
                                            <div key={`${hour}-${i}`} className={cn(
                                                "p-3 border-r border-b border-border-ui transition-colors",
                                                isScheduled ? "bg-brand-primary/20 cursor-pointer hover:bg-brand-primary/30" : "hover:bg-white/5"
                                            )}>
                                                {isScheduled && <div className="w-full h-full bg-brand-primary rounded-[2px]" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        <p className="text-[11px] text-text-secondary mt-4 flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/5">
                            <Info className="w-4 h-4 text-brand-primary shrink-0" />
                            Hover over blocks to see products scheduled. Purple blocks indicate confirmed posting slots.
                        </p>
                    </div>
                </div>

                {/* Right: Settings */}
                <div className="space-y-6">
                    <div className="glass rounded-3xl p-6 space-y-6 border border-brand-primary/10">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Clock className="w-5 h-5 text-brand-primary" />
                            Posting Settings
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1 font-inter">Timezone</label>
                                <div className="relative">
                                    <select
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                        className="w-full bg-bg-subtle border border-border-ui rounded-xl py-3 px-4 focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer text-sm"
                                    >
                                        <option value="Asia/Kolkata">Asia/Kolkata (UTC+5:30)</option>
                                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                                        <option value="America/New_York">America/New_York (EST)</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1 font-inter">Posts per Day</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setPostsPerDay(Math.max(1, postsPerDay - 1))}
                                        className="w-10 h-10 rounded-xl border border-border-ui flex items-center justify-center hover:bg-white/5 transition-colors"
                                    >-</button>
                                    <div className="flex-1 bg-bg-subtle border border-border-ui rounded-xl py-2 px-4 text-center text-lg font-bold">{postsPerDay}</div>
                                    <button
                                        onClick={() => setPostsPerDay(Math.min(20, postsPerDay + 1))}
                                        className="w-10 h-10 rounded-xl border border-border-ui flex items-center justify-center hover:bg-white/5 transition-colors"
                                    >+</button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1 font-inter">Max Products per Post</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[1, 3, 5, 10].map(val => (
                                        <button key={val} className={cn(
                                            "py-2 rounded-lg text-sm font-bold border transition-all",
                                            val === 3 ? "bg-brand-primary/10 border-brand-primary text-brand-primary" : "border-border-ui text-text-secondary hover:bg-white/5"
                                        )}>
                                            {val}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <button
                                onClick={handleSave}
                                disabled={isBusy}
                                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3.5 rounded-xl glow-brand transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {isUpdating ? "Saving..." : "Save & Apply"}
                            </button>
                            <button
                                onClick={() => {
                                    setPostsPerDay(schedule?.postsPerDay || 5);
                                    setTimezone(schedule?.timezone || "UTC");
                                }}
                                disabled={isBusy}
                                className="w-full border border-border-ui hover:bg-white/5 text-text-secondary font-bold py-3.5 rounded-xl transition-all disabled:opacity-50"
                            >
                                Reset Draft
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
