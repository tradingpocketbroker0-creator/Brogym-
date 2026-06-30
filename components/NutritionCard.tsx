import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Food } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

interface Props {
  food: Food;
}

export function NutritionCard({ food }: Props) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.name, { color: colors.foreground }]}>{food.name}</Text>
        <Text style={[styles.calories, { color: colors.primary }]}>
          {food.calories} kcal
        </Text>
      </View>
      <View style={styles.macros}>
        <MacroBadge label="Proteína" value={food.protein} color="#E53935" />
        <MacroBadge label="Carbos" value={food.carbs} color="#FB8C00" />
        <MacroBadge label="Grasas" value={food.fat} color="#1E88E5" />
      </View>
    </View>
  );
}

function MacroBadge({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.badge, { backgroundColor: color + "22" }]}>
      <Text style={[styles.macroValue, { color }]}>{value}g</Text>
      <Text style={[styles.macroLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    marginRight: 8,
  },
  calories: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  macros: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 8,
  },
  macroValue: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  macroLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
  },
});
