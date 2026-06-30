import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert, Image, Modal, Platform, ScrollView, StyleSheet,
  Switch, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  cancelWorkoutReminder,
  requestNotificationPermission,
  scheduleWorkoutReminder,
} from "@/utils/notifications";

type PrivacyLevel = "public" | "friends" | "private";
const PRIVACY_OPTS: { value: PrivacyLevel; label: string; icon: string }[] = [
  { value: "public",  label: "Todos",          icon: "globe-outline" },
  { value: "friends", label: "Solo amigos",    icon: "people-outline" },
  { value: "private", label: "Solo yo",        icon: "lock-closed-outline" },
];

function PrivacySelector({ value, onChange, colors }: { value: PrivacyLevel; onChange: (v: PrivacyLevel) => void; colors: any }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
      {PRIVACY_OPTS.map(opt => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={{
            flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 10, borderWidth: 1.5,
            borderColor: value === opt.value ? colors.primary : colors.border,
            backgroundColor: value === opt.value ? colors.primary + "15" : colors.background,
          }}
        >
          <Ionicons name={opt.icon as any} size={16} color={value === opt.value ? colors.primary : colors.mutedForeground} />
          <Text style={{ fontSize: 10, fontFamily: "Inter_500Medium", color: value === opt.value ? colors.primary : colors.mutedForeground, marginTop: 3 }}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function PerfilScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useAuth();
  const { getTotalWorkouts, getLatestWeight, getCurrentStreak, unlockedAchievements } = useApp();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  // Modals
  const [showEdit, setShowEdit] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Edit form
  const [editForm, setEditForm] = useState({
    name: user?.name ?? "",
    weight: String(user?.weight ?? ""),
    goalWeight: String(user?.goalWeight ?? ""),
    age: String(user?.age ?? ""),
    phone: user?.phone ?? "",
  });

  // Privacy
  const [privacyProfile, setPrivacyProfile] = useState<PrivacyLevel>(user?.privacyProfile ?? "public");
  const [privacyPhysical, setPrivacyPhysical] = useState<PrivacyLevel>(user?.privacyPhysical ?? "friends");

  // Phone verification
  const [verifyCode, setVerifyCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [phoneToVerify, setPhoneToVerify] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  // Reminder
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState(8);
  const [reminderMinute, setReminderMinute] = useState(0);

  useEffect(() => {
    if (Platform.OS !== "web") {
      try {
        const mod = require("expo-notifications");
        mod.getAllScheduledNotificationsAsync().then((notifs: any[]) => {
          if (notifs.length > 0) {
            setReminderEnabled(true);
            const trigger = notifs[0].trigger as any;
            if (trigger?.hour !== undefined) { setReminderHour(trigger.hour); setReminderMinute(trigger.minute ?? 0); }
          }
        }).catch(() => {});
      } catch {}
    }
  }, []);

  async function handleToggleReminder(value: boolean) {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) { Alert.alert("Permisos requeridos", "Activa las notificaciones en Ajustes."); return; }
      await scheduleWorkoutReminder(reminderHour, reminderMinute);
      setReminderEnabled(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await cancelWorkoutReminder();
      setReminderEnabled(false);
    }
  }

  async function handleSave() {
    await updateUser({
      name: editForm.name.trim() || user?.name,
      weight: parseFloat(editForm.weight) || user?.weight,
      goalWeight: editForm.goalWeight ? parseFloat(editForm.goalWeight) : undefined,
      age: parseInt(editForm.age) || user?.age,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowEdit(false);
  }

  async function handleSavePrivacy() {
    await updateUser({ privacyProfile, privacyPhysical });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPrivacy(false);
  }

  function handleSendCode() {
    if (!phoneToVerify.trim()) { Alert.alert("Error", "Ingresa tu número o correo"); return; }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedCode(code);
    setCodeSent(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Código enviado", `Un código de verificación fue enviado a ${phoneToVerify}\n\n(Demo: ${code})`);
  }

  async function handleConfirmCode() {
    if (verifyCode.trim() === generatedCode) {
      await updateUser({ phone: phoneToVerify.trim(), phoneVerified: true });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("¡Verificado!", "Tu número ha sido verificado correctamente.");
      setShowPhoneVerify(false);
      setCodeSent(false);
      setVerifyCode("");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Código incorrecto", "Verifica el código e intenta de nuevo.");
    }
  }

  async function pickAvatar() {
    if (Platform.OS === "web") {
      Alert.alert("Solo en móvil", "Cambia tu foto desde la app en tu teléfono.");
      return;
    }
    try {
      const ImagePicker = require("expo-image-picker");
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert("Permiso requerido", "Activa el acceso a fotos en Ajustes."); return; }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        await updateUser({ avatarUri: result.assets[0].uri });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (e: any) { Alert.alert("Error", e.message); }
  }

  async function handleLogout() {
    Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: async () => { await logout(); router.replace("/auth/login"); } },
    ]);
  }

  const latestWeight = getLatestWeight() ?? user?.weight;
  const imc = latestWeight && user?.height ? (latestWeight / Math.pow(user.height / 100, 2)).toFixed(1) : null;
  const privacyIcon = PRIVACY_OPTS.find(p => p.value === (user?.privacyProfile ?? "public"))?.icon ?? "globe-outline";

  function formatHour(h: number, m: number) {
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 90, paddingHorizontal: 16 }}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Perfil</Text>
          <TouchableOpacity
            onPress={() => setShowEdit(true)}
            style={[styles.pill, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}
          >
            <Ionicons name="pencil-outline" size={14} color={colors.primary} />
            <Text style={[styles.pillText, { color: colors.primary }]}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar + nombre */}
        <View style={[styles.avatarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8} style={styles.avatarWrap}>
            {user?.avatarUri ? (
              <Image source={{ uri: user.avatarUri }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + "22", borderColor: colors.primary }]}>
                <Text style={[styles.avatarLetter, { color: colors.primary }]}>{(user?.name ?? "A")[0].toUpperCase()}</Text>
              </View>
            )}
            <View style={[styles.avatarEdit, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={[styles.userName, { color: colors.foreground }]}>{user?.name}</Text>
          <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{user?.email}</Text>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}>
              <Ionicons name="flash" size={11} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>Atleta BroGym</Text>
            </View>
            {user?.phoneVerified && (
              <View style={[styles.badge, { backgroundColor: "#30D15822", borderColor: "#30D15844" }]}>
                <Ionicons name="shield-checkmark" size={11} color="#30D158" />
                <Text style={[styles.badgeText, { color: "#30D158" }]}>Verificado</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => setShowPrivacy(true)}
              style={[styles.badge, { backgroundColor: colors.muted, borderColor: colors.border }]}
            >
              <Ionicons name={privacyIcon as any} size={11} color={colors.mutedForeground} />
              <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
                {PRIVACY_OPTS.find(p => p.value === (user?.privacyProfile ?? "public"))?.label}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: "Entrenos", value: getTotalWorkouts(), icon: "barbell-outline", color: "#E53935" },
            { label: "Racha", value: `${getCurrentStreak()}d`, icon: "flame-outline", color: "#FB8C00" },
            { label: "Logros", value: unlockedAchievements.length, icon: "trophy-outline", color: "#FFD700" },
          ].map((s, i) => (
            <View key={i} style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name={s.icon as any} size={20} color={s.color} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Datos físicos */}
        <SectionCard title="Datos Físicos" colors={colors} rightAction={
          <TouchableOpacity onPress={() => setShowPrivacy(true)}>
            <Ionicons name="shield-outline" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        }>
          {[
            { label: "Edad", value: `${user?.age ?? "--"} años`, icon: "calendar-outline", color: "#1E88E5" },
            { label: "Género", value: user?.gender === "male" ? "Masculino" : "Femenino", icon: "person-outline", color: "#8E24AA" },
            { label: "Peso actual", value: `${latestWeight ?? "--"} kg`, icon: "scale-outline", color: "#43A047" },
            { label: "Altura", value: `${user?.height ?? "--"} cm`, icon: "resize-outline", color: "#FB8C00" },
            { label: "IMC", value: imc ?? "--", icon: "fitness-outline", color: "#FF6B00" },
            ...(user?.goalWeight ? [{ label: "Peso objetivo", value: `${user.goalWeight} kg`, icon: "flag-outline", color: "#E53935" }] : []),
          ].map((item, i, arr) => (
            <View key={i} style={[styles.infoRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={[styles.infoIcon, { backgroundColor: item.color + "22" }]}>
                <Ionicons name={item.icon as any} size={16} color={item.color} />
              </View>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{item.value}</Text>
            </View>
          ))}
        </SectionCard>

        {/* Teléfono / Verificación */}
        <SectionCard title="Cuenta y Seguridad" colors={colors}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: "#FF6B0022" }]}>
              <Ionicons name="call-outline" size={16} color="#FF6B00" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Teléfono</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>
                {user?.phone ?? "Sin agregar"}
                {user?.phoneVerified ? "  ✓" : ""}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => { setPhoneToVerify(user?.phone ?? ""); setCodeSent(false); setVerifyCode(""); setShowPhoneVerify(true); }}
              style={[styles.smallBtn, { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44" }]}
            >
              <Text style={[styles.smallBtnText, { color: colors.primary }]}>
                {user?.phoneVerified ? "Cambiar" : "Verificar"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
            <View style={[styles.infoIcon, { backgroundColor: "#8E24AA22" }]}>
              <Ionicons name="mail-outline" size={16} color="#8E24AA" />
            </View>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Correo</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]} numberOfLines={1}>{user?.email}</Text>
          </View>
        </SectionCard>

        {/* Recordatorio */}
        <SectionCard title="Recordatorio Diario" colors={colors}>
          <View style={styles.reminderRow}>
            <View style={[styles.infoIcon, { backgroundColor: colors.primary + "22" }]}>
              <Ionicons name="notifications-outline" size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: colors.foreground }]}>Notificación diaria</Text>
              <Text style={[{ fontSize: 12, fontFamily: "Inter_400Regular", color: colors.mutedForeground }]}>
                {reminderEnabled ? `Activo · ${formatHour(reminderHour, reminderMinute)}` : "Desactivado"}
              </Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={handleToggleReminder}
              trackColor={{ false: colors.muted, true: colors.primary + "88" }}
              thumbColor={reminderEnabled ? colors.primary : colors.mutedForeground}
            />
          </View>
          {reminderEnabled && (
            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: colors.border }]}
            >
              <View style={[styles.infoIcon, { backgroundColor: "#FB8C0022" }]}>
                <Ionicons name="time-outline" size={16} color="#FB8C00" />
              </View>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Cambiar hora</Text>
              <Text style={[styles.infoValue, { color: colors.foreground }]}>{formatHour(reminderHour, reminderMinute)}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}
        </SectionCard>

        {/* Accesos rápidos */}
        <SectionCard title="Herramientas" colors={colors}>
          {[
            { label: "Logros",       icon: "trophy-outline",    color: "#FFD700", onPress: () => router.push("/logros" as any) },
            { label: "Calculadora IMC", icon: "fitness-outline", color: "#FF6B00", onPress: () => router.push("/imc" as any) },
            { label: "Cronómetro",   icon: "timer-outline",     color: "#FB8C00", onPress: () => router.push("/cronometro" as any) },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              style={[styles.infoRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <View style={[styles.infoIcon, { backgroundColor: item.color + "22" }]}>
                <Ionicons name={item.icon as any} size={16} color={item.color} />
              </View>
              <Text style={[styles.infoLabel, { color: colors.foreground, flex: 1 }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </SectionCard>

        {/* Cerrar sesión */}
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.logoutBtn, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "44" }]}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal: Editar perfil */}
      <Modal visible={showEdit} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowEdit(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowEdit(false)}>
              <Text style={[{ fontSize: 15, fontFamily: "Inter_400Regular", color: colors.mutedForeground }]}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={[{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground }]}>Editar Perfil</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={[{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.primary }]}>Guardar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} keyboardShouldPersistTaps="handled">
            {[
              { label: "Nombre", key: "name", placeholder: "Tu nombre", kb: "default" },
              { label: "Edad", key: "age", placeholder: "Años", kb: "number-pad" },
              { label: "Peso (kg)", key: "weight", placeholder: "70.0", kb: "decimal-pad" },
              { label: "Peso objetivo (kg)", key: "goalWeight", placeholder: "Opcional", kb: "decimal-pad" },
            ].map((f) => (
              <View key={f.key} style={{ gap: 6 }}>
                <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>{f.label}</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  value={editForm[f.key as keyof typeof editForm]}
                  onChangeText={(v) => setEditForm(prev => ({ ...prev, [f.key]: v }))}
                  keyboardType={f.kb as any}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Modal: Privacidad */}
      <Modal visible={showPrivacy} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPrivacy(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowPrivacy(false)}>
              <Text style={{ fontSize: 15, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>Privacidad</Text>
            <TouchableOpacity onPress={handleSavePrivacy}>
              <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.primary }}>Guardar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
            <View>
              <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 4 }}>
                ¿Quién puede ver tu perfil?
              </Text>
              <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginBottom: 4 }}>
                Nombre, foto y bio
              </Text>
              <PrivacySelector value={privacyProfile} onChange={setPrivacyProfile} colors={colors} />
            </View>
            <View>
              <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 4 }}>
                ¿Quién puede ver tus datos físicos?
              </Text>
              <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, marginBottom: 4 }}>
                Peso, altura, edad e IMC
              </Text>
              <PrivacySelector value={privacyPhysical} onChange={setPrivacyPhysical} colors={colors} />
            </View>
            <View style={[{ borderRadius: 12, padding: 14, backgroundColor: colors.primary + "10", borderWidth: 1, borderColor: colors.primary + "30" }]}>
              <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.mutedForeground, lineHeight: 18 }}>
                💡 Estas opciones controlan qué ve la comunidad en la red social de BroGym.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal: Verificar teléfono */}
      <Modal visible={showPhoneVerify} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowPhoneVerify(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowPhoneVerify(false)}>
              <Text style={{ fontSize: 15, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>Verificar Cuenta</Text>
            <View style={{ width: 60 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }} keyboardShouldPersistTaps="handled">
            <View style={{ alignItems: "center", paddingVertical: 8 }}>
              <View style={[{ width: 70, height: 70, borderRadius: 35, backgroundColor: colors.primary + "20", alignItems: "center", justifyContent: "center", marginBottom: 14 }]}>
                <Ionicons name="shield-checkmark-outline" size={34} color={colors.primary} />
              </View>
              <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 8 }}>
                Verifica tu cuenta
              </Text>
              <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center", lineHeight: 20 }}>
                Ingresa tu número de teléfono o correo. Te enviaremos un código de 6 dígitos para verificarlo.
              </Text>
            </View>

            {!codeSent ? (
              <>
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>
                    Teléfono o correo electrónico
                  </Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="+52 999 000 0000 o tu@correo.com"
                    placeholderTextColor={colors.mutedForeground}
                    value={phoneToVerify}
                    onChangeText={setPhoneToVerify}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <TouchableOpacity
                  onPress={handleSendCode}
                  style={{ backgroundColor: colors.primary, borderRadius: 14, height: 52, alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" }}>Enviar código</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center" }}>
                  Código enviado a {phoneToVerify}
                </Text>
                <View style={{ gap: 6 }}>
                  <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>Código de 6 dígitos</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground, textAlign: "center", fontSize: 24, letterSpacing: 8 }]}
                    placeholder="000000"
                    placeholderTextColor={colors.mutedForeground}
                    value={verifyCode}
                    onChangeText={setVerifyCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleConfirmCode}
                  style={{ backgroundColor: colors.primary, borderRadius: 14, height: 52, alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={{ color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" }}>Confirmar código</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setCodeSent(false)} style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.primary }}>Cambiar número</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Modal: Hora recordatorio */}
      <Modal visible={showTimePicker} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowTimePicker(false)}>
        <TimePickerModal
          colors={colors}
          initialHour={reminderHour}
          initialMinute={reminderMinute}
          onCancel={() => setShowTimePicker(false)}
          onSave={(h, m) => { setReminderHour(h); setReminderMinute(m); setShowTimePicker(false); if (reminderEnabled) scheduleWorkoutReminder(h, m); }}
        />
      </Modal>
    </View>
  );
}

function SectionCard({ title, children, colors, rightAction }: { title: string; children: React.ReactNode; colors: any; rightAction?: React.ReactNode }) {
  return (
    <View style={[sStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={sStyles.cardHeader}>
        <Text style={[sStyles.cardTitle, { color: colors.foreground }]}>{title}</Text>
        {rightAction}
      </View>
      {children}
    </View>
  );
}

const sStyles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingTop: 14, paddingBottom: 6, marginBottom: 14 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});

function TimePickerModal({ colors, initialHour, initialMinute, onCancel, onSave }: {
  colors: any; initialHour: number; initialMinute: number;
  onCancel: () => void; onSave: (h: number, m: number) => void;
}) {
  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onCancel}><Text style={{ fontSize: 15, fontFamily: "Inter_400Regular", color: colors.mutedForeground }}>Cancelar</Text></TouchableOpacity>
        <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>Hora del recordatorio</Text>
        <TouchableOpacity onPress={() => onSave(hour, minute)}><Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.primary }}>Guardar</Text></TouchableOpacity>
      </View>
      <View style={{ alignItems: "center", justifyContent: "center", padding: 24, flexDirection: "row", gap: 12 }}>
        <Ionicons name="notifications" size={24} color={colors.primary} />
        <Text style={{ fontSize: 36, fontFamily: "Inter_700Bold", color: colors.foreground }}>
          {hour % 12 === 0 ? 12 : hour % 12}:{String(minute).padStart(2, "0")} {hour >= 12 ? "PM" : "AM"}
        </Text>
      </View>
      <View style={{ flexDirection: "row", paddingHorizontal: 16, gap: 16 }}>
        {[{ label: "HORA", items: hours, selected: hour, onSelect: setHour, fmt: (h: number) => h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM` },
          { label: "MINUTOS", items: minutes, selected: minute, onSelect: setMinute, fmt: (m: number) => `:${String(m).padStart(2, "0")}` }
        ].map(col => (
          <View key={col.label} style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, letterSpacing: 1.5, marginBottom: 8 }}>{col.label}</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }}>
              {col.items.map(v => (
                <TouchableOpacity key={v} onPress={() => col.onSelect(v)}
                  style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: col.selected === v ? colors.primary : "transparent", backgroundColor: col.selected === v ? colors.primary + "22" : "transparent" }}>
                  <Text style={{ fontSize: 15, fontFamily: "Inter_500Medium", textAlign: "center", color: col.selected === v ? colors.primary : colors.foreground }}>{col.fmt(v)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold" },
  pill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  pillText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  avatarCard: { alignItems: "center", padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 14 },
  avatarWrap: { marginBottom: 12, position: "relative" },
  avatarImg: { width: 84, height: 84, borderRadius: 42 },
  avatarPlaceholder: { width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  avatarLetter: { fontSize: 34, fontFamily: "Inter_700Bold" },
  avatarEdit: { position: "absolute", bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#0A0A0A" },
  userName: { fontSize: 20, fontFamily: "Inter_700Bold", marginBottom: 3 },
  userEmail: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statBox: { flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 12, borderWidth: 1, gap: 4 },
  statValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textAlign: "center" },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 11, gap: 12 },
  infoIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  infoLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  reminderRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 },
  smallBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  smallBtnText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 14, borderWidth: 1, marginTop: 4, marginBottom: 8 },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1 },
  modalInput: { height: 50, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
});
