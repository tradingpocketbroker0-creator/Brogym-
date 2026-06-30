import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import { getCategoryById, type Exercise } from "@/constants/data";
import { useColors } from "@/hooks/useColors";
import ExerciseVideoModal from "@/components/ExerciseVideoModal";

type Phase = "intensity" | "intro" | "exercise" | "rest" | "done";
type Intensity = "suave" | "normal" | "intenso";

const INTENSITIES: Record<Intensity, {
  label: string; emoji: string; color: string; desc: string;
  repsMultiplier: number; setsAdd: number; restMultiplier: number;
}> = {
  suave: {
    label: "Suave", emoji: "🌱", color: "#43A047",
    desc: "Ideal para principiantes o días de recuperación activa",
    repsMultiplier: 0.5, setsAdd: 0, restMultiplier: 1.5,
  },
  normal: {
    label: "Normal", emoji: "⚡", color: "#FF6B00",
    desc: "Intensidad estándar para progreso constante y sostenido",
    repsMultiplier: 1, setsAdd: 0, restMultiplier: 1,
  },
  intenso: {
    label: "Intenso", emoji: "🔥", color: "#E53935",
    desc: "Para atletas avanzados que quieren romper sus límites",
    repsMultiplier: 2, setsAdd: 1, restMultiplier: 0.75,
  },
};

function scaleReps(reps: string, mult: number): string {
  if (reps.includes("-")) {
    const [a, b] = reps.split("-").map(Number);
    return `${Math.max(1, Math.round(a * mult))}-${Math.max(1, Math.round(b * mult))}`;
  }
  return String(Math.max(1, Math.round(Number(reps) * mult)));
}

type ScaledExercise = Exercise & { scaledSets: number; scaledReps: string; scaledRest: number };

function getScaled(ex: Exercise, intensity: Intensity): ScaledExercise {
  const cfg = INTENSITIES[intensity];
  return {
    ...ex,
    scaledSets: ex.sets + cfg.setsAdd,
    scaledReps: scaleReps(ex.reps, cfg.repsMultiplier),
    scaledRest: Math.round(ex.restSeconds * cfg.restMultiplier),
  };
}

