import React, { useState, useCallback, useRef } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Image,
  FlatList, ActivityIndicator, Alert, Animated, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { api } from "@/services/api";
import { useSocial } from "@/context/SocialContext";

interface ExploreUser {
  id: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  gym?: string;
  age?: number;
  gender?: string;
  weight?: number;
  height?: number;
}

const GOAL_FILTERS = [
  { key: "", label: "Todos" },
  { key: "fuerza", label: "💪 Fuerza" },
  { key: "cardio", label: "🏃 Cardio" },
  { key: "hipertrofia", label: "🔥 Hipertrofia" },
  { key: "perder peso", label: "⚡ Definición" },
];

const LEVEL_LABELS: Record<string, string> = {
  male: "♂",
  female: "♀",
};

function Avatar({ uri, name, size = 60 }: { uri?: string; name?: string; size?: number }) {
  const colors = useColors();
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary + "33", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.primary + "55" }}>
      <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold", fontSize: size * 0.38 }}>
        {(name ?? "?")[0].toUpperCase()}
      </Text>
    </View>
  );
}

function UserCard({
  user, onLike, onSkip, onStar, liked, starred,
}: {
  user: ExploreUser;
  onLike: () => void;
  onSkip: () => void;
  onStar: () => void;
  liked: boolean;
  starred: boolean;
}) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animPress = (cb: () => void) => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    cb();
  };

  const tags: string[] = [];
  if (user.bio) {
    if (/fuerza/i.test(user.bio)) tags.push("Fuerza");
    if (/hipertrofia/i.test(user.bio)) tags.push("Hipertrofia");
    if (/cardio/i.test(user.bio)) tags.push("Cardio");
    if (/perder|definición|definicion/i.test(user.bio)) tags.push("Definición");
    if (/resistencia/i.test(user.bio)) tags.push("Resistencia");
  }
  if (tags.length === 0) tags.push("Fitness");

  return (
    <Animated.View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, transform: [{ scale: scaleAnim }] }]}>
      {/* Cover gradient */}
      <LinearGradient
        colors={[colors.primary + "18", "transparent"]}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Header row */}
      <View style={styles.cardHeader}>
        <Avatar uri={user.avatar_url} name={user.name} size={72} />
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.cardName, { color: colors.foreground }]}>
              {user.name}
              {user.gender ? ` ${LEVEL_LABELS[user.gender] ?? ""}` : ""}
            </Text>
            {user.age ? <Text style={[styles.cardAge, { color: colors.mutedForeground }]}>, {user.age} años</Text> : null}
          </View>
          {user.gym ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.mutedForeground }]} numberOfLines={1}>{user.gym}</Text>
            </View>
          ) : null}

          {/* Tags */}
          <View style={styles.tagsRow}>
            {tags.slice(0, 3).map(t => (
              <View key={t} style={[styles.tag, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Bio */}
      {user.bio ? (
        <Text style={[styles.cardBio, { color: colors.mutedForeground }]} numberOfLines={2}>{user.bio}</Text>
      ) : null}

      {/* Stats row */}
      {(user.weight || user.height) ? (
        <View style={[styles.statsRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
          {user.weight ? (
            <View style={styles.statItem}>
              <Ionicons name="barbell-outline" size={14} color={colors.primary} />
              <Text style={[styles.statVal, { color: colors.foreground }]}>{user.weight} kg</Text>
              <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Peso</Text>
            </View>
          ) : null}
          {user.height ? (
            <View style={styles.statItem}>
              <Ionicons name="body-outline" size={14} color={colors.primary} />
              <Text style={[styles.statVal, { color: colors.foreground }]}>{user.height} cm</Text>
              <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Altura</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.skipBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => animPress(onSkip)}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={26} color="#FF453A" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.starBtn, { backgroundColor: starred ? "#FFD70022" : colors.card, borderColor: starred ? "#FFD700" : colors.border }]}
          onPress={() => animPress(onStar)}
          activeOpacity={0.8}
        >
          <Ionicons name={starred ? "star" : "star-outline"} size={24} color="#FFD700" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.likeBtn, { backgroundColor: liked ? colors.primary + "22" : colors.card, borderColor: liked ? colors.primary : colors.border }]}
          onPress={() => animPress(onLike)}
          activeOpacity={0.8}
        >
          <Ionicons name={liked ? "heart" : "heart-outline"} size={24} color={liked ? colors.primary : "#FF3B5C"} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

export default function ExplorarScreen() {
  const colors = useColors();
  const { socialUser } = useSocial();
  const [users, setUsers] = useState<ExploreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState<Set<string>>(new Set());

  const loadUsers = useCallback(async (q?: string, goal?: string) => {
    setLoading(true);
    try {
      const data = await api.exploreUsers(q, goal);
      setUsers(data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => {
    if (socialUser) loadUsers(search, selectedGoal);
  }, [socialUser, loadUsers]));

  const handleSearch = useCallback((text: string) => {
    setSearch(text);
    loadUsers(text, selectedGoal);
  }, [selectedGoal, loadUsers]);

  const handleGoalFilter = useCallback((goal: string) => {
    setSelectedGoal(goal);
    loadUsers(search, goal);
  }, [search, loadUsers]);

  const handleLike = useCallback(async (user: ExploreUser) => {
    if (sending.has(user.id)) return;
    setSending(prev => new Set(prev).add(user.id));
    setLiked(prev => {
      const next = new Set(prev);
      if (next.has(user.id)) { next.delete(user.id); return next; }
      next.add(user.id);
      return next;
    });
    try {
      await api.sendFriendRequest(user.id);
      Alert.alert("✅ Solicitud enviada", `Le enviaste una solicitud de amistad a ${user.name}.`);
    } catch (e: any) {
      if (!e.message?.includes("ya existe")) Alert.alert("Info", e.message);
    }
    setSending(prev => { const next = new Set(prev); next.delete(user.id); return next; });
  }, [sending]);

  const handleSkip = useCallback((userId: string) => {
    setSkipped(prev => new Set(prev).add(userId));
  }, []);

  const handleStar = useCallback((userId: string) => {
    setStarred(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }, []);

  const visible = users.filter(u => !skipped.has(u.id));

  if (!socialUser) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <Ionicons name="person-outline" size={48} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Regístrate para explorar</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Crea tu perfil social para encontrar compañeros</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Explorar</Text>
        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => { setSkipped(new Set()); loadUsers(search, selectedGoal); }}
        >
          <Ionicons name="refresh-outline" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Buscar por nombre o gimnasio…"
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* Goal filters */}
      <View style={styles.filtersWrap}>
        <FlatList
          data={GOAL_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={f => f.key}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleGoalFilter(item.key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedGoal === item.key ? colors.primary : colors.card,
                  borderColor: selectedGoal === item.key ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.filterChipText, { color: selectedGoal === item.key ? "#fff" : colors.mutedForeground }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground, marginTop: 12 }]}>Buscando compañeros…</Text>
        </View>
      ) : visible.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={52} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sin resultados</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            {skipped.size > 0 ? "Has visto todos. Pulsa ↺ para recargar." : "Nadie encontrado con esos filtros."}
          </Text>
          <TouchableOpacity
            onPress={() => { setSkipped(new Set()); loadUsers(search, selectedGoal); }}
            style={[styles.reloadBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.reloadBtnText}>Recargar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={u => u.id}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              liked={liked.has(item.id)}
              starred={starred.has(item.id)}
              onLike={() => handleLike(item)}
              onSkip={() => handleSkip(item.id)}
              onStar={() => handleStar(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: Platform.OS === "web" ? 80 : 16, paddingBottom: 12 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold" },
  refreshBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  searchBar: { flexDirection: "row", alignItems: "center", marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 12, height: 46, borderRadius: 14, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  filtersWrap: { marginBottom: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  filterChipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  card: { borderRadius: 18, borderWidth: 1, overflow: "hidden", padding: 16 },
  cardGradient: { ...StyleSheet.absoluteFillObject },
  cardHeader: { flexDirection: "row", gap: 14, marginBottom: 12 },
  cardInfo: { flex: 1, justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", marginBottom: 4 },
  cardName: { fontSize: 17, fontFamily: "Inter_700Bold" },
  cardAge: { fontSize: 15, fontFamily: "Inter_400Regular" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3, marginBottom: 6 },
  locationText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  tag: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
  tagText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardBio: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19, marginBottom: 12 },
  statsRow: { flexDirection: "row", borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 10, marginBottom: 14, gap: 24 },
  statItem: { alignItems: "center", gap: 2 },
  statVal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 11, fontFamily: "Inter_400Regular" },
  actions: { flexDirection: "row", justifyContent: "center", gap: 16 },
  actionBtn: { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  skipBtn: {},
  starBtn: {},
  likeBtn: {},
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 16, marginBottom: 8, textAlign: "center" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  reloadBtn: { marginTop: 20, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 25 },
  reloadBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
