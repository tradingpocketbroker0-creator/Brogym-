import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

type Track = {
  id: string;
  filename: string;
  uri: string;
  duration: number;
};

type SoundRef = { stopAsync: () => Promise<void>; unloadAsync: () => Promise<void>; pauseAsync: () => Promise<void>; playAsync: () => Promise<void> };

export default function MusicaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [permissionStatus, setPermissionStatus] = useState<"unknown" | "granted" | "denied">("unknown");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);

  const soundRef = useRef<SoundRef | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") {
      setPermissionStatus("denied");
      return;
    }
    checkPermission();
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  async function getMediaLibrary() {
    try { return require("expo-media-library"); } catch { return null; }
  }

  async function getAudio() {
    try { return require("expo-av"); } catch { return null; }
  }

  async function checkPermission() {
    const ML = await getMediaLibrary();
    if (!ML) { setPermissionStatus("denied"); return; }
    try {
      const { status } = await ML.getPermissionsAsync();
      if (status === "granted") { setPermissionStatus("granted"); loadTracks(); }
      else { setPermissionStatus("unknown"); }
    } catch { setPermissionStatus("denied"); }
  }

  async function requestPermission() {
    const ML = await getMediaLibrary();
    if (!ML) { setPermissionStatus("denied"); return; }
    try {
      const { status } = await ML.requestPermissionsAsync();
      if (status === "granted") { setPermissionStatus("granted"); loadTracks(); }
      else { setPermissionStatus("denied"); }
    } catch { setPermissionStatus("denied"); }
  }

  async function loadTracks() {
    const ML = await getMediaLibrary();
    if (!ML) return;
    setLoading(true);
    try {
      const result = await ML.getAssetsAsync({ mediaType: "audio", first: 200 });
      setTracks(result.assets.map((a: any) => ({
        id: a.id, filename: a.filename, uri: a.uri, duration: a.duration,
      })));
    } catch { setTracks([]); }
    finally { setLoading(false); }
  }

  async function playTrack(idx: number) {
    const track = tracks[idx];
    if (!track) return;
    const AV = await getAudio();
    if (!AV) return;
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      await AV.Audio.setAudioModeAsync({ allowsRecordingIOS: false, staysActiveInBackground: true, playsInSilentModeIOS: true });
      const { sound } = await AV.Audio.Sound.createAsync(
        { uri: track.uri },
        { shouldPlay: true },
        (status: any) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis ?? 0);
            setDuration(status.durationMillis ?? 1);
            if (status.didJustFinish) playNext(idx);
          }
        }
      );
      soundRef.current = sound;
      setCurrentIdx(idx);
      setIsPlaying(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch { setIsPlaying(false); }
  }

  function playNext(fromIdx?: number) {
    const idx = fromIdx ?? currentIdx ?? 0;
    playTrack((idx + 1) % tracks.length);
  }

  function playPrev() {
    const idx = currentIdx ?? 0;
    playTrack((idx - 1 + tracks.length) % tracks.length);
  }

  async function togglePlay() {
    if (!soundRef.current) { if (tracks.length > 0) playTrack(0); return; }
    if (isPlaying) { await soundRef.current.pauseAsync(); setIsPlaying(false); }
    else { await soundRef.current.playAsync(); setIsPlaying(true); }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function formatDuration(ms: number): string {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  function cleanTitle(filename: string): string {
    return filename.replace(/\.(mp3|m4a|flac|aac|wav|ogg|wma)$/i, "").replace(/_/g, " ").trim();
  }

  const currentTrack = currentIdx !== null ? tracks[currentIdx] : null;
  const progressPct = duration > 0 ? (position / duration) * 100 : 0;

  const renderTrack = useCallback(({ item, index }: { item: Track; index: number }) => {
    const active = index === currentIdx;
    return (
      <TouchableOpacity
        style={[styles.trackRow, { backgroundColor: active ? colors.primary + "15" : colors.card, borderColor: active ? colors.primary + "44" : colors.border }]}
        onPress={() => playTrack(index)}
        activeOpacity={0.8}
      >
        <View style={[styles.trackNum, { backgroundColor: active ? colors.primary : colors.muted }]}>
          {active && isPlaying
            ? <Ionicons name="musical-note" size={14} color="#fff" />
            : <Text style={[styles.trackNumText, { color: active ? "#fff" : colors.mutedForeground }]}>{index + 1}</Text>
          }
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.trackTitle, { color: active ? colors.primary : colors.foreground }]} numberOfLines={1}>
            {cleanTitle(item.filename)}
          </Text>
          <Text style={[styles.trackMeta, { color: colors.mutedForeground }]}>{formatDuration(item.duration * 1000)}</Text>
        </View>
        {active && <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={28} color={colors.primary} />}
      </TouchableOpacity>
    );
  }, [currentIdx, isPlaying, colors]);

  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center", padding: 32 }]}>
        <Ionicons name="musical-notes" size={64} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground, marginTop: 16 }]}>Disponible en el dispositivo</Text>
        <Text style={[styles.emptyDesc, { color: colors.mutedForeground, textAlign: "center", marginTop: 8 }]}>
          El reproductor de música solo funciona en tu celular con la app instalada.
        </Text>
      </View>
    );
  }

  if (permissionStatus === "unknown") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.permissionHero, { paddingTop: topPad + 40 }]}>
          <LinearGradient colors={["#FF6B0022", colors.background]} style={styles.permGradient}>
            <View style={[styles.permIcon, { backgroundColor: "#FF6B0022", borderColor: "#FF6B0055" }]}>
              <Ionicons name="musical-notes" size={52} color="#FF6B00" />
            </View>
            <Text style={[styles.permTitle, { color: colors.foreground }]}>Biblioteca de Música</Text>
            <Text style={[styles.permDesc, { color: colors.mutedForeground }]}>
              Escucha tu música favorita mientras entrenas sin salir de BroGym.
            </Text>
            <TouchableOpacity style={[styles.permBtn, { backgroundColor: colors.primary }]} onPress={requestPermission} activeOpacity={0.85}>
              <Ionicons name="folder-open-outline" size={20} color="#fff" />
              <Text style={styles.permBtnText}>Permitir acceso a música</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    );
  }

  if (permissionStatus === "denied") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center", padding: 32 }]}>
        <Ionicons name="musical-notes-outline" size={64} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground, marginTop: 16 }]}>Música no disponible</Text>
        <Text style={[styles.emptyDesc, { color: colors.mutedForeground, textAlign: "center", marginTop: 8 }]}>
          Esta función requiere acceso a los medios del dispositivo. Activa el permiso desde Ajustes.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Música</Text>
        <TouchableOpacity onPress={loadTracks} style={[styles.refreshBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="refresh-outline" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground, marginTop: 12 }]}>Cargando música...</Text>
        </View>
      ) : tracks.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Ionicons name="musical-notes-outline" size={64} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground, marginTop: 16 }]}>Sin música encontrada</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground, textAlign: "center", marginTop: 8 }]}>
            No encontramos archivos de audio en tu dispositivo.
          </Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={renderTrack}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + (currentTrack ? 120 : 16) }]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={20}
        />
      )}

      {currentTrack && (
        <View style={[styles.player, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: bottomPad + 8 }]}>
          <View style={[styles.playerProgress, { backgroundColor: colors.muted }]}>
            <View style={[styles.playerProgressFill, { backgroundColor: colors.primary, width: `${progressPct}%` as any }]} />
          </View>
          <View style={styles.playerMeta}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.playerTitle, { color: colors.foreground }]} numberOfLines={1}>{cleanTitle(currentTrack.filename)}</Text>
              <Text style={[styles.playerTime, { color: colors.mutedForeground }]}>{formatDuration(position)} / {formatDuration(duration)}</Text>
            </View>
          </View>
          <View style={styles.playerControls}>
            <TouchableOpacity onPress={playPrev} style={styles.ctrlBtn}>
              <Ionicons name="play-skip-back" size={28} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity onPress={togglePlay} style={[styles.playBtn, { backgroundColor: colors.primary }]}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => playNext()} style={styles.ctrlBtn}>
              <Ionicons name="play-skip-forward" size={28} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  refreshBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  permissionHero: { flex: 1 },
  permGradient: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  permIcon: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  permTitle: { fontSize: 24, fontFamily: "Inter_700Bold", textAlign: "center" },
  permDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  permBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  permBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  trackRow: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8, gap: 12 },
  trackNum: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  trackNumText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  trackTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  trackMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  player: { borderTopWidth: 1, paddingHorizontal: 16, paddingTop: 8 },
  playerProgress: { height: 3, borderRadius: 2, marginBottom: 12, overflow: "hidden" },
  playerProgressFill: { height: "100%", borderRadius: 2 },
  playerMeta: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  playerTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  playerTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
  playerControls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24, paddingBottom: 4 },
  ctrlBtn: { padding: 8 },
  playBtn: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
});
