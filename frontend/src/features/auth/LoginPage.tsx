import { Rocket, Mail, Lock, Eye, EyeOff, Github, Chrome, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        }
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
        return () => clearError();
    }, [isAuthenticated, navigate, clearError]);

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await login(data.email, data.password);
        } catch (err) {
            // Error is handled by AuthProvider and stored in 'error' state
            console.error("Login failed:", err);
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-bg-base text-text-primary">
            {/* Left Panel - Brand */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-brand-primary to-brand-secondary p-12 flex-col justify-between relative overflow-hidden shadow-2xl">
                <div className="z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                            <Rocket className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">Autoposter</span>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-5xl font-extrabold leading-tight text-white tracking-tight">
                            Automate Your <br />
                            <span className="text-white/80 font-medium">Affiliate Empire</span>
                        </h1>
                        <p className="text-xl text-white/70 max-w-md">
                            Connect once. Post automatically. Earn consistently with zero daily manual effort.
                        </p>

                        <ul className="space-y-4 pt-4">
                            {[
                                "Zero daily manual effort",
                                "Amazon → Telegram in minutes",
                                "Track earnings on one dashboard"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-white/80">
                                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Abstract shapes */}
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-40 -right-20 w-60 h-60 bg-brand-secondary/30 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Right Panel - Auth Card */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-4xl font-extrabold tracking-tight">Welcome Back</h2>
                        <p className="text-text-secondary text-lg">Sign in to manage your automated posts.</p>
                    </div>

                    {error && (
                        <div className="bg-danger-ui/10 border border-danger-ui/20 text-danger-ui px-4 py-3 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-primary pl-1">Email Address</label>
                            <div className="relative group">
                                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.email ? 'text-danger-ui' : 'text-text-secondary group-focus-within:text-brand-primary'}`} />
                                <input
                                    {...register("email")}
                                    type="email"
                                    placeholder="you@example.com"
                                    disabled={isLoading}
                                    className={`w-full bg-bg-surface border rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-4 transition-all font-medium text-text-primary placeholder:text-text-disabled disabled:opacity-50 disabled:cursor-not-allowed ${errors.email
                                            ? 'border-danger-ui focus:ring-danger-ui/10'
                                            : 'border-border-ui focus:border-brand-primary focus:ring-brand-primary/10'
                                        }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-danger-ui font-medium pl-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-semibold text-text-primary">Password</label>
                                <button type="button" className="text-xs font-bold text-brand-primary hover:underline transition-all">Forgot password?</button>
                            </div>
                            <div className="relative group">
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.password ? 'text-danger-ui' : 'text-text-secondary group-focus-within:text-brand-primary'}`} />
                                <input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    className={`w-full bg-bg-surface border rounded-2xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-4 transition-all font-medium text-text-primary placeholder:text-text-disabled disabled:opacity-50 disabled:cursor-not-allowed ${errors.password
                                            ? 'border-danger-ui focus:ring-danger-ui/10'
                                            : 'border-border-ui focus:border-brand-primary focus:ring-brand-primary/10'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-danger-ui font-medium pl-1">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 px-1">
                            <input
                                {...register("rememberMe")}
                                type="checkbox"
                                id="remember"
                                className="w-4.5 h-4.5 rounded-lg border-border-ui bg-bg-surface text-brand-primary focus:ring-brand-primary transition-all cursor-pointer"
                            />
                            <label htmlFor="remember" className="text-sm text-text-secondary font-medium cursor-pointer select-none">Stay signed in for 30 days</label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-extrabold py-4 rounded-2xl elevation-1 hover:elevation-2 transition-all mt-4 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                "Sign In to Autoposter"
                            )}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border-ui" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-bg-base px-4 text-text-disabled font-bold tracking-widest">or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-3 bg-bg-surface border border-border-ui hover:bg-bg-subtle py-3.5 rounded-2xl transition-all hover:border-text-disabled active:scale-[0.98]">
                            <Chrome className="w-5 h-5" />
                            <span className="text-sm font-bold">Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-3 bg-bg-surface border border-border-ui hover:bg-bg-subtle py-3.5 rounded-2xl transition-all hover:border-text-disabled active:scale-[0.98]">
                            <Github className="w-5 h-5" />
                            <span className="text-sm font-bold">Github</span>
                        </button>
                    </div>

                    <p className="text-center text-text-secondary font-medium pt-4">
                        New here?{" "}
                        <Link to="/register" className="text-brand-primary font-extrabold hover:underline">
                            Start for free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
