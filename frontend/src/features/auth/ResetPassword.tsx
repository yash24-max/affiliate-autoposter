import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsSubmitting(true);
        // Simulate API call using the `token` and `password`
        console.log("Resetting password for token:", token);
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success("Password reset successfully. You can now log in.");
            navigate("/login");
        }, 1500);
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-bg-base">
                <div className="glass w-full max-w-md p-8 rounded-3xl text-center">
                    <h1 className="text-xl font-bold text-danger-ui">Invalid Link</h1>
                    <p className="text-text-secondary mt-2 mb-6">This password reset link is invalid or has expired.</p>
                    <Link to="/forgot-password" className="text-brand-primary hover:underline font-medium">
                        Request a new link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-bg-base relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent-blue/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="glass w-full max-w-md p-8 rounded-3xl z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-bg-subtle border border-border-ui rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Lock className="w-6 h-6 text-brand-primary" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2 tracking-tight">Create New Password</h1>
                    <p className="text-text-secondary text-sm">
                        Please enter your new password below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1 font-inter">
                            New Password
                        </label>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                                required
                                className="input-field pl-11 pr-11 shadow-sm group-hover:border-white/20 transition-colors"
                            />
                            <Lock className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-brand-primary" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors p-1"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1 font-inter">
                            Confirm Password
                        </label>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={8}
                                required
                                className="input-field pl-11 pr-11 shadow-sm group-hover:border-white/20 transition-colors"
                            />
                            <Lock className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-brand-primary" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !password || !confirmPassword}
                        className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 glow-brand disabled:opacity-50 mt-2"
                    >
                        {isSubmitting ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            "Reset Password"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
