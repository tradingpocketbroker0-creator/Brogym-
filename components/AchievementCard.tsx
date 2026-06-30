import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AchievementDef } from "@/constants/data";
import { useColors } from "@/hooks/useColors";

interface Props {
  def: AchievementDef;
  unlocked: boolean;
  progress: number;
}

export function AchievementCard({ def, unlocked, progress }: Props) {
  const colors = useColors();
  const iconColor = unlocked ? def.color : colors.mutedForeground;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: unlocked ? def.color + "44" : colors.border,
          opacity: unlocked ? 1 : 0.6,
        },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: unlocked ? def.color + "22" : colors.muted,
            borderColor: unlocked ? def.color + "55" : colors.border,
          },
        ]}
      >
        <Ionicons
          name={def.iconName as keyof typeof Ionicons.glyphMap}
          size={26}
          color={iconColor}
        />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
        {def.title}
      </Text>
      <Text
        style={[styles.desc, { color: colors.mutedForeground }]}
        numberOfLines={2}
      >
        {def.description}
      </Text>
      {!unlocked && (
        <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: def.color, width: `${Math.round(progress * 100)}%` },
            ]}
          />
        </View>
      )}
      {unlocked && (
        <Text style={[styles.unlockedLabel, { color: def.color }]}>Desbloqueado</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "47%",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 10,
  },
  title: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    marginBottom: 4,
  },
  desc: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 15,
    marginBottom: 8,
  },
  progressBar: {
    width: "100%",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  unlockedLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
