import { Outlet, Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Settings,
    Clock,
    BarChart3,
    HelpCircle,
    Bell,
    ChevronLeft,
    ChevronRight,
    Rocket,
    LogOut
} from "lucide-react";
import { useState } from "react";
import { cn } from "../utils/cn";
import { useAuth } from "../providers/AuthProvider";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Settings, label: "Configuration", path: "/settings" },
    { icon: Clock, label: "Schedule", path: "/schedule" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: HelpCircle, label: "Help", path: "/help" },
];

export function AppShell() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();

    return (
        <div className="flex h-screen bg-bg-base text-text-primary overflow-hidden font-inter">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-bg-surface border-r border-border-ui transition-all duration-300 flex flex-col z-20 shadow-sm",
                    isCollapsed ? "w-20" : "w-64"
                )}
            >
                <div className="h-16 flex items-center px-6 border-b border-border-ui shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center glow-brand shrink-0 elevation-1">
                            <Rocket className="w-5 h-5 text-white" />
                        </div>
                        {!isCollapsed && (
                            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-br from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                                Autoposter
                            </span>
                        )}
                    </div>
                </div>

                <nav className="flex-1 py-6 overflow-y-auto px-3 space-y-1.5">
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all relative group",
                                    isActive
                                        ? "bg-brand-primary/10 text-brand-primary font-bold shadow-[inset_4px_0_0_0_#4F46E5]"
                                        : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary font-medium"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110", isActive && "text-brand-primary")} />
                                {!isCollapsed && <span className="text-sm tracking-tight">{item.label}</span>}
                                {isCollapsed && (
                                    <div className="absolute left-16 bg-bg-surface border border-border-ui px-3 py-1.5 rounded-xl shadow-xl text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0 pointer-events-none z-50">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-border-ui space-y-1">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-danger-ui hover:bg-danger-ui/5 font-bold transition-all group"
                    >
                        <LogOut className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
                        {!isCollapsed && <span className="text-sm tracking-tight">Sign Out</span>}
                    </button>

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-text-secondary hover:bg-bg-subtle font-bold transition-all group"
                    >
                        <div className="transition-transform duration-300 group-hover:scale-110">
                            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                        </div>
                        {!isCollapsed && <span className="text-sm tracking-tight">Collapse View</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navbar */}
                <header className="h-16 bg-bg-surface border-b border-border-ui px-8 flex items-center justify-between shrink-0 z-10 shadow-sm">
                    <div className="flex items-center gap-2 text-text-secondary text-sm font-semibold">
                        <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
                        <span className="text-text-disabled">/</span>
                        <span className="text-text-primary font-bold tracking-tight capitalize">
                            {location.pathname.split("/").pop() || "Dashboard"}
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-text-secondary hover:text-brand-primary transition-all hover:scale-110">
                            <Bell className="w-5.5 h-5.5" />
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-danger-ui rounded-full border-2 border-bg-surface" />
                        </button>

                        <div className="flex items-center gap-3 pl-4 border-l border-border-ui">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-extrabold text-text-primary leading-none mb-0.5">{user?.name || "Guest User"}</p>
                                <p className="text-[10px] font-bold text-text-disabled uppercase tracking-widest leading-none">Standard Plan</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-sm font-black text-white shadow-lg elevation-1 cursor-pointer hover:scale-105 transition-transform border border-white/20">
                                {user?.name?.split(" ").map(n => n[0]).join("") || "GU"}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 lg:p-10 bg-bg-base/50 backdrop-blur-sm">
                    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
