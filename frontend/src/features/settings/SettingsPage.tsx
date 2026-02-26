import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAmazonConfig } from "../../hooks/useAmazonConfig";
import { useTelegramConfig } from "../../hooks/useTelegramConfig";
import {
    ShoppingBag,
    Send,
    Save,
    RefreshCw,
    ShieldCheck,
    Package
} from "lucide-react";

const amazonSchema = z.object({
    accessKeyId: z.string().min(1, "Access Key ID is required"),
    secretAccessKey: z.string().min(1, "Secret Access Key is required"),
    affiliateTag: z.string().min(1, "Affiliate Tag is required"),
    region: z.string().min(1, "Region is required")
});

const telegramSchema = z.object({
    botToken: z.string().min(1, "Bot Token is required"),
    channelId: z.string().min(1, "Channel ID is required")
});

type AmazonFormValues = z.infer<typeof amazonSchema>;
type TelegramFormValues = z.infer<typeof telegramSchema>;

export default function SettingsPage() {
    const {
        data: amazonRes,
        updateConfig: updateAmazon,
        isUpdating: isAmazonUpdating
    } = useAmazonConfig();

    const {
        data: telegramRes,
        updateConfig: updateTelegram,
        testConnection: testTelegram,
        isUpdating: isTelegramUpdating,
        isTesting: isTelegramTesting
    } = useTelegramConfig();

    const amazonData = amazonRes?.data as AmazonFormValues | undefined;
    const telegramData = telegramRes?.data as TelegramFormValues | undefined;

    const {
        register: registerAmazon,
        handleSubmit: handleAmazonSubmit,
        reset: resetAmazon,
        formState: { errors: amazonErrors }
    } = useForm<AmazonFormValues>({
        resolver: zodResolver(amazonSchema),
        defaultValues: {
            accessKeyId: "",
            secretAccessKey: "",
            affiliateTag: "",
            region: "us-east-1"
        }
    });

    const {
        register: registerTelegram,
        handleSubmit: handleTelegramSubmit,
        reset: resetTelegram,
        formState: { errors: telegramErrors }
    } = useForm<TelegramFormValues>({
        resolver: zodResolver(telegramSchema),
        defaultValues: {
            botToken: "",
            channelId: ""
        }
    });

    useEffect(() => {
        if (amazonData?.accessKeyId) {
            resetAmazon({
                accessKeyId: amazonData.accessKeyId || "",
                secretAccessKey: amazonData.secretAccessKey || "",
                affiliateTag: amazonData.affiliateTag || "",
                region: amazonData.region || "us-east-1"
            });
        }
    }, [amazonData, resetAmazon]);

    useEffect(() => {
        if (telegramData?.botToken) {
            resetTelegram({
                botToken: telegramData.botToken || "",
                channelId: telegramData.channelId || ""
            });
        }
    }, [telegramData, resetTelegram]);

    const onAmazonSave = (data: AmazonFormValues) => {
        updateAmazon(data);
    };

    const onTelegramSave = (data: TelegramFormValues) => {
        updateTelegram(data);
    };

    return (
        <div className="space-y-8 max-w-5xl animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-text-secondary">Manage your integrations and application preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Amazon Settings */}
                <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-border-ui pb-4">
                        <div className="w-10 h-10 rounded-xl bg-warning-ui/10 flex items-center justify-center text-warning-ui">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Amazon PA-API</h2>
                            <p className="text-sm text-text-secondary">Configure product sourcing credentials</p>
                        </div>
                    </div>

                    <form onSubmit={handleAmazonSubmit(onAmazonSave)} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1 font-inter">
                                Access Key ID
                            </label>
                            <input
                                {...registerAmazon("accessKeyId")}
                                type="text"
                                className="input-field"
                                placeholder="AKIAIOSFODNN7EXAMPLE"
                            />
                            {amazonErrors.accessKeyId && (
                                <p className="text-xs text-danger-ui mt-1">{amazonErrors.accessKeyId.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1 font-inter">
                                Secret Access Key
                            </label>
                            <input
                                {...registerAmazon("secretAccessKey")}
                                type="password"
                                className="input-field"
                                placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                            />
                            {amazonErrors.secretAccessKey && (
                                <p className="text-xs text-danger-ui mt-1">{amazonErrors.secretAccessKey.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1 font-inter">
                                    Affiliate Tag
                                </label>
                                <input
                                    {...registerAmazon("affiliateTag")}
                                    type="text"
                                    className="input-field"
                                    placeholder="your-tag-20"
                                />
                                {amazonErrors.affiliateTag && (
                                    <p className="text-xs text-danger-ui mt-1">{amazonErrors.affiliateTag.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1 font-inter">
                                    Region
                                </label>
                                <select
                                    {...registerAmazon("region")}
                                    className="input-field appearance-none"
                                >
                                    <option value="us-east-1">US (United States)</option>
                                    <option value="eu-west-1">UK (United Kingdom)</option>
                                    <option value="ap-south-1">IN (India)</option>
                                </select>
                                {amazonErrors.region && (
                                    <p className="text-xs text-danger-ui mt-1">{amazonErrors.region.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="submit"
                                disabled={isAmazonUpdating}
                                className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 glow-brand disabled:opacity-50"
                            >
                                {isAmazonUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {isAmazonUpdating ? "Saving..." : "Save Settings"}
                            </button>
                            <button
                                type="button"
                                className="px-4 py-3 border border-border-ui rounded-xl text-text-secondary hover:bg-white/5 transition-colors flex items-center justify-center"
                                title="Test Connection"
                            >
                                <ShieldCheck className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Telegram Settings */}
                <div className="glass rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-3 border-b border-border-ui pb-4">
                        <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center text-accent-blue">
                            <Send className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Telegram Channel</h2>
                            <p className="text-sm text-text-secondary">Configure your publishing destination</p>
                        </div>
                    </div>

                    <form onSubmit={handleTelegramSubmit(onTelegramSave)} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1 font-inter">
                                Bot Token
                            </label>
                            <input
                                {...registerTelegram("botToken")}
                                type="password"
                                className="input-field"
                                placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                            />
                            {telegramErrors.botToken && (
                                <p className="text-xs text-danger-ui mt-1">{telegramErrors.botToken.message}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider pl-1 font-inter">
                                Channel Info
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium">@</span>
                                <input
                                    {...registerTelegram("channelId")}
                                    type="text"
                                    className="input-field pl-8"
                                    placeholder="yourchannel"
                                />
                            </div>
                            {telegramErrors.channelId && (
                                <p className="text-xs text-danger-ui mt-1">{telegramErrors.channelId.message}</p>
                            )}
                        </div>

                        <p className="text-xs text-text-secondary flex gap-2 p-3 bg-bg-subtle rounded-xl border border-white/5">
                            <Package className="w-4 h-4 text-brand-primary shrink-0" />
                            Make sure your bot is added as an administrator to your channel with permission to post messages.
                        </p>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="submit"
                                disabled={isTelegramUpdating}
                                className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 glow-brand disabled:opacity-50"
                            >
                                {isTelegramUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {isTelegramUpdating ? "Saving..." : "Save Settings"}
                            </button>
                            <button
                                type="button"
                                onClick={() => testTelegram()}
                                disabled={isTelegramTesting}
                                className="px-4 py-3 border border-border-ui rounded-xl text-text-secondary hover:bg-white/5 transition-colors flex items-center justify-center disabled:opacity-50"
                                title="Send Test Message"
                            >
                                {isTelegramTesting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
