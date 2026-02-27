import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { authService } from "../../api/auth";

type Status = "loading" | "success" | "error";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<Status>("loading");
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (!token) return;
        authService.verifyEmail(token)
            .then(() => setStatus("success"))
            .catch((err) => {
                setErrorMsg(err?.response?.data?.message ?? "Invalid or expired verification link.");
                setStatus("error");
            });
    }, [token]);

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-bg-base">
                <div className="glass w-full max-w-md p-8 rounded-3xl text-center">
                    <h1 className="text-xl font-bold text-danger-ui">Invalid Link</h1>
                    <p className="text-text-secondary mt-2 mb-6">
                        This verification link is invalid or missing a token.
                    </p>
                    <Link to="/register" className="text-brand-primary hover:underline font-medium">
                        Back to Register
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-bg-base relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent-blue/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="glass w-full max-w-md p-8 rounded-3xl z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 text-center">
                {status === "loading" && (
                    <>
                        <Loader2 className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-6" />
                        <h1 className="text-2xl font-bold mb-2 tracking-tight">Verifying your email…</h1>
                        <p className="text-text-secondary text-sm">Please wait a moment.</p>
                    </>
                )}
                {status === "success" && (
                    <>
                        <CheckCircle className="w-12 h-12 text-success-ui mx-auto mb-6" />
                        <h1 className="text-2xl font-bold mb-2 tracking-tight">Email Verified!</h1>
                        <p className="text-text-secondary text-sm mb-8">
                            Your account is now active. You can sign in.
                        </p>
                        <Link
                            to="/login"
                            className="w-full block bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3.5 rounded-xl transition-all glow-brand"
                        >
                            Go to Login
                        </Link>
                    </>
                )}
                {status === "error" && (
                    <>
                        <XCircle className="w-12 h-12 text-danger-ui mx-auto mb-6" />
                        <h1 className="text-2xl font-bold mb-2 tracking-tight">Verification Failed</h1>
                        <p className="text-text-secondary text-sm mb-8">{errorMsg}</p>
                        <Link to="/register" className="text-brand-primary hover:underline font-medium">
                            Back to Register
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
