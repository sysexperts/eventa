import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, type User } from "../lib/api";

type AuthModal = { open: boolean; mode: "login" | "register" };

type AuthState = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; website?: string }) => Promise<void>;
  logout: () => Promise<void>;
  modal: AuthModal;
  openLogin: () => void;
  openRegister: () => void;
  closeModal: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<AuthModal>({ open: false, mode: "login" });

  function openLogin() { setModal({ open: true, mode: "login" }); }
  function openRegister() { setModal({ open: true, mode: "register" }); }
  function closeModal() { setModal((m) => ({ ...m, open: false })); }

  async function refresh() {
    try {
      const res = await api.me.get();
      setUser(res.user);
    } catch {
      setUser(null);
    }
  }

  async function login(email: string, password: string) {
    const res = await api.auth.login({ email, password });
    setUser(res.user);
  }

  async function register(data: { email: string; password: string; name: string; website?: string }) {
    const res = await api.auth.register(data);
    setUser(res.user);
  }

  async function logout() {
    await api.auth.logout();
    setUser(null);
  }

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  const value = useMemo(
    () => ({ user, loading, refresh, login, register, logout, modal, openLogin, openRegister, closeModal }),
    [user, loading, modal]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
