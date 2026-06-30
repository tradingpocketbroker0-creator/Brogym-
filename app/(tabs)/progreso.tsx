import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SimpleChart } from "@/components/SimpleChart";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function ProgresoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { addProgressEntry, progressEntries } = useApp();

  const [weight, setWeight] = useState("");
  const [arms, setArms] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [legs, setLegs] = useState("");
  const [saving, setSaving] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  async function handleSave() {
    if (!weight.trim()) {
      Alert.alert("Peso requerido", "Ingresa tu peso para guardar el registro.");
      return;
    }
    setSaving(true);
    await addProgressEntry({
      weight: parseFloat(weight),
      arms: arms ? parseFloat(arms) : undefined,
      chest: chest ? parseFloat(chest) : undefined,
      waist: waist ? parseFloat(waist) : undefined,
      legs: legs ? parseFloat(legs) : undefined,
    });
    setSaving(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setWeight("");
    setArms("");
    setChest("");
    setWaist("");
    setLegs("");
  }

  const chartData = progressEntries.slice(-10).map((e) => ({
    label: new Date(e.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
    value: e.weight,
  }));

  const recent = [...progressEntries].reverse().slice(0, 5);
  const chartWidth = width - 32;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 90 },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Mi Progreso</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Registra tu evolución física
        </Text>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Registrar Medidas</Text>

          <View style={styles.inputRow}>
            <MeasureInput
              label="Peso (kg) *"
              value={weight}
              onChangeText={setWeight}
              icon="scale-outline"
              color={colors.primary}
            />
            <MeasureInput
              label="Brazos (cm)"
              value={arms}
              onChangeText={setArms}
              icon="body-outline"
              color="#E53935"
            />
          </View>
          <View style={styles.inputRow}>
            <MeasureInput
              label="Pecho (cm)"
              value={chest}
              onChangeText={setChest}
              icon="body-outline"
              color="#43A047"
            />
            <MeasureInput
              label="Cintura (cm)"
              value={waist}
              onChangeText={setWaist}
              icon="body-outline"
              color="#FB8C00"
            />
          </View>
          <View style={styles.inputRow}>
            <MeasureInput
              label="Piernas (cm)"
              value={legs}
              onChangeText={setLegs}
              icon="body-outline"
              color="#8E24AA"
            />
            <View style={{ flex: 1 }} />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: saving ? 0.7 : 1 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Ionicons name="save-outline" size={18} color="#fff" />
            <Text style={styles.saveBtnText}>{saving ? "Guardando..." : "Guardar Registro"}</Text>
          </TouchableOpacity>
        </View>

        {progressEntries.length > 1 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Evolución de Peso</Text>
            <SimpleChart
              data={chartData}
              width={chartWidth - 32}
              height={150}
              color={colors.primary}
              unit="kg"
            />
          </View>
        )}

        {recent.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Historial Reciente</Text>
            {recent.map((entry) => (
              <View key={entry.id} style={[styles.historyItem, { borderBottomColor: colors.border }]}>
                <View>
                  <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>
                    {new Date(entry.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                  </Text>
                  <Text style={[styles.historyWeight, { color: colors.foreground }]}>
                    {entry.weight} kg
                  </Text>
                </View>
                <View style={styles.historyMeasures}>
                  {entry.arms ? <Chip label={`Brazos: ${entry.arms}cm`} /> : null}
                  {entry.chest ? <Chip label={`Pecho: ${entry.chest}cm`} /> : null}
                  {entry.waist ? <Chip label={`Cintura: ${entry.waist}cm`} /> : null}
                </View>
              </View>
            ))}
          </View>
        )}

        {progressEntries.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="trending-up-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>Sin registros aún</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Empieza registrando tu peso hoy
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function MeasureInput({ label, value, onChangeText, icon, color }: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.measureWrap}>
      <Text style={[styles.measureLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[styles.measureInput, { backgroundColor: colors.input, borderColor: colors.border }]}>
        <Ionicons name={icon} size={15} color={color} style={{ marginRight: 6 }} />
        <TextInput
          style={[styles.measureTextInput, { color: colors.foreground }]}
          placeholder="0.0"
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
        />
      </View>
    </View>
  );
}

function Chip({ label }: { label: string }) {
  const colors = useColors();
  return (
    <View style={[styles.chip, { backgroundColor: colors.muted }]}>
      <Text style={[styles.chipText, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 20 },
  section: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", marginBottom: 14 },
  inputRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  measureWrap: { flex: 1 },
  measureLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginBottom: 5 },
  measureInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
  },
  measureTextInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    marginTop: 4,
  },
  saveBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 6,
  },
  historyDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  historyWeight: { fontSize: 18, fontFamily: "Inter_700Bold" },
  historyMeasures: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  chipText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
