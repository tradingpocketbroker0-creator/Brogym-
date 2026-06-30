import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  label: string;
  value: string;
  unit?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
}

export function StatCard({ label, value, unit, iconName, color }: Props) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: color + "33",
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + "22" }]}>
        <Ionicons name={iconName} size={18} color={color} />
      </View>
      <Text style={[styles.value, { color: colors.foreground }]}>
        {value}
        {unit ? <Text style={[styles.unit, { color: colors.mutedForeground }]}> {unit}</Text> : null}
      </Text>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  unit: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    textAlign: "center",
  },
});
