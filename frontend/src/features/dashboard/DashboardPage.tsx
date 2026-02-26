import { useState } from "react";
import {
    Send,
    CalendarDays,
    BarChart3,
    TrendingUp,
    ArrowRight,
    ArrowLeft,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useDashboardSummary, useRecentPosts, useCategoryBreakdown } from "../../hooks/useDashboard";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ['#8b5cf6', '#6366f1', '#0ea5e9', '#ec4899', '#f43f5e', '#10b981'];

export default function DashboardPage() {
    const [page, setPage] = useState(0);
    const size = 5;

    const { data: summaryRes, isLoading: isSummaryLoading } = useDashboardSummary();
    const { data: postsRes, isLoading: isPostsLoading } = useRecentPosts(page, size);
    const { data: categoriesRes, isLoading: isCategoriesLoading } = useCategoryBreakdown();

    const summary = summaryRes?.data;
    const postsData = postsRes?.data;
    const categories = categoriesRes?.data || [];

    // Calculate total posts for percentage breakdown
    const totalCategoryPosts = categories.reduce((sum, item) => sum + item.postCount, 0);

    const stats = [
        { label: "Posts Today", value: summary?.postsToday ?? 0, trend: "+0%", icon: Send, color: "text-success-ui" },
        { label: "This Week", value: summary?.postsThisWeek ?? 0, trend: "+0%", icon: CalendarDays, color: "text-accent-blue" },
        { label: "All Time", value: summary?.postsAllTime ?? 0, trend: "+0%", icon: BarChart3, color: "text-brand-primary" },
        { label: "Success Rate", value: `${summary?.successRate ?? 0}%`, trend: "+0%", icon: TrendingUp, color: "text-warning-ui" },
    ];

    const chartData = categories.map(cat => ({
        name: cat.category,
        value: cat.postCount
    }));

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-text-secondary">Track your affiliate posting performance.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="glass p-5 rounded-2xl space-y-3 group hover:border-brand-primary/30 transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <div className={cn("p-2 rounded-xl bg-bg-subtle", stat.color)}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-1 text-success-ui text-xs font-medium">
                                <TrendingUp className="w-3 h-3" />
                                {stat.trend}
                            </div>
                        </div>
                        <div>
                            {isSummaryLoading ? (
                                <div className="h-8 w-24 bg-bg-subtle animate-pulse rounded my-1" />
                            ) : (
                                <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                            )}
                            <div className="text-text-secondary text-sm">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Table Area */}
                <div className="lg:col-span-2 glass rounded-2xl flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-border-ui flex justify-between items-center bg-bg-base/50">
                        <h2 className="text-lg font-semibold">Recent Posts</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0 || isPostsLoading}
                                className="p-1 rounded-lg bg-bg-subtle hover:bg-bg-subtle/80 disabled:opacity-50 transition text-text-secondary"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={(postsData?.totalPages ? page >= postsData.totalPages - 1 : true) || isPostsLoading}
                                className="p-1 rounded-lg bg-bg-subtle hover:bg-bg-subtle/80 disabled:opacity-50 transition text-text-secondary"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left">
                            <thead className="bg-bg-subtle border-b border-border-ui">
                                <tr className="text-text-secondary text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium">Product Name</th>
                                    <th className="px-6 py-4 font-medium">Category</th>
                                    <th className="px-6 py-4 font-medium">Discount</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-ui">
                                {isPostsLoading ? (
                                    // Skeletons
                                    Array.from({ length: size }).map((_, i) => (
                                        <tr key={i} className="hover:bg-bg-subtle/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="h-5 w-48 bg-bg-subtle animate-pulse rounded" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-24 bg-bg-subtle animate-pulse rounded" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-4 w-12 bg-bg-subtle animate-pulse rounded" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="h-6 w-20 bg-bg-subtle animate-pulse rounded-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : postsData?.content && postsData.content.length > 0 ? (
                                    postsData.content.map((post, i) => (
                                        <tr key={i} className="hover:bg-bg-subtle transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium line-clamp-1">
                                                    {post.productTitle}
                                                </div>
                                                <div className="text-[10px] text-text-secondary font-mono mt-0.5">
                                                    {new Date(post.postedAt).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-text-secondary">
                                                    {post.category}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-success-ui">
                                                    {post.discountPct}% OFF
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase",
                                                    post.status === 'POSTED' ? "bg-success-ui/10 text-success-ui" :
                                                        post.status === 'FAILED' ? "bg-warning-ui/10 text-warning-ui" :
                                                            "bg-brand-primary/10 text-brand-primary"
                                                )}>
                                                    {post.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-text-secondary">
                                            No recent posts found. Let's configure your schedule!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Breakdown Card */}
                <div className="glass rounded-2xl p-6 flex flex-col gap-6">
                    <h2 className="text-lg font-semibold">Category Breakdown</h2>

                    {isCategoriesLoading ? (
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="h-48 w-48 rounded-full bg-bg-subtle animate-pulse self-center" />
                            <div className="space-y-3 mt-4">
                                {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-8 w-full bg-bg-subtle animate-pulse rounded" />)}
                            </div>
                        </div>
                    ) : categories.length > 0 ? (
                        <>
                            <div className="h-48 relative mx-auto w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#13111C', borderColor: '#2D2B3B', borderRadius: '12px' }}
                                            itemStyle={{ color: '#E2E8F0' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold">{totalCategoryPosts}</span>
                                    <span className="text-[10px] text-text-secondary uppercase tracking-widest">Posts</span>
                                </div>
                            </div>
                            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                                {categories.map((cat, i) => {
                                    const percent = totalCategoryPosts > 0 ? Math.round((cat.postCount / totalCategoryPosts) * 100) : 0;
                                    const color = COLORS[i % COLORS.length];

                                    return (
                                        <div key={cat.category} className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="flex items-center gap-2 font-medium">
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                                    {cat.category}
                                                </span>
                                                <span className="text-text-secondary">{percent}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-bg-subtle rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-1000"
                                                    style={{ width: `${percent}%`, backgroundColor: color }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-text-secondary text-sm italic">
                            No category data available yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
