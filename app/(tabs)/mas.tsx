import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

const LOGO = require("@/assets/logo.png");

const MENU_ITEMS = [
  {
    label: "Explorar",
    icon: "compass",
    color: "#1E88E5",
    bg: "#1E88E522",
    route: "/(tabs)/explorar",
    desc: "Descubre nuevo contenido",
  },
  {
    label: "Chat",
    icon: "chatbubbles",
    color: "#43A047",
    bg: "#43A04722",
    route: "/(tabs)/chat",
    desc: "Mensajes y grupos",
  },
  {
    label: "Nutrición",
    icon: "nutrition",
    color: "#8E24AA",
    bg: "#8E24AA22",
    route: "/(tabs)/nutricion",
    desc: "Dieta y alimentos",
  },
  {
    label: "Mapa",
    icon: "map",
    color: "#00897B",
    bg: "#00897B22",
    route: "/(tabs)/mapa",
    desc: "Gimnasios cercanos",
  },
  {
    label: "Música",
    icon: "musical-notes",
    color: "#FB8C00",
    bg: "#FB8C0022",
    route: "/(tabs)/musica",
    desc: "Tu playlist de gym",
  },
  {
    label: "Logros",
    icon: "trophy",
    color: "#FFD700",
    bg: "#FFD70022",
    route: "/logros",
    desc: "Tus medallas",
  },
  {
    label: "Cronómetro",
    icon: "timer",
    color: "#FF6B00",
    bg: "#FF6B0022",
    route: "/cronometro",
    desc: "Temporizador",
  },
  {
    label: "Calc. IMC",
    icon: "fitness",
    color: "#E53935",
    bg: "#E5393522",
    route: "/imc",
    desc: "Índice de masa corporal",
  },
] as const;

export default function MasScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad + 100, paddingHorizontal: 16 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/perfil")}
            activeOpacity={0.8}
            style={[styles.profileBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {user?.name ? (
              <View style={[styles.avatarCircle, { backgroundColor: colors.primary + "22" }]}>
                <Text style={[styles.avatarLetter, { color: colors.primary }]}>
                  {user.name[0].toUpperCase()}
                </Text>
              </View>
            ) : (
              <Ionicons name="person-outline" size={20} color={colors.foreground} />
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Más opciones</Text>
        <Text style={[styles.pageSub, { color: colors.mutedForeground }]}>
          Todo lo que necesitas en un solo lugar
        </Text>

        {/* Profile card */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push("/(tabs)/perfil");
          }}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.primary + "33", colors.primary + "11"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.profileCard, { borderColor: colors.primary + "44" }]}
          >
            <View style={[styles.profileAvatar, { backgroundColor: colors.primary + "33" }]}>
              <Text style={[styles.profileAvatarLetter, { color: colors.primary }]}>
                {(user?.name ?? "A")[0].toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.profileName, { color: colors.foreground }]}>
                {user?.name ?? "Atleta BroGym"}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>
                {user?.email ?? "Ver perfil completo"}
              </Text>
            </View>
            <View style={[styles.profileArrow, { backgroundColor: colors.primary + "22" }]}>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>HERRAMIENTAS Y SECCIONES</Text>

        {/* Grid */}
        <View style={styles.grid}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(item.route as any);
              }}
              activeOpacity={0.8}
              style={[styles.gridCard, { backgroundColor: colors.card, borderColor: item.color + "33" }]}
            >
              <LinearGradient
                colors={[item.color + "22", "transparent"]}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.cardIcon, { backgroundColor: item.color + "22" }]}>
                  <Ionicons name={item.icon as any} size={26} color={item.color} />
                </View>
                <Text style={[styles.cardLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: { width: 120, height: 38 },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarLetter: { fontSize: 16, fontFamily: "Inter_700Bold" },
  pageTitle: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 4 },
  pageSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 20 },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 14,
    marginBottom: 24,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarLetter: { fontSize: 22, fontFamily: "Inter_700Bold" },
  profileName: { fontSize: 16, fontFamily: "Inter_700Bold" },
  profileEmail: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  profileArrow: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridCard: {
    width: "47%",
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardGradient: {
    padding: 18,
    gap: 10,
    minHeight: 130,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  cardLabel: { fontSize: 15, fontFamily: "Inter_700Bold" },
  cardDesc: { fontSize: 11, fontFamily: "Inter_400Regular", lineHeight: 15 },
});
