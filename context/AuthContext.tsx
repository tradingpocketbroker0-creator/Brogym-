import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  age: number;
  gender: "male" | "female";
  weight: number;
  height: number;
  goalWeight?: number;
  avatarUri?: string;
  phone?: string;
  phoneVerified?: boolean;
  privacyPhysical?: "public" | "friends" | "private";
  privacyProfile?: "public" | "friends" | "private";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, "id">) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = "brogym_users";
const CURRENT_USER_KEY = "brogym_current_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  async function loadCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const usersData = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersData ? JSON.parse(usersData) : [];
      const found = users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password
      );
      if (found) {
        setUser(found);
        await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function register(
    userData: Omit<User, "id">
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const usersData = await AsyncStorage.getItem(USERS_KEY);
      const users: User[] = usersData ? JSON.parse(usersData) : [];
      const exists = users.some(
        (u) => u.email.toLowerCase() === userData.email.toLowerCase()
      );
      if (exists) {
        return { success: false, error: "El correo ya está registrado" };
      }
      const newUser: User = {
        ...userData,
        id:
          Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      users.push(newUser);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      setUser(newUser);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      return { success: true };
    } catch {
      return { success: false, error: "Error al registrar" };
    }
  }

  async function logout(): Promise<void> {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  }

  async function updateUser(data: Partial<User>): Promise<void> {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    const usersData = await AsyncStorage.getItem(USERS_KEY);
    const users: User[] = usersData ? JSON.parse(usersData) : [];
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = updated;
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
