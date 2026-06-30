import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type Gym = {
  id: string;
  name: string;
  address: string;
  rating: number;
  distance: string;
  latOffset: number;
  lngOffset: number;
  open: boolean;
};

const DEMO_GYMS: Gym[] = [
  { id: "1", name: "BroGym Centro", address: "Calle Principal 123", rating: 4.8, distance: "350m", latOffset: 0.003, lngOffset: 0.002, open: true },
  { id: "2", name: "FitLife Gym", address: "Av. Libertad 456", rating: 4.5, distance: "700m", latOffset: -0.005, lngOffset: 0.003, open: true },
  { id: "3", name: "PowerHouse", address: "Calle 45 #89", rating: 4.3, distance: "1.1km", latOffset: 0.007, lngOffset: -0.004, open: false },
  { id: "4", name: "Muscle Factory", address: "Blvd. Atletas 200", rating: 4.6, distance: "1.5km", latOffset: -0.008, lngOffset: -0.006, open: true },
  { id: "5", name: "Gold's Gym", address: "Zona Rosa #67", rating: 4.9, distance: "2km", latOffset: 0.012, lngOffset: 0.008, open: true },
];

export default function MapaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [permStatus, setPermStatus] = useState<"unknown" | "granted" | "denied">("unknown");
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    checkPermission();
  }, []);

  useEffect(() => {
    if (selectedGym) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 60, friction: 10 }).start();
    } else {
      Animated.timing(slideAnim, { toValue: 300, useNativeDriver: true, duration: 200 }).start();
    }
  }, [selectedGym]);

  async function checkPermission() {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === "granted") {
      setPermStatus("granted");
      fetchLocation();
    } else {
      setPermStatus("unknown");
    }
  }

  async function requestPermission() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      setPermStatus("granted");
      fetchLocation();
    } else {
      setPermStatus("denied");
    }
  }

  async function fetchLocation() {
    setLoadingLocation(true);
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(loc);
    } catch {
      setLocation(null);
    } finally {
      setLoadingLocation(false);
    }
  }

  function handleGymPress(gym: Gym) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGym(gym === selectedGym ? null : gym);
  }

  function openMaps(gym: Gym) {
    if (!location) return;
    const lat = location.coords.latitude + gym.latOffset;
    const lng = location.coords.longitude + gym.lngOffset;
    const url = Platform.OS === "ios"
      ? `maps://app?daddr=${lat},${lng}&q=${encodeURIComponent(gym.name)}`
      : `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(gym.name)})`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/${encodeURIComponent(gym.name)}`);
    });
  }

  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center", padding: 32 }]}>
        <Ionicons name="map-outline" size={64} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground, marginTop: 16 }]}>Disponible en el dispositivo</Text>
        <Text style={[styles.emptyDesc, { color: colors.mutedForeground, textAlign: "center", marginTop: 8 }]}>
          El mapa de gyms solo funciona en tu celular con la app instalada.
        </Text>
      </View>
    );
  }

  if (permStatus === "unknown") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={["#FF6B0022", colors.background]} style={[styles.permFull, { paddingTop: topPad + 40 }]}>
          <View style={[styles.permIcon, { backgroundColor: "#FF6B0022", borderColor: "#FF6B0055" }]}>
            <Ionicons name="location" size={52} color="#FF6B00" />
          </View>
          <Text style={[styles.permTitle, { color: colors.foreground }]}>Gyms Cercanos</Text>
          <Text style={[styles.permDesc, { color: colors.mutedForeground }]}>
            BroGym usa tu ubicación para mostrarte los gimnasios más cercanos. Encuentra compañeros de entrenamiento en tu zona.
          </Text>
          <TouchableOpacity
            style={[styles.permBtn, { backgroundColor: colors.primary }]}
            onPress={requestPermission}
            activeOpacity={0.85}
          >
            <Ionicons name="location-outline" size={20} color="#fff" />
            <Text style={styles.permBtnText}>Permitir ubicación</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  if (permStatus === "denied") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center", padding: 32 }]}>
        <Ionicons name="location-outline" size={52} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground, marginTop: 16 }]}>Ubicación denegada</Text>
        <Text style={[styles.emptyDesc, { color: colors.mutedForeground, textAlign: "center", marginTop: 8 }]}>
          Activa la ubicación desde Ajustes → BroGym → Ubicación.
        </Text>
        <TouchableOpacity style={[styles.permBtn, { backgroundColor: colors.primary, marginTop: 20 }]} onPress={() => Linking.openSettings()}>
          <Text style={styles.permBtnText}>Abrir ajustes</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loadingLocation || !location) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Ionicons name="location-outline" size={40} color={colors.primary} />
        <Text style={[styles.emptyDesc, { color: colors.mutedForeground, marginTop: 12 }]}>Obteniendo ubicación...</Text>
      </View>
    );
  }

  const MapView = require("react-native-maps").default;
  const { Marker, Circle } = require("react-native-maps");

  const userLat = location.coords.latitude;
  const userLng = location.coords.longitude;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: userLat,
          longitude: userLng,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
        userInterfaceStyle="dark"
      >
        <Marker coordinate={{ latitude: userLat, longitude: userLng }} title="Tú estás aquí">
          <View style={styles.userMarker}>
            <Ionicons name="person" size={16} color="#fff" />
          </View>
        </Marker>

        <Circle
          center={{ latitude: userLat, longitude: userLng }}
          radius={2000}
          fillColor="#FF6B0011"
          strokeColor="#FF6B0044"
          strokeWidth={1}
        />

        {DEMO_GYMS.map((gym) => (
          <Marker
            key={gym.id}
            coordinate={{ latitude: userLat + gym.latOffset, longitude: userLng + gym.lngOffset }}
            onPress={() => handleGymPress(gym)}
          >
            <TouchableOpacity
              style={[
                styles.gymMarker,
                { backgroundColor: selectedGym?.id === gym.id ? "#FF6B00" : gym.open ? "#0A0A0A" : "#444" },
              ]}
              onPress={() => handleGymPress(gym)}
            >
              <Ionicons name="barbell" size={14} color={selectedGym?.id === gym.id ? "#fff" : "#FF6B00"} />
              <Text style={[styles.gymMarkerText, { color: selectedGym?.id === gym.id ? "#fff" : "#FF6B00" }]} numberOfLines={1}>
                {gym.name.split(" ")[0]}
              </Text>
            </TouchableOpacity>
          </Marker>
        ))}
      </MapView>

      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <Text style={[styles.searchText, { color: colors.mutedForeground }]}>Gymns cercanos a ti</Text>
          <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.countText}>{DEMO_GYMS.length}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.locBtn, { backgroundColor: colors.card, borderColor: colors.border, bottom: bottomPad + (selectedGym ? 220 : 24) }]}
        onPress={fetchLocation}
      >
        <Ionicons name="locate" size={20} color={colors.primary} />
      </TouchableOpacity>

      {selectedGym && (
        <Animated.View
          style={[
            styles.gymCard,
            { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: bottomPad + 16 },
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.gymCardHandle} />
          <View style={styles.gymCardHeader}>
            <View style={[styles.gymCardIcon, { backgroundColor: "#FF6B0022", borderColor: "#FF6B0055" }]}>
              <Ionicons name="barbell" size={22} color="#FF6B00" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.gymCardNameRow}>
                <Text style={[styles.gymCardName, { color: colors.foreground }]}>{selectedGym.name}</Text>
                <View style={[styles.openBadge, { backgroundColor: selectedGym.open ? "#43A047" : "#E53935" }]}>
                  <Text style={styles.openBadgeText}>{selectedGym.open ? "Abierto" : "Cerrado"}</Text>
                </View>
              </View>
              <Text style={[styles.gymCardAddress, { color: colors.mutedForeground }]}>{selectedGym.address}</Text>
            </View>
          </View>

          <View style={styles.gymCardMeta}>
            <View style={[styles.metaChip, { backgroundColor: colors.muted }]}>
              <Ionicons name="star" size={13} color="#FFD700" />
              <Text style={[styles.metaChipText, { color: colors.foreground }]}>{selectedGym.rating}</Text>
            </View>
            <View style={[styles.metaChip, { backgroundColor: colors.muted }]}>
              <Ionicons name="walk-outline" size={13} color={colors.mutedForeground} />
              <Text style={[styles.metaChipText, { color: colors.foreground }]}>{selectedGym.distance}</Text>
            </View>
          </View>

          <View style={styles.gymCardActions}>
            <TouchableOpacity
              style={[styles.gymActionBtn, { backgroundColor: colors.primary }]}
              onPress={() => openMaps(selectedGym)}
              activeOpacity={0.85}
            >
              <Ionicons name="navigate" size={18} color="#fff" />
              <Text style={styles.gymActionBtnText}>Cómo llegar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.gymActionBtnSecondary, { backgroundColor: colors.muted, borderColor: colors.border }]}
              onPress={() => setSelectedGym(null)}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: 16 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1 },
  searchText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  locBtn: { position: "absolute", right: 16, width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  userMarker: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#FF6B00", borderWidth: 3, borderColor: "#fff", alignItems: "center", justifyContent: "center" },
  gymMarker: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 20, borderWidth: 1.5, borderColor: "#FF6B0055" },
  gymMarkerText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  gymCard: { position: "absolute", bottom: 0, left: 0, right: 0, borderTopWidth: 1, padding: 16 },
  gymCardHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#444", alignSelf: "center", marginBottom: 16 },
  gymCardHeader: { flexDirection: "row", gap: 12, marginBottom: 12 },
  gymCardIcon: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  gymCardNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  gymCardName: { fontSize: 16, fontFamily: "Inter_700Bold", flex: 1 },
  gymCardAddress: { fontSize: 13, fontFamily: "Inter_400Regular" },
  openBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  openBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#fff" },
  gymCardMeta: { flexDirection: "row", gap: 8, marginBottom: 16 },
  metaChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  metaChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  gymCardActions: { flexDirection: "row", gap: 10 },
  gymActionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 12 },
  gymActionBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  gymActionBtnSecondary: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  permFull: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  permIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  permTitle: { fontSize: 24, fontFamily: "Inter_700Bold", textAlign: "center" },
  permDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  permBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  permBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
});
