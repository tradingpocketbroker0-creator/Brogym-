import { Platform } from "react-native";

export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}

export async function scheduleWorkoutReminder(_hour: number, _minute: number): Promise<string | null> {
  if (Platform.OS !== "android" && Platform.OS !== "ios") return null;
  try {
    const mod = require("expo-notifications");
    const result = await mod.requestPermissionsAsync();
    const granted = result?.status === "granted" || result?.granted === true;
    if (!granted) return null;
    await mod.cancelAllScheduledNotificationsAsync();
    const id = await mod.scheduleNotificationAsync({
      content: { title: "💪 ¡Es hora de entrenar!", body: "No olvides tu sesión de hoy. ¡Tú puedes!", sound: true },
      trigger: { type: mod.SchedulableTriggerInputTypes?.DAILY ?? "daily", hour: _hour, minute: _minute },
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelWorkoutReminder(): Promise<void> {
  if (Platform.OS !== "android" && Platform.OS !== "ios") return;
  try {
    const mod = require("expo-notifications");
    await mod.cancelAllScheduledNotificationsAsync();
  } catch {}
}

export async function getScheduledReminders(): Promise<any[]> {
  if (Platform.OS !== "android" && Platform.OS !== "ios") return [];
  try {
    const mod = require("expo-notifications");
    return mod.getAllScheduledNotificationsAsync();
  } catch {
    return [];
  }
}
