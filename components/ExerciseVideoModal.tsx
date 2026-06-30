import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
  youtubeId: string;
  exerciseName: string;
}

function buildHtml(youtubeId: string): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
      .wrapper {
        position: relative;
        width: 100%;
        padding-top: 56.25%;
        background: #000;
      }
      iframe {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        border: none;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <iframe
        src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&controls=1&fs=1"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowfullscreen
        frameborder="0"
      ></iframe>
    </div>
  </body>
</html>
  `.trim();
}

export default function ExerciseVideoModal({ visible, onClose, youtubeId, exerciseName }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) setLoading(true);
  }, [visible, youtubeId]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === "ios" ? insets.top : 16,
        },
      ]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIcon, { backgroundColor: "#E5393522" }]}>
              <Ionicons name="play-circle" size={18} color="#E53935" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
                {exerciseName}
              </Text>
              <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
                Tutorial · Técnica correcta
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: colors.muted }]}
          >
            <Ionicons name="close" size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Video */}
        <View style={styles.videoWrapper}>
          {Platform.OS !== "web" ? (
            <>
              {loading && (
                <View style={[styles.loader, { backgroundColor: "#000" }]}>
                  <ActivityIndicator size="large" color="#E53935" />
                  <Text style={[styles.loaderText, { color: "#aaa" }]}>Cargando video…</Text>
                </View>
              )}
              <WebView
                key={youtubeId}
                source={{ html: buildHtml(youtubeId) }}
                style={styles.webview}
                originWhitelist={["*"]}
                allowsFullscreenVideo
                allowsInlineMediaPlayback
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled
                domStorageEnabled
                mixedContentMode="always"
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
                onHttpError={() => setLoading(false)}
              />
            </>
          ) : (
            <View style={[styles.webFallback, { backgroundColor: colors.card }]}>
              <Ionicons name="logo-youtube" size={56} color="#E53935" />
              <Text style={[styles.webFallbackTitle, { color: colors.foreground }]}>
                {exerciseName}
              </Text>
              <Text style={[styles.webFallbackSub, { color: colors.mutedForeground }]}>
                Los videos se reproducen en la app móvil.{"\n"}Abre BroGym en tu teléfono.
              </Text>
            </View>
          )}
        </View>

        {/* Tip */}
        <View style={[
          styles.tip,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            marginBottom: insets.bottom + 16,
          },
        ]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
            Observa la técnica y la postura antes de ejecutar el ejercicio.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 12,
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  headerSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  videoWrapper: { flex: 1, backgroundColor: "#000", position: "relative" },
  webview: { flex: 1, backgroundColor: "#000" },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    zIndex: 10,
  },
  loaderText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 32,
  },
  webFallbackTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  webFallbackSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  tip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  tipText: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
