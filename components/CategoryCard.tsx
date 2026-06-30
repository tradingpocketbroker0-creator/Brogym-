import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  id: string;
  name: string;
  color: string;
  exerciseCount: number;
  onPress: () => void;
}

export function CategoryCard({ name, color, exerciseCount, onPress }: Props) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.card, { borderRadius: colors.radius }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[color + "33", color + "11"]}
        style={[styles.gradient, { borderRadius: colors.radius, borderColor: color + "44" }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.iconCircle, { backgroundColor: color + "22", borderColor: color + "55" }]}>
          <Ionicons name="fitness" size={28} color={color} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]}>{name}</Text>
          <Text style={[styles.count, { color: colors.mutedForeground }]}>
            {exerciseCount} ejercicios
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  count: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
