import React, { createContext, useContext, useState, useCallback } from "react";
import { AUTH_CONFIG } from "@/config/auth.config";

interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
  lastLogin: string | null;
  failedAttempts: number;
  lockedUntil: number | null;
}

interface AuthContextType extends AuthState {
  login: (user: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    const saved = sessionStorage.getItem("auth");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return { isAuthenticated: false, user: null, lastLogin: null, failedAttempts: 0, lockedUntil: null };
  });

  const persist = (s: AuthState) => {
    sessionStorage.setItem("auth", JSON.stringify(s));
    setState(s);
  };

  const login = useCallback((user: string, pass: string) => {
    if (state.lockedUntil && Date.now() < state.lockedUntil) {
      const mins = Math.ceil((state.lockedUntil - Date.now()) / 60000);
      return { success: false, error: `Bloqueado. Tente novamente em ${mins} min.` };
    }

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      const newState: AuthState = {
        isAuthenticated: true,
        user: ADMIN_USER,
        lastLogin: new Date().toISOString(),
        failedAttempts: 0,
        lockedUntil: null,
      };
      persist(newState);
      return { success: true };
    }

    const attempts = state.failedAttempts + 1;
    const locked = attempts >= MAX_ATTEMPTS ? Date.now() + LOCK_DURATION : null;
    persist({ ...state, failedAttempts: attempts, lockedUntil: locked });
    return { success: false, error: "Credenciais inválidas." };
  }, [state]);

  const logout = useCallback(() => {
    sessionStorage.removeItem("auth");
    setState({ isAuthenticated: false, user: null, lastLogin: null, failedAttempts: 0, lockedUntil: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
