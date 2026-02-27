import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { authService, type User } from "../api/auth";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    }, [navigate]);

    // Initial session restoration
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const { user: userData } = await authService.getMe();
                    setUser(userData);
                    localStorage.setItem("user", JSON.stringify(userData));
                } catch (err) {
                    console.error("Session restore failed", err);
                    logout();
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [logout]);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { user: userData, token } = await authService.login(email, password);
            setUser(userData);
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(userData));
            navigate("/dashboard");
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const error = err as any;
            setError(error.response?.data?.message || "Invalid credentials. Please try again.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await authService.register(name, email, password);
            // No token returned — user must verify email before login
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const error = err as any;
            setError(error.response?.data?.message || "Registration failed. Email might already exist.");
            throw error;
        } finally {
            setIsLoading(false);
        }
    };



    const clearError = () => setError(null);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            error,
            login,
            register,
            logout,
            clearError
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
