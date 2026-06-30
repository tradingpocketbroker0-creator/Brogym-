import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AchievementCard } from "@/components/AchievementCard";
import { ACHIEVEMENT_DEFS } from "@/constants/data";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function LogrosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isAchievementUnlocked, getAchievementProgress, unlockedAchievements } = useApp();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const unlocked = ACHIEVEMENT_DEFS.filter((d) => isAchievementUnlocked(d.id));
  const locked = ACHIEVEMENT_DEFS.filter((d) => !isAchievementUnlocked(d.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 24 }]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Logros</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {unlockedAchievements.length} de {ACHIEVEMENT_DEFS.length} desbloqueados
        </Text>

        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.overallBar, { backgroundColor: colors.muted }]}>
            <View
              style={[
                styles.overallFill,
                {
                  backgroundColor: colors.primary,
                  width: `${Math.round((unlockedAchievements.length / ACHIEVEMENT_DEFS.length) * 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressPct, { color: colors.primary }]}>
            {Math.round((unlockedAchievements.length / ACHIEVEMENT_DEFS.length) * 100)}% completado
          </Text>
        </View>

        {unlocked.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DESBLOQUEADOS</Text>
            <View style={styles.grid}>
              {unlocked.map((def) => (
                <AchievementCard
                  key={def.id}
                  def={def}
                  unlocked={true}
                  progress={1}
                />
              ))}
            </View>
          </>
        )}

        {locked.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>POR DESBLOQUEAR</Text>
            <View style={styles.grid}>
              {locked.map((def) => (
                <AchievementCard
                  key={def.id}
                  def={def}
                  unlocked={false}
                  progress={getAchievementProgress(def)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 20 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 16 },
  progressCard: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 24, gap: 10 },
  overallBar: { height: 8, borderRadius: 4, overflow: "hidden" },
  overallFill: { height: "100%", borderRadius: 4 },
  progressPct: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "right" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5, marginBottom: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
});
