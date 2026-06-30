import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const VISIBLE_TABS = ["index", "progreso", "rutinas", "comunidad", "mas"] as const;

const TAB_CONFIG: Record<string, {
  icon: string; iconActive: string; label: string; isCenter?: boolean;
}> = {
  index:     { icon: "home-outline",        iconActive: "home",        label: "Inicio"    },
  progreso:  { icon: "trending-up-outline", iconActive: "trending-up", label: "Progreso"  },
  rutinas:   { icon: "barbell-outline",     iconActive: "barbell",     label: "Rutinas",  isCenter: true },
  comunidad: { icon: "globe-outline",       iconActive: "globe",       label: "Social"    },
  mas:       { icon: "grid-outline",        iconActive: "grid",        label: "Más"       },
};

interface TabRoute { key: string; name: string; }
interface TabBarProps { state: { index: number; routes: TabRoute[] }; navigation: any; }

function GymTabBar({ state, navigation }: TabBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";
  const bottomPad = insets.bottom > 0 ? insets.bottom : 16;

  const visibleRoutes = state.routes
    .map((route: TabRoute, originalIndex: number) => ({ route, originalIndex }))
    .filter(({ route }: { route: TabRoute; originalIndex: number }) =>
      VISIBLE_TABS.includes(route.name as any)
    );

  return (
    <View style={[styles.barWrapper, { paddingBottom: bottomPad }]}>
      {isIOS ? (
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card, opacity: 0.97 }]} />
      )}

      <View style={styles.barInner}>
        {visibleRoutes.map(({ route, originalIndex }: { route: TabRoute; originalIndex: number }) => {
          const cfg = TAB_CONFIG[route.name];
          if (!cfg) return null;
          const isFocused = state.index === originalIndex;

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (cfg.isCenter) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={0.85}
                style={styles.centerWrap}
              >
                <View style={styles.centerShadow}>
                  <LinearGradient
                    colors={["#FF6B00", "#E53935"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.centerBtn}
                  >
                    <Ionicons name="barbell" size={28} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={[styles.centerLabel, { color: isFocused ? "#FF6B00" : colors.mutedForeground }]}>
                  Rutinas
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabItem}
            >
              {isFocused && (
                <View style={[styles.activePill, { backgroundColor: colors.primary + "22" }]} />
              )}
              <Ionicons
                name={(isFocused ? cfg.iconActive : cfg.icon) as any}
                size={23}
                color={isFocused ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? colors.primary : colors.mutedForeground },
                  isFocused && styles.tabLabelActive,
                ]}
              >
                {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <GymTabBar {...props} />}
    >
      <Tabs.Screen name="index"     options={{ title: "Inicio"    }} />
      <Tabs.Screen name="progreso"  options={{ title: "Progreso"  }} />
      <Tabs.Screen name="rutinas"   options={{ title: "Rutinas"   }} />
      <Tabs.Screen name="comunidad" options={{ title: "Social"    }} />
      <Tabs.Screen name="mas"       options={{ title: "Más"       }} />

      {/* Hidden from tab bar — accessible via "Más" */}
      <Tabs.Screen name="explorar"  options={{ href: null }} />
      <Tabs.Screen name="chat"      options={{ href: null }} />
      <Tabs.Screen name="nutricion" options={{ href: null }} />
      <Tabs.Screen name="mapa"      options={{ href: null }} />
      <Tabs.Screen name="musica"    options={{ href: null }} />
      <Tabs.Screen name="perfil"    options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  barInner: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
    gap: 3,
    position: "relative",
  },
  activePill: {
    position: "absolute",
    top: -2,
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    fontFamily: "Inter_700Bold",
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 4,
    gap: 4,
    marginTop: -24,
  },
  centerShadow: {
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    borderRadius: 30,
  },
  centerBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.15)",
  },
  centerLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
});
