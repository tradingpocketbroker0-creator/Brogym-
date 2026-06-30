import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ACHIEVEMENT_DEFS, AchievementDef } from "@/constants/data";
import { useAuth } from "@/context/AuthContext";

export interface WorkoutLog {
  id: string;
  date: string;
  categoryId: string;
  categoryName: string;
  durationMinutes: number;
}

export interface ProgressEntry {
  id: string;
  date: string;
  weight: number;
  arms?: number;
  chest?: number;
  waist?: number;
  legs?: number;
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: string;
}

export type WorkoutIntensity = "suave" | "normal" | "intenso";

interface AppContextType {
  workoutLogs: WorkoutLog[];
  progressEntries: ProgressEntry[];
  unlockedAchievements: UnlockedAchievement[];
  workoutIntensity: WorkoutIntensity;
  setWorkoutIntensity: (v: WorkoutIntensity) => Promise<void>;
  addWorkoutLog: (log: Omit<WorkoutLog, "id" | "date">) => Promise<void>;
  addProgressEntry: (entry: Omit<ProgressEntry, "id" | "date">) => Promise<void>;
  getTotalWorkouts: () => number;
  getLatestWeight: () => number | null;
  getCurrentStreak: () => number;
  isAchievementUnlocked: (id: string) => boolean;
  getAchievementProgress: (def: AchievementDef) => number;
}

const AppContext = createContext<AppContextType | null>(null);

const WORKOUT_LOGS_KEY = "brogym_workout_logs";
const PROGRESS_KEY = "brogym_progress";
const ACHIEVEMENTS_KEY = "brogym_achievements";
const INTENSITY_KEY = "brogym_intensity";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [workoutIntensity, setWorkoutIntensityState] = useState<WorkoutIntensity>("normal");

  useEffect(() => {
    AsyncStorage.getItem(INTENSITY_KEY).then((v) => {
      if (v === "suave" || v === "normal" || v === "intenso") setWorkoutIntensityState(v);
    });
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setWorkoutLogs([]);
      setProgressEntries([]);
      setUnlockedAchievements([]);
    }
  }, [user?.id]);

  function userKey(key: string) {
    return `${key}_${user?.id ?? "guest"}`;
  }

  async function loadData() {
    try {
      const [logsRaw, progressRaw, achievementsRaw] = await Promise.all([
        AsyncStorage.getItem(userKey(WORKOUT_LOGS_KEY)),
        AsyncStorage.getItem(userKey(PROGRESS_KEY)),
        AsyncStorage.getItem(userKey(ACHIEVEMENTS_KEY)),
      ]);
      setWorkoutLogs(logsRaw ? JSON.parse(logsRaw) : []);
      setProgressEntries(progressRaw ? JSON.parse(progressRaw) : []);
      setUnlockedAchievements(achievementsRaw ? JSON.parse(achievementsRaw) : []);
    } catch {
      // ignore
    }
  }

  async function checkAndUnlockAchievements(
    logs: WorkoutLog[],
    progress: ProgressEntry[],
    currentUnlocked: UnlockedAchievement[]
  ) {
    const newUnlocked = [...currentUnlocked];
    let changed = false;

    for (const def of ACHIEVEMENT_DEFS) {
      const alreadyUnlocked = newUnlocked.some((u) => u.id === def.id);
      if (alreadyUnlocked) continue;

      let shouldUnlock = false;

      if (def.type === "workouts") {
        shouldUnlock = logs.length >= def.targetCount;
      } else if (def.type === "streak") {
        shouldUnlock = calculateStreak(logs) >= def.targetCount;
      } else if (def.type === "weight") {
        shouldUnlock = progress.length >= def.targetCount;
      } else if (def.type === "special" && def.id === "meta_alcanzada") {
        if (user?.goalWeight && progress.length > 0) {
          const latest = progress[progress.length - 1].weight;
          shouldUnlock = Math.abs(latest - user.goalWeight) <= 1;
        }
      }

      if (shouldUnlock) {
        newUnlocked.push({ id: def.id, unlockedAt: new Date().toISOString() });
        changed = true;
      }
    }

    if (changed) {
      setUnlockedAchievements(newUnlocked);
      await AsyncStorage.setItem(
        userKey(ACHIEVEMENTS_KEY),
        JSON.stringify(newUnlocked)
      );
    }
  }

  function calculateStreak(logs: WorkoutLog[]): number {
    if (logs.length === 0) return 0;
    const dates = [...new Set(logs.map((l) => l.date.split("T")[0]))].sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      const expectedStr = expected.toISOString().split("T")[0];
      if (dates[i] === expectedStr) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  async function addWorkoutLog(log: Omit<WorkoutLog, "id" | "date">) {
    const newLog: WorkoutLog = {
      ...log,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    const updated = [...workoutLogs, newLog];
    setWorkoutLogs(updated);
    await AsyncStorage.setItem(userKey(WORKOUT_LOGS_KEY), JSON.stringify(updated));
    await checkAndUnlockAchievements(updated, progressEntries, unlockedAchievements);
  }

  async function addProgressEntry(entry: Omit<ProgressEntry, "id" | "date">) {
    const newEntry: ProgressEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    const updated = [...progressEntries, newEntry];
    setProgressEntries(updated);
    await AsyncStorage.setItem(userKey(PROGRESS_KEY), JSON.stringify(updated));
    await checkAndUnlockAchievements(workoutLogs, updated, unlockedAchievements);
  }

  function getTotalWorkouts() {
    return workoutLogs.length;
  }

  function getLatestWeight(): number | null {
    if (progressEntries.length === 0) return null;
    return progressEntries[progressEntries.length - 1].weight;
  }

  function getCurrentStreak(): number {
    return calculateStreak(workoutLogs);
  }

  function isAchievementUnlocked(id: string): boolean {
    return unlockedAchievements.some((u) => u.id === id);
  }

  function getAchievementProgress(def: AchievementDef): number {
    if (def.type === "workouts") {
      return Math.min(workoutLogs.length / def.targetCount, 1);
    } else if (def.type === "streak") {
      return Math.min(getCurrentStreak() / def.targetCount, 1);
    } else if (def.type === "weight") {
      return Math.min(progressEntries.length / def.targetCount, 1);
    }
    return isAchievementUnlocked(def.id) ? 1 : 0;
  }

  async function setWorkoutIntensity(v: WorkoutIntensity) {
    setWorkoutIntensityState(v);
    await AsyncStorage.setItem(INTENSITY_KEY, v);
  }

  return (
    <AppContext.Provider
      value={{
        workoutLogs,
        progressEntries,
        unlockedAchievements,
        workoutIntensity,
        setWorkoutIntensity,
        addWorkoutLog,
        addProgressEntry,
        getTotalWorkouts,
        getLatestWeight,
        getCurrentStreak,
        isAchievementUnlocked,
        getAchievementProgress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
