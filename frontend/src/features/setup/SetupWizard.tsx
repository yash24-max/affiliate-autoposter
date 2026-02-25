import { useState } from "react";
import {
    ShoppingBag,
    Send,
    Filter,
    Clock,
    ArrowLeft,
    Check,
    Package,
    ShieldCheck,
    ChevronRight
} from "lucide-react";
import { cn } from "../../utils/cn";

const steps = [
    { id: 1, title: "Amazon", icon: ShoppingBag, desc: "Affiliate credentials" },
    { id: 2, title: "Telegram", icon: Send, desc: "Channel & bot setup" },
    { id: 3, title: "Filters", icon: Filter, desc: "Categories & quality" },
    { id: 4, title: "Schedule", icon: Clock, desc: "Time & frequency" },
];

export default function SetupWizard() {
    const [currentStep, setCurrentStep] = useState(1);

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="min-h-screen bg-bg-base text-text-primary p-6 md:p-12 flex flex-col items-center">
            <div className="w-full max-w-2xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Onboarding Wizard</h1>
                    <p className="text-text-secondary">Complete these 4 steps to start your automated empire.</p>
                </div>

                {/* Stepper */}
                <div className="relative flex justify-between items-center px-4">
                    {/* Progress Line */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-bg-subtle -translate-y-1/2 -z-10" />
                    <div
                        className="absolute top-1/2 left-0 h-0.5 bg-brand-primary -translate-y-1/2 -z-10 transition-all duration-500 transition-all ease-in-out"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step) => {
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-bg-base">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                        isActive ? "bg-brand-primary border-brand-primary text-white scale-110 glow-brand" :
                                            isCompleted ? "bg-brand-primary border-brand-primary text-white" :
                                                "bg-bg-subtle border-border-ui text-text-secondary"
                                    )}
                                >
                                    {isCompleted ? <Check className="w-5 h-5" /> : <span>{step.id}</span>}
                                </div>
                                <span className={cn(
                                    "text-[10px] uppercase tracking-widest font-bold",
                                    isActive ? "text-brand-primary" : "text-text-secondary"
                                )}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Form Card */}
                <div className="glass rounded-3xl p-8 space-y-8 min-h-[400px]">
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold">Amazon Affiliate Setup</h2>
                                <p className="text-sm text-text-secondary">Provide your Amazon PA API credentials and tracking ID.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text-secondary pl-1">Access Key ID</label>
                                    <input
                                        type="text"
                                        placeholder="AKIAIOSFODNN7EXAMPLE"
                                        className="w-full bg-bg-subtle border border-border-ui rounded-xl py-2.5 px-4 font-mono text-sm focus:outline-none focus:border-brand-primary transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text-secondary pl-1">Secret Access Key</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••••••••••••••••••"
                                        className="w-full bg-bg-subtle border border-border-ui rounded-xl py-2.5 px-4 font-mono text-sm focus:outline-none focus:border-brand-primary transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-text-secondary pl-1">Affiliate Tag</label>
                                        <input
                                            type="text"
                                            placeholder="mysite-20"
                                            className="w-full bg-bg-subtle border border-border-ui rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-primary transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-text-secondary pl-1">Region</label>
                                        <select className="w-full bg-bg-subtle border border-border-ui rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-primary transition-all appearance-none cursor-pointer">
                                            <option>US (amazon.com)</option>
                                            <option>UK (amazon.co.uk)</option>
                                            <option>DE (amazon.de)</option>
                                            <option>IN (amazon.in)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button className="flex items-center gap-2 text-accent-teal hover:underline text-sm font-medium">
                                    <ShieldCheck className="w-4 h-4" />
                                    Test Connection
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold">Telegram Channel Setup</h2>
                                <p className="text-sm text-text-secondary">Connect your Telegram bot to publish affiliate posts.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text-secondary pl-1">Bot Token</label>
                                    <input
                                        type="text"
                                        placeholder="1234567890:ABCdef..."
                                        className="w-full bg-bg-subtle border border-border-ui rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-primary transition-all"
                                    />
                                    <p className="text-[10px] text-text-secondary mt-1 ml-1 cursor-pointer hover:underline">How to get a bot token? @BotFather</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text-secondary pl-1">Channel ID</label>
                                    <input
                                        type="text"
                                        placeholder="@mychannel"
                                        className="w-full bg-bg-subtle border border-border-ui rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button className="flex items-center gap-2 text-accent-teal hover:underline text-sm font-medium">
                                    <Send className="w-4 h-4" />
                                    Send Test Message
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold">Choose Categories</h2>
                                <p className="text-sm text-text-secondary">Select which Amazon categories to source products from.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pb-4">
                                {[
                                    { label: "Electronics", icon: Package },
                                    { label: "Fashion", icon: ShoppingBag },
                                    { label: "Books", icon: Package },
                                    { label: "Home", icon: Package },
                                    { label: "Beauty", icon: Package },
                                    { label: "Sports", icon: Package },
                                ].map((cat) => (
                                    <button key={cat.label} className="flex items-center gap-3 p-3 rounded-xl bg-bg-subtle border border-border-ui hover:border-brand-primary transition-all group">
                                        <div className="w-8 h-8 rounded-lg bg-bg-base flex items-center justify-center text-text-secondary group-hover:text-brand-primary transition-colors">
                                            <cat.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">{cat.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4 border-t border-border-ui pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold">Only Prime Eligible</h4>
                                        <p className="text-xs text-text-secondary">Filter for products with Prime badge</p>
                                    </div>
                                    <div className="w-10 h-5 bg-bg-subtle rounded-full relative cursor-pointer border border-border-ui">
                                        <div className="absolute left-1 top-1 w-3 h-3 bg-text-secondary rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold">Configure Schedule</h2>
                                <p className="text-sm text-text-secondary">Set when and how often to auto-post.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text-secondary pl-1">Posting Frequency</label>
                                    <div className="flex items-center gap-4">
                                        <input type="range" className="flex-1 accent-brand-primary" min="1" max="10" />
                                        <span className="text-lg font-bold w-12 text-center bg-bg-subtle py-1 rounded-lg border border-border-ui">5</span>
                                    </div>
                                    <p className="text-xs text-text-secondary text-right">posts per day</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-text-secondary pl-1">Active Days</label>
                                    <div className="flex justify-between">
                                        {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                                            <button key={i} className={cn(
                                                "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all border",
                                                i < 5 ? "bg-brand-primary/10 border-brand-primary text-brand-primary" : "bg-bg-subtle border-border-ui text-text-secondary"
                                            )}>
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/20 mt-4">
                                <p className="text-xs text-center text-text-secondary italic">
                                    "Your schedule: 5 posts/day on Mon–Fri at 9 AM, 12 PM, 3 PM, 6 PM, 9 PM UTC"
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
                            currentStep === 1 ? "opacity-0 pointer-events-none" : "hover:bg-white/5 text-text-secondary"
                        )}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>

                    <button
                        onClick={nextStep}
                        className="flex items-center gap-2 px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl font-bold glow-brand transition-all"
                    >
                        {currentStep === steps.length ? "Finalize Setup" : "Next Step"}
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
