import {
    Send,
    CalendarDays,
    BarChart3,
    DollarSign,
    TrendingUp,
    ArrowRight
} from "lucide-react";
import { cn } from "../../utils/cn";

const stats = [
    { label: "Posts Today", value: "12", trend: "+15%", icon: Send, color: "text-success-ui" },
    { label: "This Week", value: "47", trend: "+8%", icon: CalendarDays, color: "text-accent-blue" },
    { label: "All Time", value: "1,204", trend: "+24%", icon: BarChart3, color: "text-brand-primary" },
    { label: "Est. Earnings", value: "$284.50", trend: "+12%", icon: DollarSign, color: "text-warning-ui" },
];

export default function DashboardPage() {
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
                            <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                            <div className="text-text-secondary text-sm">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Table Area */}
                <div className="lg:col-span-2 glass rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-border-ui flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Recent Posts</h2>
                        <button className="text-xs text-brand-primary font-medium flex items-center gap-1 hover:underline">
                            View all <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-text-secondary text-xs uppercase tracking-wider border-b border-border-ui">
                                    <th className="px-6 py-4 font-medium">Product Name</th>
                                    <th className="px-6 py-4 font-medium">Platform</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Posted At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-ui">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="hover:bg-bg-subtle transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-bg-subtle border border-border-ui flex-shrink-0" />
                                                <div className="text-sm font-medium line-clamp-1">
                                                    Product Sample {i} - Professional Affiliate Marketing Tool
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                <div className="w-5 h-5 rounded-full bg-accent-blue/20 flex items-center justify-center">
                                                    <span className="text-[10px] text-accent-blue font-bold">T</span>
                                                </div>
                                                Telegram
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-ui/10 text-success-ui">
                                                Published
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-text-secondary">
                                            {i}h ago
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Breakdown Card */}
                <div className="glass rounded-2xl p-6 space-y-6">
                    <h2 className="text-lg font-semibold">Category Breakdown</h2>
                    <div className="h-48 flex items-center justify-center border-2 border-dashed border-border-ui rounded-xl text-text-secondary text-sm italic">
                        Chart Visualization Placeholder
                    </div>
                    <div className="space-y-3">
                        {[
                            { label: "Electronics", percent: 42, color: "bg-brand-primary" },
                            { label: "Fashion", percent: 28, color: "bg-brand-secondary" },
                            { label: "Books", percent: 18, color: "bg-accent-teal" },
                            { label: "Other", percent: 12, color: "bg-text-secondary" },
                        ].map((cat) => (
                            <div key={cat.label} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="flex items-center gap-2">
                                        <span className={cn("w-2 h-2 rounded-full", cat.color)} />
                                        {cat.label}
                                    </span>
                                    <span className="text-text-secondary">{cat.percent}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-bg-subtle rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full", cat.color)}
                                        style={{ width: `${cat.percent}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
