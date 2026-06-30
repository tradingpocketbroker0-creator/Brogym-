import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
  Image,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const LOGO = require("@/assets/logo.png");

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "male" as "male" | "female",
    weight: "",
    height: "",
    goalWeight: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string | "male" | "female") {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister() {
    const { name, email, password, age, weight, height } = form;
    if (!name.trim() || !email.trim() || !password.trim() || !age || !weight || !height) {
      setError("Completa todos los campos obligatorios");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    setError("");
    const result = await register({
      name: name.trim(),
      email: email.trim(),
      password,
      age: parseInt(age),
      gender: form.gender,
      weight: parseFloat(weight),
      height: parseFloat(height),
      goalWeight: form.goalWeight ? parseFloat(form.goalWeight) : undefined,
    });
    setLoading(false);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(result.error ?? "Error al registrar");
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#FF6B0022", "#0A0A0A"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.foreground }]}>Crear Cuenta</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Empieza tu transformación hoy
          </Text>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.destructive + "22", borderColor: colors.destructive + "44" }]}>
              <Ionicons name="alert-circle" size={16} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          ) : null}

          <Field label="Nombre completo *">
            <InputRow icon="person-outline" placeholder="Tu nombre" value={form.name} onChangeText={(v) => update("name", v)} />
          </Field>

          <Field label="Correo electrónico *">
            <InputRow icon="mail-outline" placeholder="correo@ejemplo.com" value={form.email} onChangeText={(v) => update("email", v)} keyboardType="email-address" autoCapitalize="none" />
          </Field>

          <Field label="Contraseña *">
            <InputRow icon="lock-closed-outline" placeholder="Mínimo 6 caracteres" value={form.password} onChangeText={(v) => update("password", v)} secureTextEntry />
          </Field>

          <Field label="Edad *">
            <InputRow icon="calendar-outline" placeholder="Ej. 25" value={form.age} onChangeText={(v) => update("age", v)} keyboardType="number-pad" />
          </Field>

          <Field label="Sexo *">
            <View style={styles.genderRow}>
              {(["male", "female"] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderBtn,
                    {
                      backgroundColor: form.gender === g ? colors.primary : colors.input,
                      borderColor: form.gender === g ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => update("gender", g)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={g === "male" ? "male" : "female"}
                    size={18}
                    color={form.gender === g ? "#fff" : colors.mutedForeground}
                  />
                  <Text style={[styles.genderText, { color: form.gender === g ? "#fff" : colors.mutedForeground }]}>
                    {g === "male" ? "Masculino" : "Femenino"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field label="Peso (kg) *">
                <InputRow icon="scale-outline" placeholder="70" value={form.weight} onChangeText={(v) => update("weight", v)} keyboardType="decimal-pad" />
              </Field>
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Field label="Altura (cm) *">
                <InputRow icon="resize-outline" placeholder="170" value={form.height} onChangeText={(v) => update("height", v)} keyboardType="decimal-pad" />
              </Field>
            </View>
          </View>

          <Field label="Peso objetivo (kg)">
            <InputRow icon="flag-outline" placeholder="Opcional" value={form.goalWeight} onChangeText={(v) => update("goalWeight", v)} keyboardType="decimal-pad" />
          </Field>

          <TouchableOpacity
            style={[styles.registerBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: loading ? 0.7 : 1 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={[styles.registerBtnText, { color: colors.primaryForeground }]}>
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={[styles.loginText, { color: colors.mutedForeground }]}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      {children}
    </View>
  );
}

function InputRow({
  icon, placeholder, value, onChangeText, keyboardType, autoCapitalize, secureTextEntry,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: any;
  autoCapitalize?: any;
  secureTextEntry?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={[styles.inputWrap, { backgroundColor: colors.input, borderColor: colors.border }]}>
      <Ionicons name={icon} size={17} color={colors.mutedForeground} style={styles.inputIcon} />
      <TextInput
        style={[styles.input, { color: colors.foreground }]}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "words"}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24 },
  backBtn: { marginBottom: 16 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 4 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 20 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  errorText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_500Medium", marginBottom: 6, letterSpacing: 0.3 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  row: { flexDirection: "row" },
  genderRow: { flexDirection: "row", gap: 12 },
  genderBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  genderText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  registerBtn: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  registerBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  loginRow: { flexDirection: "row", justifyContent: "center" },
  loginText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  loginLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
