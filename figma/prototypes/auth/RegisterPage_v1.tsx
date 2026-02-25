import { Rocket, Mail, Lock, Eye, EyeOff, User, Chrome, Github } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const { register } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        register(email, name || "New User");
    };

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

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-primary pl-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-brand-primary transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full bg-bg-surface border border-border-ui rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium text-text-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-primary pl-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-brand-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-bg-surface border border-border-ui rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium text-text-primary"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-primary pl-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-brand-primary transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Create a strong password"
                                    className="w-full bg-bg-surface border border-border-ui rounded-2xl py-3.5 pl-12 pr-11 focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium text-text-primary"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="text-xs text-text-secondary px-1 font-medium italic">
                            By creating an account, you agree to our{" "}
                            <a href="#" className="text-brand-primary font-bold hover:underline transition-all">Terms</a> and{" "}
                            <a href="#" className="text-brand-primary font-bold hover:underline transition-all">Privacy Policy</a>.
                        </div>

                        <button type="submit" className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-extrabold py-4 rounded-2xl elevation-1 hover:elevation-2 transition-all mt-4 active:scale-[0.98]">
                            Create Free Account
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

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-3 bg-bg-surface border border-border-ui hover:bg-bg-subtle py-3.5 rounded-2xl transition-all active:scale-[0.98]">
                            <Chrome className="w-5 h-5" />
                            <span className="text-sm font-bold">Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-3 bg-bg-surface border border-border-ui hover:bg-bg-subtle py-3.5 rounded-2xl transition-all active:scale-[0.98]">
                            <Github className="w-5 h-5" />
                            <span className="text-sm font-bold">Github</span>
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
