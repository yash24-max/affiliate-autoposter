import { createContext, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, name?: string) => void;
    register: (email: string, name: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem("user");
        return saved ? JSON.parse(saved) : null;
    });

    const navigate = useNavigate();

    const login = (email: string, name: string = "John Doe") => {
        const newUser = { id: "1", name, email };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        navigate("/dashboard");
    };

    const register = (email: string, name: string) => {
        const newUser = { id: "1", name, email };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        navigate("/setup"); // Go to wizard after signup
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
