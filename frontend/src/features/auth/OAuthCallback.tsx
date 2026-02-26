import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const navigate = useNavigate();

    useEffect(() => {
        if (error) {
            toast.error(`Authentication failed: ${error}`);
            navigate("/login");
            return;
        }

        if (token) {
            // Save token to localStorage (handled realistically by AuthProvider layer, but mapped here)
            localStorage.setItem("authToken", token);
            toast.success("Successfully logged in with Google");
            navigate("/dashboard");
        } else {
            toast.error("No authentication token received");
            navigate("/login");
        }
    }, [token, error, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-base">
            <div className="text-center space-y-4">
                <RefreshCw className="w-10 h-10 animate-spin text-brand-primary mx-auto" />
                <h2 className="text-xl font-bold">Authenticating...</h2>
                <p className="text-text-secondary">Please wait while we complete your login.</p>
            </div>
        </div>
    );
}
