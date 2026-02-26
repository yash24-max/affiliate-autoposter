import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-bg-base relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent-blue/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="glass w-full max-w-md p-8 rounded-3xl z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-bg-subtle border border-border-ui rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-primary">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold mb-2 tracking-tight">Recover Password</h1>
                    <p className="text-text-secondary text-sm">
                        Enter your email address to receive password reset instructions.
                    </p>
                </div>

                {isSuccess ? (
                    <div className="glass bg-success-ui/10 border border-success-ui/20 p-6 rounded-2xl text-center space-y-4 mb-6">
                        <div className="w-12 h-12 bg-success-ui/20 rounded-full flex items-center justify-center mx-auto">
                            <Mail className="w-6 h-6 text-success-ui" />
                        </div>
                        <div>
                            <h3 className="font-bold text-success-ui mb-1">Check your inbox</h3>
                            <p className="text-sm text-text-secondary">
                                We've sent password reset instructions to <b>{email}</b>.
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1 font-inter">
                                Email Address
                            </label>
                            <div className="relative group">
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="input-field pl-11 shadow-sm group-hover:border-white/20 transition-colors"
                                    placeholder="you@example.com"
                                />
                                <Mail className="w-5 h-5 text-text-secondary absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-brand-primary" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !email}
                            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 glow-brand disabled:opacity-50 mt-2"
                        >
                            {isSubmitting ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>
                    </form>
                )}

                <div className="text-center mt-8 pt-6 border-t border-border-ui">
                    <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-white transition-colors flex items-center justify-center gap-2 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
