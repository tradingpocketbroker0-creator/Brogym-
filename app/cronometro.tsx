import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const QUICK_TIMERS = [30, 60, 90, 120];

export default function CronometroScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [mode, setMode] = useState<"stopwatch" | "countdown">("stopwatch");
  const [elapsed, setElapsed] = useState(0);
  const [countdown, setCountdown] = useState(60);
  const [countdownTarget, setCountdownTarget] = useState(60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        if (mode === "stopwatch") {
          setElapsed((prev) => prev + 1);
        } else {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(intervalRef.current!);
              setRunning(false);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, mode]);

  function handleStartPause() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRunning((prev) => !prev);
  }

  function handleReset() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRunning(false);
    if (mode === "stopwatch") {
      setElapsed(0);
    } else {
      setCountdown(countdownTarget);
    }
  }

  function handleQuickTimer(seconds: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMode("countdown");
    setCountdownTarget(seconds);
    setCountdown(seconds);
    setRunning(false);
  }

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  const displayTime = mode === "stopwatch" ? elapsed : countdown;
  const isFinished = mode === "countdown" && countdown === 0;
  const primaryColor = isFinished ? "#43A047" : colors.primary;
  const progress = mode === "countdown" ? (countdown / countdownTarget) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 24 }]}
      >
        <View style={styles.modeSelector}>
          {(["stopwatch", "countdown"] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.modeBtn,
                {
                  backgroundColor: mode === m ? colors.primary : colors.card,
                  borderColor: mode === m ? colors.primary : colors.border,
                  borderRadius: colors.radius,
                },
              ]}
              onPress={() => {
                setMode(m);
                setRunning(false);
                setElapsed(0);
                setCountdown(countdownTarget);
              }}
              activeOpacity={0.8}
            >
              <Ionicons
                name={m === "stopwatch" ? "timer-outline" : "hourglass-outline"}
                size={16}
                color={mode === m ? "#fff" : colors.mutedForeground}
              />
              <Text style={[styles.modeBtnText, { color: mode === m ? "#fff" : colors.mutedForeground }]}>
                {m === "stopwatch" ? "Cronómetro" : "Temporizador"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.clockSection}>
          <LinearGradient
            colors={[primaryColor + "22", primaryColor + "08"]}
            style={[styles.clockCircle, { borderColor: primaryColor + "55" }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isFinished ? (
              <View style={styles.finishedContent}>
                <Ionicons name="checkmark-circle" size={48} color="#43A047" />
                <Text style={[styles.finishedText, { color: "#43A047" }]}>Completado</Text>
              </View>
            ) : (
              <>
                <Text style={[styles.clockText, { color: colors.foreground }]}>
                  {formatTime(displayTime)}
                </Text>
                {mode === "countdown" && (
                  <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { backgroundColor: primaryColor, width: `${progress * 100}%` },
                      ]}
                    />
                  </View>
                )}
              </>
            )}
          </LinearGradient>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlBtn, styles.resetBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleReset}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, styles.mainBtn, { backgroundColor: primaryColor }]}
            onPress={handleStartPause}
            activeOpacity={0.85}
          >
            <Ionicons
              name={running ? "pause" : "play"}
              size={32}
              color="#fff"
            />
          </TouchableOpacity>

          <View style={[styles.controlBtn, { backgroundColor: "transparent" }]} />
        </View>

        <Text style={[styles.quickLabel, { color: colors.mutedForeground }]}>TEMPORIZADORES RÁPIDOS</Text>
        <View style={styles.quickTimers}>
          {QUICK_TIMERS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.quickBtn,
                {
                  backgroundColor: mode === "countdown" && countdownTarget === s && !running
                    ? colors.primary
                    : colors.card,
                  borderColor: mode === "countdown" && countdownTarget === s
                    ? colors.primary
                    : colors.border,
                  borderRadius: colors.radius,
                },
              ]}
              onPress={() => handleQuickTimer(s)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.quickBtnText,
                  {
                    color: mode === "countdown" && countdownTarget === s && !running
                      ? "#fff"
                      : colors.foreground,
                  },
                ]}
              >
                {s < 60 ? `${s}s` : `${s / 60}min`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 20 },
  modeSelector: { flexDirection: "row", gap: 12, marginBottom: 32 },
  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
    borderWidth: 1,
  },
  modeBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  clockSection: { alignItems: "center", marginBottom: 40 },
  clockCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20,
  },
  clockText: { fontSize: 48, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  progressBar: { width: "70%", height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  finishedContent: { alignItems: "center", gap: 8 },
  finishedText: { fontSize: 20, fontFamily: "Inter_700Bold" },
  controls: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 24, marginBottom: 40 },
  controlBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtn: { borderWidth: 1 },
  mainBtn: { width: 80, height: 80, borderRadius: 40 },
  quickLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5, marginBottom: 14, textAlign: "center" },
  quickTimers: { flexDirection: "row", gap: 12 },
  quickBtn: {
    flex: 1,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  quickBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
