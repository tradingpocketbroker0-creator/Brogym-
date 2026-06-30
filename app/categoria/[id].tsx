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
import { getCategoryById } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

export default function CategoriaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addWorkoutLog } = useApp();
  const [logging, setLogging] = useState(false);

  const category = getCategoryById(id ?? "");
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!category) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={[styles.notFound, { color: colors.mutedForeground }]}>Categoría no encontrada</Text>
      </View>
    );
  }

  async function handleStartWorkout() {
    const cat = category!;
    Alert.alert(
      "Iniciar Entrenamiento",
      `¿Iniciar el entrenamiento de ${cat.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Iniciar",
          onPress: async () => {
            setLogging(true);
            await addWorkoutLog({
              categoryId: cat.id,
              categoryName: cat.name,
              durationMinutes: 45,
            });
            setLogging(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Entrenamiento registrado", `El entrenamiento de ${cat.name} ha sido registrado.`);
          },
        },
      ]
    );
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
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.heroIcon, { backgroundColor: category.color + "22", borderColor: category.color + "55" }]}>
            <Ionicons name="fitness" size={48} color={category.color} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>{category.name}</Text>
          <Text style={[styles.heroCount, { color: category.color }]}>
            {category.exercises.length} ejercicios
          </Text>
        </LinearGradient>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>EJERCICIOS</Text>
        {category.exercises.map((exercise, index) => (
          <TouchableOpacity
            key={exercise.id}
            style={[styles.exerciseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/ejercicio/${exercise.id}` as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.exerciseNumber, { backgroundColor: category.color + "22" }]}>
              <Text style={[styles.exerciseNumberText, { color: category.color }]}>{index + 1}</Text>
            </View>
            <View style={styles.exerciseInfo}>
              <Text style={[styles.exerciseName, { color: colors.foreground }]}>{exercise.name}</Text>
              <Text style={[styles.exerciseDetail, { color: colors.mutedForeground }]}>
                {exercise.sets} series · {exercise.reps} reps · {exercise.restSeconds}s descanso
              </Text>
              <Text style={[styles.exerciseMuscles, { color: colors.mutedForeground }]} numberOfLines={1}>
                {exercise.muscles}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: bottomPad + 16, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.guidedBtn, { backgroundColor: category.color, borderRadius: colors.radius }]}
          onPress={() => router.push(`/sesion/${category!.id}` as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="play-circle" size={22} color="#fff" />
          <Text style={styles.startBtnText}>Sesión Guiada</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.quickBtn,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius, opacity: logging ? 0.7 : 1 },
          ]}
          onPress={handleStartWorkout}
          disabled={logging}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color={colors.mutedForeground} />
          <Text style={[styles.quickBtnText, { color: colors.mutedForeground }]}>
            {logging ? "Registrando..." : "Solo registrar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {},
  notFound: { fontSize: 16, fontFamily: "Inter_400Regular" },
  hero: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  heroIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 14,
  },
  heroTitle: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 4 },
  heroCount: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  exerciseNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseNumberText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 15, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  exerciseDetail: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 2 },
  exerciseMuscles: { fontSize: 11, fontFamily: "Inter_400Regular" },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  guidedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    marginBottom: 10,
  },
  quickBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderWidth: 1,
  },
  startBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  quickBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
