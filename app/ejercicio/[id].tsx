import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { getCategoryById, getExerciseById } from "@/constants/data";
import { useColors } from "@/hooks/useColors";
import ExerciseVideoModal from "@/components/ExerciseVideoModal";

export default function EjercicioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addWorkoutLog } = useApp();
  const [showVideo, setShowVideo] = useState(false);

  const exercise = getExerciseById(id ?? "");
  const category = exercise ? getCategoryById(exercise.categoryId) : null;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!exercise || !category) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: colors.mutedForeground }}>Ejercicio no encontrado</Text>
      </View>
    );
  }

  async function handleStart() {
    Alert.alert("Registrar Entrenamiento", `¿Registrar ${exercise!.name} como completado?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Registrar",
        onPress: async () => {
          await addWorkoutLog({ categoryId: category!.id, categoryName: category!.name, durationMinutes: 30 });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.back();
        },
      },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 100 }]}
      >
        <LinearGradient
          colors={[category.color + "33", colors.background]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <View style={[styles.heroIcon, { backgroundColor: category.color + "22", borderColor: category.color + "55" }]}>
            <Ionicons name="barbell" size={56} color={category.color} />
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={[styles.categoryBadge, { backgroundColor: category.color + "22", borderColor: category.color + "44" }]}>
            <Text style={[styles.categoryLabel, { color: category.color }]}>{category.name}</Text>
          </View>
          <Text style={[styles.exerciseName, { color: colors.foreground }]}>{exercise.name}</Text>

          {/* Botón de video */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowVideo(true);
            }}
            activeOpacity={0.85}
            style={[styles.videoBtn, { backgroundColor: "#E5393522", borderColor: "#E5393555" }]}
          >
            <View style={styles.videoBtnLeft}>
              <View style={styles.videoBtnPlayCircle}>
                <Ionicons name="play" size={14} color="#fff" />
              </View>
              <View>
                <Text style={styles.videoBtnTitle}>Ver cómo se hace</Text>
                <Text style={styles.videoBtnSub}>Tutorial · Técnica correcta</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#E53935" />
          </TouchableOpacity>

          <View style={styles.specs}>
            {[
              { label: "Series", value: String(exercise.sets), icon: "layers-outline", color: "#E53935" },
              { label: "Repeticiones", value: exercise.reps, icon: "repeat-outline", color: "#1E88E5" },
              { label: "Descanso", value: `${exercise.restSeconds}s`, icon: "timer-outline", color: "#43A047" },
            ].map((s) => (
              <View
                key={s.label}
                style={[styles.specCard, { backgroundColor: colors.card, borderColor: s.color + "33" }]}
              >
                <View style={[styles.specIcon, { backgroundColor: s.color + "22" }]}>
                  <Ionicons name={s.icon as any} size={20} color={s.color} />
                </View>
                <Text style={[styles.specValue, { color: colors.foreground }]}>{s.value}</Text>
                <Text style={[styles.specLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.descCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.descTitle, { color: colors.foreground }]}>Descripción</Text>
            <Text style={[styles.descText, { color: colors.secondaryForeground }]}>{exercise.description}</Text>
          </View>

          <View style={[styles.descCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.musclesHeader}>
              <View style={[styles.musclesIcon, { backgroundColor: "#E53935" + "22" }]}>
                <Ionicons name="body" size={18} color="#E53935" />
              </View>
              <Text style={[styles.descTitle, { color: colors.foreground }]}>Músculos Trabajados</Text>
            </View>
            <Text style={[styles.descText, { color: colors.secondaryForeground }]}>{exercise.muscles}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: bottomPad + 16, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: category.color, borderRadius: colors.radius }]}
          onPress={handleStart}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text style={styles.startBtnText}>Marcar como completado</Text>
        </TouchableOpacity>
      </View>

      <ExerciseVideoModal
        visible={showVideo}
        onClose={() => setShowVideo(false)}
        youtubeId={exercise.youtubeId}
        exerciseName={exercise.name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {},
  hero: { alignItems: "center", paddingVertical: 40 },
  heroIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  content: { paddingHorizontal: 16, gap: 14 },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  exerciseName: { fontSize: 26, fontFamily: "Inter_700Bold" },
  videoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  videoBtnLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  videoBtnPlayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
  },
  videoBtnTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#E53935" },
  videoBtnSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#E53935AA", marginTop: 2 },
  specs: { flexDirection: "row", gap: 10 },
  specCard: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  specIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  specValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  specLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  descCard: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 10 },
  descTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  descText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  musclesHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  musclesIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
  },
  startBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
