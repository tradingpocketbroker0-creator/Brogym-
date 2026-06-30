import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CategoryCard } from "@/components/CategoryCard";
import { WORKOUT_CATEGORIES } from "@/constants/data";
import { useColors } from "@/hooks/useColors";
import { useApp, WorkoutIntensity } from "@/context/AppContext";

const INTENSITIES: { key: WorkoutIntensity; label: string; icon: string; desc: string; color: string }[] = [
  { key: "suave",   label: "Suave",   icon: "leaf-outline",     desc: "Menos repeticiones · Más descanso",  color: "#30D158" },
  { key: "normal",  label: "Normal",  icon: "flash-outline",    desc: "Repeticiones estándar",              color: "#FF6B00" },
  { key: "intenso", label: "Intenso", icon: "flame-outline",    desc: "Más repeticiones · Menos descanso",  color: "#FF453A" },
];

export default function RutinasScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const { workoutIntensity, setWorkoutIntensity } = useApp();
  const [selected, setSelected] = React.useState(false);

  // If intensity was already stored and non-default, skip directly to categories
  // But always show picker first when entering tab fresh
  const [step, setStep] = React.useState<"pick" | "categories">("pick");

  async function handleIntensity(key: WorkoutIntensity) {
    await setWorkoutIntensity(key);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep("categories");
  }

  if (step === "pick") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: topPad + 20, paddingBottom: 100, paddingHorizontal: 20 }}
        >
          <Text style={[styles.title, { color: colors.foreground }]}>Rutinas</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            ¿Cómo quieres entrenar hoy?
          </Text>

          <View style={styles.intensityList}>
            {INTENSITIES.map((item) => {
              const active = workoutIntensity === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  onPress={() => handleIntensity(item.key)}
                  activeOpacity={0.85}
                  style={[
                    styles.intensityCard,
                    {
                      backgroundColor: active ? item.color + "18" : colors.card,
                      borderColor: active ? item.color : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.intensityIcon, { backgroundColor: item.color + "22" }]}>
                    <Ionicons name={item.icon as any} size={28} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.intensityLabel, { color: colors.foreground }]}>{item.label}</Text>
                    <Text style={[styles.intensityDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
                  </View>
                  {active && (
                    <Ionicons name="checkmark-circle" size={22} color={item.color} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {workoutIntensity && (
            <TouchableOpacity
              onPress={() => setStep("categories")}
              style={[styles.continueBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.88}
            >
              <Text style={styles.continueBtnText}>Continuar</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  }

  const currentIntensity = INTENSITIES.find(i => i.key === workoutIntensity)!;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 90 },
        ]}
      >
        <View style={styles.catHeader}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Rutinas</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Selecciona un grupo muscular</Text>
          </View>
          <TouchableOpacity
            onPress={() => setStep("pick")}
            style={[styles.intensityBadge, { backgroundColor: currentIntensity.color + "18", borderColor: currentIntensity.color + "55" }]}
          >
            <Ionicons name={currentIntensity.icon as any} size={14} color={currentIntensity.color} />
            <Text style={[styles.intensityBadgeText, { color: currentIntensity.color }]}>{currentIntensity.label}</Text>
          </TouchableOpacity>
        </View>

        {WORKOUT_CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            id={cat.id}
            name={cat.name}
            color={cat.color}
            exerciseCount={cat.exercises.length}
            onPress={() => router.push(`/categoria/${cat.id}` as any)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {},
  title: { fontSize: 28, fontFamily: "Inter_700Bold", paddingHorizontal: 16, marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", paddingHorizontal: 16, marginBottom: 20 },
  intensityList: { gap: 14, marginBottom: 28 },
  intensityCard: {
    flexDirection: "row", alignItems: "center", padding: 18, borderRadius: 16, borderWidth: 1.5, gap: 14,
  },
  intensityIcon: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
  intensityLabel: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 3 },
  intensityDesc: { fontSize: 13, fontFamily: "Inter_400Regular" },
  continueBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 52, borderRadius: 16,
  },
  continueBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  catHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingRight: 16, marginBottom: 4 },
  intensityBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, marginTop: 18 },
  intensityBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