export default function SesionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { addWorkoutLog } = useApp();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const category = getCategoryById(categoryId ?? "");
  const exercises = category?.exercises ?? [];

  const [phase, setPhase] = useState<Phase>("intensity");
  const [intensity, setIntensity] = useState<Intensity>("normal");
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [setIdx, setSetIdx] = useState(1);
  const [restTime, setRestTime] = useState(0);
  const [restRunning, setRestRunning] = useState(false);
  const [elapsedTotal, setElapsedTotal] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const [showVideo, setShowVideo] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scaledExercises = exercises.map((ex) => getScaled(ex, intensity));
  const currentEx = scaledExercises[exerciseIdx];
  const totalExercises = exercises.length;
  const intensityCfg = INTENSITIES[intensity];

  useEffect(() => {
    if (phase === "exercise" || phase === "rest") {
      totalRef.current = setInterval(() => setElapsedTotal((p) => p + 1), 1000);
    }
    return () => { if (totalRef.current) clearInterval(totalRef.current); };
  }, [phase]);

  useEffect(() => {
    if (restRunning && restTime > 0) {
      intervalRef.current = setInterval(() => {
        setRestTime((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRestRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [restRunning]);

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function handleSelectIntensity(i: Intensity) {
    setIntensity(i);
    setPhase("intro");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  function handleSetDone() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const ex = currentEx!;
    const newCompleted = { ...completedSets, [ex.id]: (completedSets[ex.id] ?? 0) + 1 };
    setCompletedSets(newCompleted);

    if (setIdx < ex.scaledSets) {
      setRestTime(ex.scaledRest);
      setRestRunning(true);
      setPhase("rest");
    } else {
      if (exerciseIdx + 1 < totalExercises) {
        setExerciseIdx(exerciseIdx + 1);
        setSetIdx(1);
        setRestTime(60);
        setRestRunning(true);
        setPhase("rest");
      } else {
        finishWorkout();
      }
    }
  }

  function handleRestSkip() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRestRunning(false);
    const ex = currentEx!;
    if (setIdx < ex.scaledSets) {
      setSetIdx(setIdx + 1);
    } else {
      setSetIdx(1);
    }
    setPhase("exercise");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function handleNextFromRest() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRestRunning(false);
    setSetIdx(1);
    setPhase("exercise");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  async function finishWorkout() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (totalRef.current) clearInterval(totalRef.current);
    setPhase("done");
    await addWorkoutLog({
      categoryId: category!.id,
      categoryName: category!.name,
      durationMinutes: Math.round(elapsedTotal / 60) || 1,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleAbandon() {
    Alert.alert("Abandonar sesión", "¿Seguro que quieres salir?", [
      { text: "Continuar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => router.back() },
    ]);
  }

  if (!category) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: colors.mutedForeground }}>Categoría no encontrada</Text>
      </View>
    );
  }

  if (phase === "intensity") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={[styles.introScroll, { paddingBottom: bottomPad + 40 }]}>
          <LinearGradient colors={[category.color + "33", colors.background]} style={styles.introHero}>
            <View style={[styles.introIcon, { backgroundColor: category.color + "22", borderColor: category.color + "55" }]}>
              <Ionicons name="fitness" size={52} color={category.color} />
            </View>
            <Text style={[styles.introTitle, { color: colors.foreground }]}>{category.name}</Text>
            <Text style={[styles.introSub, { color: colors.mutedForeground }]}>¿Cómo quieres entrenar hoy?</Text>
          </LinearGradient>

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ELIGE TU INTENSIDAD</Text>

          {(Object.entries(INTENSITIES) as [Intensity, typeof INTENSITIES[Intensity]][]).map(([key, cfg]) => (
            <TouchableOpacity
              key={key}
              style={[styles.intensityCard, { backgroundColor: colors.card, borderColor: cfg.color + "55" }]}
              onPress={() => handleSelectIntensity(key)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[cfg.color + "22", cfg.color + "08"]}
                style={styles.intensityGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.intensityEmoji}>{cfg.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.intensityLabel, { color: cfg.color }]}>{cfg.label}</Text>
                  <Text style={[styles.intensityDesc, { color: colors.mutedForeground }]}>{cfg.desc}</Text>
                  <View style={styles.intensityBadges}>
                    <View style={[styles.badge, { backgroundColor: cfg.color + "22" }]}>
                      <Text style={[styles.badgeText, { color: cfg.color }]}>
                        {scaleReps(exercises[0]?.reps ?? "8", cfg.repsMultiplier)} reps
                      </Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: cfg.color + "22" }]}>
                      <Text style={[styles.badgeText, { color: cfg.color }]}>
                        {(exercises[0]?.sets ?? 3) + cfg.setsAdd} series
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={cfg.color} />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (phase === "done") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={["#43A04722", colors.background]} style={styles.doneHero}>
          <View style={[styles.doneCircle, { borderColor: "#43A047" }]}>
            <Ionicons name="checkmark" size={64} color="#43A047" />
          </View>
          <Text style={[styles.doneTitle, { color: colors.foreground }]}>¡Entrenamiento completado!</Text>
          <Text style={[styles.doneSub, { color: colors.mutedForeground }]}>
            {category.name} · {intensityCfg.emoji} {intensityCfg.label} · {formatTime(elapsedTotal)}
          </Text>
        </LinearGradient>

        <View style={styles.doneStats}>
          {[
            { label: "Ejercicios", value: String(totalExercises), icon: "barbell-outline", color: "#FF6B00" },
            { label: "Tiempo", value: formatTime(elapsedTotal), icon: "timer-outline", color: "#43A047" },
            { label: "Series", value: String(Object.values(completedSets).reduce((a, b) => a + b, 0)), icon: "layers-outline", color: "#FB8C00" },
          ].map((s) => (
            <View key={s.label} style={[styles.doneStat, { backgroundColor: colors.card, borderColor: s.color + "44" }]}>
              <Ionicons name={s.icon as any} size={22} color={s.color} />
              <Text style={[styles.doneStatValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.doneStatLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.doneFooter, { paddingBottom: bottomPad + 16 }]}>
          <TouchableOpacity
            style={[styles.mainBtn, { backgroundColor: "#43A047", borderRadius: 14 }]}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Ionicons name="home-outline" size={20} color="#fff" />
            <Text style={styles.mainBtnText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === "intro") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.intensityBanner, { backgroundColor: intensityCfg.color + "22", borderBottomColor: intensityCfg.color + "44" }]}>
          <Text style={styles.intensityBannerEmoji}>{intensityCfg.emoji}</Text>
          <Text style={[styles.intensityBannerText, { color: intensityCfg.color }]}>
            Modo {intensityCfg.label}
          </Text>
        </View>
        <ScrollView contentContainerStyle={[styles.introScroll, { paddingBottom: bottomPad + 100 }]}>
          <LinearGradient colors={[category.color + "33", colors.background]} style={styles.introHero}>
            <View style={[styles.introIcon, { backgroundColor: category.color + "22", borderColor: category.color + "55" }]}>
              <Ionicons name="fitness" size={52} color={category.color} />
            </View>
            <Text style={[styles.introTitle, { color: colors.foreground }]}>{category.name}</Text>
            <Text style={[styles.introSub, { color: category.color }]}>{totalExercises} ejercicios</Text>
          </LinearGradient>

          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>EJERCICIOS EN ESTA SESIÓN</Text>
          {scaledExercises.map((ex, i) => (
            <View key={ex.id} style={[styles.introExCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.introNum, { backgroundColor: category.color + "22" }]}>
                <Text style={[styles.introNumText, { color: category.color }]}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.introExName, { color: colors.foreground }]}>{ex.name}</Text>
                <Text style={[styles.introExDetail, { color: colors.mutedForeground }]}>
                  {ex.scaledSets} series · {ex.scaledReps} reps · {ex.scaledRest}s descanso
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: bottomPad + 16, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.mainBtn, { backgroundColor: intensityCfg.color, borderRadius: 14 }]}
            onPress={() => setPhase("exercise")}
            activeOpacity={0.85}
          >
            <Ionicons name="play" size={22} color="#fff" />
            <Text style={styles.mainBtnText}>Comenzar sesión {intensityCfg.emoji}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPhase("intensity")} style={styles.changeIntensityBtn}>
            <Text style={[styles.changeIntensityText, { color: colors.mutedForeground }]}>Cambiar intensidad</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (phase === "rest") {
    const isLastSet = currentEx && setIdx >= currentEx.scaledSets;
    const nextEx = !isLastSet ? currentEx : scaledExercises[exerciseIdx + 1];

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
          <View style={[styles.progressFill, { backgroundColor: intensityCfg.color, width: `${(exerciseIdx / totalExercises) * 100}%` }]} />
        </View>
        <View style={styles.restContent}>
          <Text style={[styles.restLabel, { color: colors.mutedForeground }]}>DESCANSO</Text>
          <LinearGradient
            colors={["#43A04722", "#43A04708"]}
            style={[styles.restCircle, { borderColor: restTime > 5 ? "#43A047" : "#E53935" }]}
          >
            <Text style={[styles.restTime, { color: restTime > 5 ? "#43A047" : "#E53935" }]}>
              {formatTime(restTime)}
            </Text>
            {!restRunning && restTime === 0 && (
              <Text style={[styles.restGo, { color: "#43A047" }]}>¡Listo!</Text>
            )}
          </LinearGradient>

          {nextEx && (
            <View style={[styles.nextCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.nextLabel, { color: colors.mutedForeground }]}>SIGUIENTE</Text>
              <Text style={[styles.nextName, { color: colors.foreground }]}>{nextEx.name}</Text>
              {!isLastSet && (
                <Text style={[styles.nextDetail, { color: colors.mutedForeground }]}>
                  Serie {setIdx + 1} de {currentEx?.scaledSets}
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={[styles.footer, { paddingBottom: bottomPad + 16, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.mainBtn, { backgroundColor: intensityCfg.color, borderRadius: 14 }]}
            onPress={isLastSet ? handleNextFromRest : handleRestSkip}
            activeOpacity={0.85}
          >
            <Ionicons name="play-skip-forward" size={20} color="#fff" />
            <Text style={styles.mainBtnText}>Saltar descanso</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
        <View style={[styles.progressFill, {
          backgroundColor: intensityCfg.color,
          width: `${((exerciseIdx + (setIdx - 1) / (currentEx?.scaledSets ?? 1)) / totalExercises) * 100}%`
        }]} />
      </View>

      <View style={styles.exerciseTopBar}>
        <TouchableOpacity onPress={handleAbandon}>
          <Ionicons name="close-circle-outline" size={22} color={colors.mutedForeground} />
        </TouchableOpacity>
        <Text style={[styles.exerciseCounter, { color: colors.mutedForeground }]}>
          {exerciseIdx + 1}/{totalExercises} {intensityCfg.emoji}
        </Text>
        <Text style={[styles.timerText, { color: colors.mutedForeground }]}>{formatTime(elapsedTotal)}</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.exerciseContent, { paddingBottom: bottomPad + 140 }]}>
        <LinearGradient
          colors={[intensityCfg.color + "22", colors.background]}
          style={styles.exerciseHero}
        >
          <View style={[styles.exerciseIcon, { backgroundColor: intensityCfg.color + "22", borderColor: intensityCfg.color + "55" }]}>
            <Ionicons name="barbell" size={44} color={intensityCfg.color} />
          </View>
          <Text style={[styles.exerciseName, { color: colors.foreground }]}>{currentEx?.name}</Text>
        </LinearGradient>

        <View style={styles.setsRow}>
          {Array.from({ length: currentEx?.scaledSets ?? 0 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.setDot,
                {
                  backgroundColor: i < setIdx - 1 ? intensityCfg.color
                    : i === setIdx - 1 ? intensityCfg.color + "66"
                    : colors.muted,
                  borderColor: i === setIdx - 1 ? intensityCfg.color : "transparent",
                },
              ]}
            />
          ))}
        </View>

        <Text style={[styles.setLabel, { color: colors.mutedForeground }]}>
          Serie {setIdx} de {currentEx?.scaledSets}
        </Text>

        <View style={styles.specsRow}>
          {[
            { label: "Reps", value: currentEx?.scaledReps ?? "", icon: "repeat-outline", color: "#1E88E5" },
            { label: "Descanso", value: `${currentEx?.scaledRest}s`, icon: "timer-outline", color: "#43A047" },
          ].map((s) => (
            <View key={s.label} style={[styles.specCard, { backgroundColor: colors.card, borderColor: s.color + "33" }]}>
              <View style={[styles.specIcon, { backgroundColor: s.color + "22" }]}>
                <Ionicons name={s.icon as any} size={18} color={s.color} />
              </View>
              <Text style={[styles.specValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.specLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.descCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.descText, { color: colors.secondaryForeground }]} numberOfLines={4}>
            {currentEx?.description}
          </Text>
        </View>

        {/* Botón ver video */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowVideo(true);
          }}
          activeOpacity={0.85}
          style={[styles.videoBtnSession, { backgroundColor: "#00000015", borderColor: colors.border }]}
        >
          <View style={styles.videoBtnPlayCircle}>
            <Ionicons name="play" size={13} color="#fff" />
          </View>
          <Text style={[styles.videoBtnSessionText, { color: colors.mutedForeground }]}>
            Ver cómo se hace este ejercicio
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 16, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.mainBtn, { backgroundColor: intensityCfg.color, borderRadius: 14 }]}
          onPress={handleSetDone}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text style={styles.mainBtnText}>
            {setIdx < (currentEx?.scaledSets ?? 1)
              ? `Serie ${setIdx} completada`
              : exerciseIdx + 1 < totalExercises
              ? "Ejercicio listo → Siguiente"
              : "Finalizar entrenamiento"}
          </Text>
        </TouchableOpacity>
      </View>

      {currentEx && (
        <ExerciseVideoModal
          visible={showVideo}
          onClose={() => setShowVideo(false)}
          youtubeId={currentEx.youtubeId}
          exerciseName={currentEx.name}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressBar: { height: 3, width: "100%" },
  progressFill: { height: "100%" },
  intensityBanner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderBottomWidth: 1 },
  intensityBannerEmoji: { fontSize: 16 },
  intensityBannerText: { fontSize: 13, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  introScroll: { paddingHorizontal: 16 },
  introHero: { alignItems: "center", paddingVertical: 28, marginBottom: 16 },
  introIcon: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", borderWidth: 1, marginBottom: 14 },
  introTitle: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 4 },
  introSub: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5, marginBottom: 14 },
  intensityCard: { borderRadius: 16, borderWidth: 1.5, marginBottom: 12, overflow: "hidden" },
  intensityGradient: { flexDirection: "row", alignItems: "center", padding: 18, gap: 14 },
  intensityEmoji: { fontSize: 32 },
  intensityLabel: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 4 },
  intensityDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 16, marginBottom: 8 },
  intensityBadges: { flexDirection: "row", gap: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  introExCard: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10, gap: 12 },
  introNum: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  introNumText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  introExName: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  introExDetail: { fontSize: 12, fontFamily: "Inter_400Regular" },
  exerciseTopBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  exerciseCounter: { fontSize: 13, fontFamily: "Inter_500Medium" },
  timerText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  exerciseContent: { paddingHorizontal: 16 },
  exerciseHero: { alignItems: "center", paddingVertical: 24, marginBottom: 16 },
  exerciseIcon: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center", borderWidth: 1, marginBottom: 12 },
  exerciseName: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  setsRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 8 },
  setDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  setLabel: { fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "center", marginBottom: 16 },
  specsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  specCard: { flex: 1, alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, gap: 6 },
  specIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  specValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  specLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  descCard: { padding: 14, borderRadius: 14, borderWidth: 1 },
  descText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  restContent: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 24 },
  restLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 2 },
  restCircle: { width: 200, height: 200, borderRadius: 100, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  restTime: { fontSize: 52, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  restGo: { fontSize: 18, fontFamily: "Inter_700Bold" },
  nextCard: { width: "100%", padding: 16, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 4 },
  nextLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  nextName: { fontSize: 16, fontFamily: "Inter_700Bold" },
  nextDetail: { fontSize: 12, fontFamily: "Inter_400Regular" },
  doneHero: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 24, gap: 12 },
  doneCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  doneTitle: { fontSize: 24, fontFamily: "Inter_700Bold", textAlign: "center" },
  doneSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  doneStats: { flexDirection: "row", paddingHorizontal: 16, gap: 10 },
  doneStat: { flex: 1, alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, gap: 6 },
  doneStatValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  doneStatLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  doneFooter: { paddingHorizontal: 16, paddingTop: 20 },
  changeIntensityBtn: { alignItems: "center", paddingVertical: 10 },
  changeIntensityText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  mainBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52 },
  mainBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  videoBtnSession: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  videoBtnPlayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
  },
  videoBtnSessionText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
});
