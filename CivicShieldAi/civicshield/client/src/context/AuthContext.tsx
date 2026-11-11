import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { AuthAPI } from "../services/api";
import { User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: Record<string, string>) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("csai_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem("csai_user");
    if (cached) setUser(JSON.parse(cached));

    if (token) {
      AuthAPI.me()
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem("csai_user", JSON.stringify(res.data.user));
        })
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem("csai_token");
          localStorage.removeItem("csai_user");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    const res = await AuthAPI.login(email, password);
    const { token: t, user: u } = res.data;
    localStorage.setItem("csai_token", t);
    localStorage.setItem("csai_user", JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u as User;
  }

  async function register(payload: Record<string, string>) {
    const res = await AuthAPI.register(payload);
    const { token: t, user: u } = res.data;
    localStorage.setItem("csai_token", t);
    localStorage.setItem("csai_user", JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u as User;
  }

  function logout() {
    localStorage.removeItem("csai_token");
    localStorage.removeItem("csai_user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
