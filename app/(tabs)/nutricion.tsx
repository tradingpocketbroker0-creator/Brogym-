import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NutritionCard } from "@/components/NutritionCard";
import { NUTRITION_GOALS } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

export default function NutricionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeGoal, setActiveGoal] = useState(0);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const goal = NUTRITION_GOALS[activeGoal];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 90 },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Nutrición</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Elige tu objetivo nutricional
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {NUTRITION_GOALS.map((g, i) => (
            <TouchableOpacity
              key={g.id}
              style={[
                styles.tab,
                {
                  backgroundColor: i === activeGoal ? colors.primary : colors.card,
                  borderColor: i === activeGoal ? colors.primary : colors.border,
                  borderRadius: colors.radius,
                },
              ]}
              onPress={() => setActiveGoal(i)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: i === activeGoal ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                {g.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.goalHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.goalTitle, { color: colors.foreground }]}>{goal.title}</Text>
          <Text style={[styles.goalSubtitle, { color: colors.primary }]}>{goal.subtitle}</Text>
          <Text style={[styles.goalDesc, { color: colors.mutedForeground }]}>{goal.description}</Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ALIMENTOS RECOMENDADOS</Text>
        {goal.foods.map((food) => (
          <NutritionCard key={food.id} food={food} />
        ))}

        <View style={[styles.tipsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.tipsTitle, { color: colors.foreground }]}>Consejos</Text>
          {goal.tips.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.tipText, { color: colors.secondaryForeground }]}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {},
  title: { fontSize: 28, fontFamily: "Inter_700Bold", paddingHorizontal: 16, marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", paddingHorizontal: 16, marginBottom: 16 },
  tabsRow: { paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  tab: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1 },
  tabText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  goalHeader: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  goalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 2 },
  goalSubtitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  goalDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5, paddingHorizontal: 16, marginBottom: 12 },
  tipsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  tipsTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
  tipRow: { flexDirection: "row", gap: 10, marginBottom: 10, alignItems: "flex-start" },
  tipDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
});
