import { Rocket, Mail, Lock, Eye, EyeOff, User, Loader2, AlertCircle, MailCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285f4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34a853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#fbbc05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ea4335" />
    </svg>
);

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");
    const { register: signup, isLoading, error, clearError, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        }
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/setup");
        }
        return () => clearError();
    }, [isAuthenticated, navigate, clearError]);

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            await signup(data.name, data.email, data.password);
            setRegisteredEmail(data.email);
            setRegistered(true);
        } catch (err) {
            console.error("Registration failed:", err);
        }
    };

    if (registered) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-bg-base relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent-blue/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="glass w-full max-w-md p-8 rounded-3xl z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 text-center">
                    <MailCheck className="w-12 h-12 text-brand-primary mx-auto mb-6" />
                    <h1 className="text-2xl font-bold mb-2 tracking-tight">Check your inbox</h1>
                    <p className="text-text-secondary text-sm mb-8">
                        We sent a verification link to <span className="text-text-primary font-medium">{registeredEmail}</span>.
                        Click the link in the email to activate your account.
                    </p>
                    <Link
                        to="/login"
                        className="text-brand-primary hover:underline font-medium text-sm"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-bg-base text-text-primary">
            {/* Left Panel - Brand */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-brand-secondary to-brand-primary p-12 flex-col justify-between relative overflow-hidden shadow-2xl">
                <div className="z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                            <Rocket className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">Autoposter</span>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-5xl font-extrabold leading-tight text-white tracking-tight">
                            Start Your <br />
                            <span className="text-white/80 font-medium">Journey Today</span>
                        </h1>
                        <p className="text-xl text-white/70 max-w-md">
                            Join thousands of affiliates automating their passive income. Setup takes less than 5 minutes.
                        </p>
                    </div>
                </div>

                {/* Abstract shape */}
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-40 -right-20 w-60 h-60 bg-brand-primary/30 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Right Panel - Register Card */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-4xl font-extrabold tracking-tight">Get Started</h2>
                        <p className="text-text-secondary text-lg font-medium">Create an account to start automating.</p>
                    </div>

                    {error && (
                        <div className="bg-danger-ui/10 border border-danger-ui/20 text-danger-ui px-4 py-3 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-primary pl-1">Full Name</label>
                            <div className="relative group">
                                <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.name ? 'text-danger-ui' : 'text-text-secondary group-focus-within:text-brand-primary'}`} />
                                <input
                                    {...register("name")}
                                    type="text"
                                    placeholder="John Doe"
                                    disabled={isLoading}
                                    className={`w-full bg-bg-surface border rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-4 transition-all font-medium text-text-primary placeholder:text-text-disabled disabled:opacity-50 disabled:cursor-not-allowed ${errors.name
                                        ? 'border-danger-ui focus:ring-danger-ui/10'
                                        : 'border-border-ui focus:border-brand-primary focus:ring-brand-primary/10'
                                        }`}
                                />
                            </div>
                            {errors.name && (
                                <p className="text-xs text-danger-ui font-medium pl-1">{errors.name.message}</p>
                            )}
                        </div>

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
                            <label className="text-sm font-semibold text-text-primary pl-1">Password</label>
                            <div className="relative group">
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.password ? 'text-danger-ui' : 'text-text-secondary group-focus-within:text-brand-primary'}`} />
                                <input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a strong password"
                                    disabled={isLoading}
                                    className={`w-full bg-bg-surface border rounded-2xl py-3.5 pl-12 pr-11 focus:outline-none focus:ring-4 transition-all font-medium text-text-primary placeholder:text-text-disabled disabled:opacity-50 disabled:cursor-not-allowed ${errors.password
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

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-primary pl-1">Confirm Password</label>
                            <div className="relative group">
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${errors.confirmPassword ? 'text-danger-ui' : 'text-text-secondary group-focus-within:text-brand-primary'}`} />
                                <input
                                    {...register("confirmPassword")}
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Repeat your password"
                                    disabled={isLoading}
                                    className={`w-full bg-bg-surface border rounded-2xl py-3.5 pl-12 pr-11 focus:outline-none focus:ring-4 transition-all font-medium text-text-primary placeholder:text-text-disabled disabled:opacity-50 disabled:cursor-not-allowed ${errors.confirmPassword
                                        ? 'border-danger-ui focus:ring-danger-ui/10'
                                        : 'border-border-ui focus:border-brand-primary focus:ring-brand-primary/10'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-xs text-danger-ui font-medium pl-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div className="text-xs text-text-secondary px-1 font-medium italic">
                            By creating an account, you agree to our{" "}
                            <a href="#" className="text-brand-primary font-bold hover:underline transition-all">Terms</a> and{" "}
                            <a href="#" className="text-brand-primary font-bold hover:underline transition-all">Privacy Policy</a>.
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-extrabold py-4 rounded-2xl elevation-1 hover:elevation-2 transition-all mt-4 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                "Create Free Account"
                            )}
                        </button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border-ui" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-bg-base px-4 text-text-disabled font-bold tracking-widest">or join with</span>
                        </div>
                    </div>

                    <div className="w-full">
                        <button className="w-full flex items-center justify-center gap-3 bg-bg-surface border border-border-ui hover:bg-bg-subtle py-3.5 rounded-2xl transition-all active:scale-[0.98]">
                            <GoogleIcon />
                            <span className="text-sm font-bold text-text-primary">Join with Google</span>
                        </button>
                    </div>

                    <p className="text-center text-text-secondary font-medium pt-4">
                        Already have an account?{" "}
                        <Link to="/login" className="text-brand-primary font-extrabold hover:underline">
                            Sign In here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
