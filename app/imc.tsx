import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

interface ImcCategory {
  label: string;
  color: string;
  min: number;
  max: number;
  description: string;
  advice: string;
}

const IMC_CATEGORIES: ImcCategory[] = [
  { label: "Bajo peso", color: "#1E88E5", min: 0, max: 18.4, description: "Tu peso está por debajo del rango saludable.", advice: "Consulta a un nutricionista para aumentar de peso de forma saludable." },
  { label: "Peso normal", color: "#43A047", min: 18.5, max: 24.9, description: "Tu peso está dentro del rango saludable.", advice: "Mantén tu estilo de vida activo y alimentación equilibrada." },
  { label: "Sobrepeso", color: "#FB8C00", min: 25, max: 29.9, description: "Tu peso está ligeramente por encima del rango saludable.", advice: "Aumenta la actividad física y mejora tu dieta para alcanzar un peso saludable." },
  { label: "Obesidad", color: "#E53935", min: 30, max: 999, description: "Tu peso está significativamente por encima del rango saludable.", advice: "Consulta a un médico para un plan personalizado de pérdida de peso." },
];

function getCategory(imc: number): ImcCategory {
  return IMC_CATEGORIES.find((c) => imc >= c.min && imc <= c.max) ?? IMC_CATEGORIES[3];
}

export default function ImcScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [weight, setWeight] = useState(String(user?.weight ?? ""));
  const [height, setHeight] = useState(String(user?.height ?? ""));
  const [result, setResult] = useState<number | null>(null);

  function calculate() {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h || w <= 0 || h <= 0) return;
    const imc = w / Math.pow(h / 100, 2);
    setResult(parseFloat(imc.toFixed(1)));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  const category = result ? getCategory(result) : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>Calculadora IMC</Text>
          <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>
            Índice de Masa Corporal
          </Text>

          <View style={[styles.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.inputRow}>
              <View style={styles.inputWrap}>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Peso</Text>
                <View style={[styles.inputField, { backgroundColor: colors.input, borderColor: colors.border }]}>
                  <Ionicons name="scale-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.textInput, { color: colors.foreground }]}
                    placeholder="70.0"
                    placeholderTextColor={colors.mutedForeground}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                  />
                  <Text style={[styles.unit, { color: colors.mutedForeground }]}>kg</Text>
                </View>
              </View>

              <View style={styles.inputWrap}>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Altura</Text>
                <View style={[styles.inputField, { backgroundColor: colors.input, borderColor: colors.border }]}>
                  <Ionicons name="resize-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <TextInput
                    style={[styles.textInput, { color: colors.foreground }]}
                    placeholder="170"
                    placeholderTextColor={colors.mutedForeground}
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="decimal-pad"
                  />
                  <Text style={[styles.unit, { color: colors.mutedForeground }]}>cm</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.calcBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
              onPress={calculate}
              activeOpacity={0.85}
            >
              <Ionicons name="calculator-outline" size={20} color="#fff" />
              <Text style={styles.calcBtnText}>Calcular IMC</Text>
            </TouchableOpacity>
          </View>

          {result && category && (
            <LinearGradient
              colors={[category.color + "22", category.color + "08"]}
              style={[styles.resultCard, { borderColor: category.color + "44", borderRadius: colors.radius }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.resultHeader}>
                <View>
                  <Text style={[styles.imcNumber, { color: category.color }]}>{result}</Text>
                  <Text style={[styles.imcLabel, { color: colors.foreground }]}>IMC</Text>
                </View>
                <View style={[styles.categoryBadge, { backgroundColor: category.color + "22", borderColor: category.color + "55" }]}>
                  <Text style={[styles.categoryText, { color: category.color }]}>{category.label}</Text>
                </View>
              </View>
              <Text style={[styles.resultDesc, { color: colors.secondaryForeground }]}>{category.description}</Text>
              <View style={[styles.adviceBox, { backgroundColor: category.color + "15" }]}>
                <Ionicons name="information-circle-outline" size={16} color={category.color} />
                <Text style={[styles.adviceText, { color: colors.secondaryForeground }]}>{category.advice}</Text>
              </View>
            </LinearGradient>
          )}

          <View style={[styles.scaleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.scaleTitle, { color: colors.foreground }]}>Escala IMC</Text>
            {IMC_CATEGORIES.map((cat) => (
              <View key={cat.label} style={styles.scaleRow}>
                <View style={[styles.scaleDot, { backgroundColor: cat.color }]} />
                <Text style={[styles.scaleLabel, { color: colors.foreground }]}>{cat.label}</Text>
                <Text style={[styles.scaleRange, { color: colors.mutedForeground }]}>
                  {cat.max === 999 ? `≥ ${cat.min}` : `${cat.min} – ${cat.max}`}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.formulaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formulaTitle, { color: colors.foreground }]}>Fórmula</Text>
            <Text style={[styles.formulaText, { color: colors.mutedForeground }]}>
              IMC = Peso (kg) / Altura² (m)
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
  pageTitle: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 4 },
  pageSubtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 20 },
  inputCard: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 16, gap: 14 },
  inputRow: { flexDirection: "row", gap: 12 },
  inputWrap: { flex: 1, gap: 6 },
  inputLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  inputField: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  textInput: { flex: 1, fontSize: 18, fontFamily: "Inter_600SemiBold" },
  unit: { fontSize: 13, fontFamily: "Inter_400Regular" },
  calcBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
  },
  calcBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  resultCard: {
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    gap: 12,
  },
  resultHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  imcNumber: { fontSize: 52, fontFamily: "Inter_700Bold", lineHeight: 56 },
  imcLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  categoryBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  categoryText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  resultDesc: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  adviceBox: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 10, alignItems: "flex-start" },
  adviceText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  scaleCard: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 12, gap: 12 },
  scaleTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  scaleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  scaleDot: { width: 10, height: 10, borderRadius: 5 },
  scaleLabel: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  scaleRange: { fontSize: 13, fontFamily: "Inter_400Regular" },
  formulaCard: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 6 },
  formulaTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  formulaText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
