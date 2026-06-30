import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, saveToken, clearToken } from "@/services/api";

interface SocialUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  gym?: string;
}

interface SocialContextType {
  socialUser: SocialUser | null;
  socialToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; bio?: string; gym?: string; avatar_url?: string }) => Promise<void>;
}

const SocialContext = createContext<SocialContextType | null>(null);

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const [socialUser, setSocialUser] = useState<SocialUser | null>(null);
  const [socialToken, setSocialToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("social_token").then(async (token) => {
      if (token) {
        setSocialToken(token);
        try {
          const user = await api.getMe();
          setSocialUser(user);
        } catch {
          await clearToken();
          setSocialToken(null);
        }
      }
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    await saveToken(data.token);
    setSocialToken(data.token);
    setSocialUser(data.user);
  }, []);

  const register = useCallback(async (body: { name: string; email: string; password: string }) => {
    const data = await api.register(body);
    await saveToken(data.token);
    setSocialToken(data.token);
    setSocialUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setSocialToken(null);
    setSocialUser(null);
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; bio?: string; gym?: string; avatar_url?: string }) => {
    const user = await api.updateMe(data);
    setSocialUser(user);
  }, []);

  return (
    <SocialContext.Provider value={{ socialUser, socialToken, loading, login, register, logout, updateProfile }}>
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used within SocialProvider");
  return ctx;
}
