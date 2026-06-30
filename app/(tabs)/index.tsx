import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { getRandomQuote } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

const LOGO = require("@/assets/logo.png");

const QUOTE = getRandomQuote();

const QUICK_ITEMS = [
  { id: "cronometro", label: "Cronómetro", icon: "timer",        color: "#43A047", route: "/cronometro"       },
  { id: "imc",        label: "Calc. IMC",  icon: "fitness",      color: "#1E88E5", route: "/imc"              },
  { id: "logros",     label: "Logros",     icon: "trophy",       color: "#FFD700", route: "/logros"            },
  { id: "nutricion",  label: "Nutrición",  icon: "nutrition",    color: "#8E24AA", route: "/(tabs)/nutricion"  },
] as const;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getTotalWorkouts, getLatestWeight, getCurrentStreak, workoutLogs } = useApp();

  const latestWeight = getLatestWeight() ?? user?.weight ?? null;
  const recentLogs = useMemo(() => [...workoutLogs].reverse().slice(0, 3), [workoutLogs]);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
      >
        {/* ── HERO ─────────────────────────────────────────── */}
        <LinearGradient
          colors={[colors.primary + "33", colors.primary + "08", colors.background]}
          style={[styles.hero, { paddingTop: topPad + 16 }]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          {/* Logo centrado + perfil en esquina */}
          <View style={styles.headerRow}>
            <View style={styles.headerSide} />
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            <View style={styles.headerSide}>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/perfil")}
                activeOpacity={0.8}
                style={[styles.avatarBtn, { backgroundColor: colors.card, borderColor: colors.primary + "55" }]}
              >
                {user?.name ? (
                  <View style={[styles.avatarInner, { backgroundColor: colors.primary + "22" }]}>
                    <Text style={[styles.avatarLetter, { color: colors.primary }]}>
                      {user.name[0].toUpperCase()}
                    </Text>
                  </View>
                ) : (
                  <Ionicons name="person-outline" size={20} color={colors.foreground} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Greeting */}
          <Text style={[styles.greetHi, { color: colors.mutedForeground }]}>
            ¡Buenas, {user?.name?.split(" ")[0] ?? "Atleta"}! 👋
          </Text>

          {/* Quote strip */}
          <View style={[styles.quoteStrip, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
            <Ionicons name="flash" size={14} color={colors.primary} />
            <Text style={[styles.quoteText, { color: colors.foreground }]} numberOfLines={2}>{QUOTE}</Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* ── STATS ──────────────────────────────────────── */}
          <Text style={[styles.section, { color: colors.mutedForeground }]}>TUS ESTADÍSTICAS</Text>
          <View style={styles.statsRow}>
            {[
              { label: "Entrenamientos", value: String(getTotalWorkouts()), icon: "barbell",      color: "#E53935" },
              { label: "Racha",          value: `${getCurrentStreak()}d`,   icon: "flame",        color: "#FB8C00" },
              { label: "Peso",           value: latestWeight ? `${latestWeight}` : "--", unit: latestWeight ? "kg" : "", icon: "scale", color: "#1E88E5" },
            ].map((s, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: colors.card, borderColor: s.color + "44" }]}>
                <LinearGradient
                  colors={[s.color + "22", "transparent"]}
                  style={styles.statGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.statIcon, { backgroundColor: s.color + "22" }]}>
                    <Ionicons name={s.icon as any} size={18} color={s.color} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* ── CTA ENTRENAR ──────────────────────────────── */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              router.push("/(tabs)/rutinas");
            }}
            activeOpacity={0.88}
            style={styles.ctaWrap}
          >
            <LinearGradient
              colors={["#FF6B00", "#E53935"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaBtn}
            >
              <View style={styles.ctaLeft}>
                <Text style={styles.ctaTitle}>EMPEZAR ENTRENAMIENTO</Text>
                <Text style={styles.ctaSub}>Elige tu rutina y dale 🔥</Text>
              </View>
              <View style={styles.ctaIcon}>
                <Ionicons name="play" size={22} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* ── QUICK ACCESS ──────────────────────────────── */}
          <Text style={[styles.section, { color: colors.mutedForeground }]}>ACCESO RÁPIDO</Text>
          <View style={styles.quickGrid}>
            {QUICK_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(item.route as any);
                }}
                activeOpacity={0.8}
                style={[styles.quickCard, { backgroundColor: colors.card, borderColor: item.color + "33" }]}
              >
                <LinearGradient
                  colors={[item.color + "22", "transparent"]}
                  style={styles.quickGrad}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.quickIcon, { backgroundColor: item.color + "25" }]}>
                    <Ionicons name={item.icon as any} size={28} color={item.color} />
                  </View>
                  <Text style={[styles.quickLabel, { color: colors.foreground }]}>{item.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── RECENT WORKOUTS ───────────────────────────── */}
          {recentLogs.length > 0 && (
            <>
              <Text style={[styles.section, { color: colors.mutedForeground }]}>ÚLTIMOS ENTRENOS</Text>
              <View style={styles.logList}>
                {recentLogs.map((log, i) => (
                  <View
                    key={log.id}
                    style={[
                      styles.logCard,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      i > 0 && { marginTop: 8 },
                    ]}
                  >
                    <LinearGradient
                      colors={[colors.primary + "22", "transparent"]}
                      style={styles.logLeft}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="barbell" size={20} color={colors.primary} />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.logName, { color: colors.foreground }]}>{log.categoryName}</Text>
                      <Text style={[styles.logDate, { color: colors.mutedForeground }]}>
                        {new Date(log.date).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                        {"  ·  "}{log.durationMinutes} min
                      </Text>
                    </View>
                    <View style={[styles.logCheck, { backgroundColor: "#30D15822" }]}>
                      <Ionicons name="checkmark" size={16} color="#30D158" />
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Hero */
  hero: { paddingHorizontal: 16, paddingBottom: 24 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  headerSide: { width: 44, alignItems: "flex-end" },
  logo: { width: 160, height: 56 },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarInner: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarLetter: { fontSize: 18, fontFamily: "Inter_700Bold" },
  greetHi: { fontSize: 14, fontFamily: "Inter_500Medium", textAlign: "center", marginBottom: 12 },
  quoteStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  quoteText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, fontStyle: "italic" },

  /* Body */
  body: { paddingHorizontal: 16 },
  section: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5, marginTop: 24, marginBottom: 12 },

  /* Stats */
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  statGrad: { alignItems: "center", padding: 14, gap: 6 },
  statIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "center" },

  /* CTA */
  ctaWrap: { marginTop: 24, borderRadius: 18, overflow: "hidden", shadowColor: "#E53935", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  ctaBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 20, paddingHorizontal: 22 },
  ctaLeft: { flex: 1 },
  ctaTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.5 },
  ctaSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)", marginTop: 3 },
  ctaIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },

  /* Quick access */
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quickCard: { width: "47%", flexGrow: 1, borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  quickGrad: { padding: 18, gap: 10, minHeight: 110, justifyContent: "center" },
  quickIcon: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  /* Recent logs */
  logList: {},
  logCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    gap: 14,
    paddingRight: 14,
    paddingVertical: 4,
  },
  logLeft: { width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  logName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  logDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  logCheck: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
});
