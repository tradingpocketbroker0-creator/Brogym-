import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet,
  Image, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useSocial } from "@/context/SocialContext";
import { api } from "@/services/api";
import { useFocusEffect } from "expo-router";

type Screen = "login" | "register" | "convos" | "search" | "requests" | "chat";

interface Convo { friend: { id: string; name: string; avatar_url?: string }; last_message: any; unread: number }
interface Msg { id: string; content: string; sender_id: string; created_at: string }
interface SearchUser { id: string; name: string; email: string; avatar_url?: string; bio?: string }
interface FriendRequest { id: string; requester_id: string; created_at: string; requester: { id: string; name: string; avatar_url?: string } }

function Avatar({ uri, name, size = 38 }: { uri?: string; name?: string; size?: number }) {
  const colors = useColors();
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: size * 0.4 }}>
        {(name ?? "?")[0].toUpperCase()}
      </Text>
    </View>
  );
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function ChatScreen() {
  const colors = useColors();
  const { socialUser, login, register, logout } = useSocial();
  const [screen, setScreen] = useState<Screen>("convos");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [convos, setConvos] = useState<Convo[]>([]);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [chatFriend, setChatFriend] = useState<{ id: string; name: string; avatar_url?: string } | null>(null);
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const flatRef = useRef<FlatList>(null);

  useFocusEffect(useCallback(() => {
    if (socialUser) { loadConvos(); if (screen === "chat" && chatFriend) loadMessages(chatFriend.id); }
  }, [socialUser, screen]));

  const loadConvos = useCallback(async () => {
    try { const data = await api.getConversations(); setConvos(data); } catch {}
  }, []);

  const loadMessages = useCallback(async (friendId: string) => {
    try { const data = await api.getMessages(friendId); setMessages(data); setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 100); }
    catch {}
  }, []);

  const loadRequests = useCallback(async () => {
    try { const data = await api.getFriendRequests(); setRequests(data); } catch {}
  }, []);

  const handleAuth = useCallback(async (mode: "login" | "register") => {
    setAuthLoading(true);
    try {
      if (mode === "login") await login(email, password);
      else await register({ name, email, password });
    } catch (e: any) { Alert.alert("Error", e.message); }
    finally { setAuthLoading(false); }
  }, [email, password, name, login, register]);

  const handleSearch = useCallback(async () => {
    if (!searchQ.trim()) return;
    setLoading(true);
    try { const data = await api.searchUsers(searchQ); setSearchResults(data); }
    catch {} finally { setLoading(false); }
  }, [searchQ]);

  const handleSendRequest = useCallback(async (userId: string) => {
    try {
      await api.sendFriendRequest(userId);
      setSearchResults(prev => prev.filter(u => u.id !== userId));
      Alert.alert("¡Listo!", "Solicitud enviada");
    } catch (e: any) { Alert.alert("Error", e.message); }
  }, []);

  const handleAccept = useCallback(async (requestId: string) => {
    try {
      await api.acceptFriendRequest(requestId);
      setRequests(prev => prev.filter(r => r.id !== requestId));
      loadConvos();
    } catch (e: any) { Alert.alert("Error", e.message); }
  }, [loadConvos]);

  const openChat = useCallback((friend: { id: string; name: string; avatar_url?: string }) => {
    setChatFriend(friend);
    setScreen("chat");
    loadMessages(friend.id);
  }, [loadMessages]);

  const handleSend = useCallback(async () => {
    if (!msgText.trim() || !chatFriend) return;
    setSending(true);
    const tempMsg: Msg = { id: Date.now().toString(), content: msgText.trim(), sender_id: socialUser!.id, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    setMsgText("");
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
    try { const real = await api.sendMessage(chatFriend.id, tempMsg.content); setMessages(prev => prev.map(m => m.id === tempMsg.id ? real : m)); }
    catch { setMessages(prev => prev.filter(m => m.id !== tempMsg.id)); Alert.alert("Error", "No se pudo enviar"); }
    finally { setSending(false); }
  }, [msgText, chatFriend, socialUser]);

  if (!socialUser) {
    const isLogin = screen !== "register";
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.authContainer}>
          <View style={[styles.authCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.authHeader}>
              <View style={[styles.authIcon, { backgroundColor: colors.primary + "22" }]}>
                <Ionicons name="people" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.authTitle, { color: colors.foreground }]}>BroGym Social</Text>
              <Text style={[styles.authSub, { color: colors.mutedForeground }]}>Conecta con otros atletas</Text>
            </View>

            <View style={styles.authToggle}>
              {(["login", "register"] as const).map(mode => (
                <TouchableOpacity key={mode} onPress={() => setScreen(mode)}
                  style={[styles.toggleBtn, { backgroundColor: screen === mode ? colors.primary : "transparent" }]}>
                  <Text style={[styles.toggleText, { color: screen === mode ? "#fff" : colors.mutedForeground }]}>
                    {mode === "login" ? "Iniciar Sesión" : "Registrarse"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {screen === "register" && (
              <TextInput style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Nombre" placeholderTextColor={colors.mutedForeground}
                value={name} onChangeText={setName} autoCapitalize="words" />
            )}
            <TextInput style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Correo electrónico" placeholderTextColor={colors.mutedForeground}
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Contraseña" placeholderTextColor={colors.mutedForeground}
              value={password} onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity onPress={() => handleAuth(screen as "login" | "register")} disabled={authLoading}
              style={[styles.authBtn, { backgroundColor: colors.primary }]}>
              {authLoading ? <ActivityIndicator color="#fff" /> :
                <Text style={styles.authBtnText}>{screen === "login" ? "Entrar" : "Crear cuenta"}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "chat" && chatFriend) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.chatHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => { setScreen("convos"); loadConvos(); }} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Avatar uri={chatFriend.avatar_url} name={chatFriend.name} size={34} />
          <Text style={[styles.chatTitle, { color: colors.foreground }]}>{chatFriend.name}</Text>
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={m => m.id}
            contentContainerStyle={styles.msgList}
            renderItem={({ item }) => {
              const isMine = item.sender_id === socialUser.id;
              return (
                <View style={[styles.msgBubble, isMine ? styles.msgRight : styles.msgLeft,
                  { backgroundColor: isMine ? colors.primary : colors.card }]}>
                  <Text style={[styles.msgText, { color: isMine ? "#fff" : colors.foreground }]}>{item.content}</Text>
                  <Text style={[styles.msgTime, { color: isMine ? "rgba(255,255,255,0.6)" : colors.mutedForeground }]}>
                    {timeAgo(item.created_at)}
                  </Text>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.centerMsg}>
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Di hola a {chatFriend.name} 👋</Text>
              </View>
            }
          />
          <View style={[styles.inputRow, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <TextInput
              style={[styles.msgInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Mensaje..." placeholderTextColor={colors.mutedForeground}
              value={msgText} onChangeText={setMsgText} multiline
            />
            <TouchableOpacity onPress={handleSend} disabled={!msgText.trim() || sending}
              style={[styles.sendBtn, { backgroundColor: msgText.trim() ? colors.primary : colors.border }]}>
              {sending ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={16} color="#fff" />}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.topTitle, { color: colors.foreground }]}>Chat</Text>
        <View style={styles.topActions}>
          <TouchableOpacity onPress={() => { setScreen("search"); setSearchResults([]); setSearchQ(""); }} style={styles.iconBtn}>
            <Ionicons name="person-add-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { loadRequests(); setScreen("requests"); }} style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={requests.length ? "#FF9F0A" : colors.mutedForeground} />
            {requests.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{requests.length}</Text></View>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert("Cerrar sesión", "¿Salir de BroGym Social?", [
            { text: "Cancelar" }, { text: "Salir", style: "destructive", onPress: logout }
          ])} style={styles.iconBtn}>
            <Ionicons name="log-out-outline" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      {screen === "search" && (
        <View style={{ flex: 1 }}>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity onPress={() => setScreen("convos")}><Ionicons name="chevron-back" size={22} color={colors.foreground} /></TouchableOpacity>
            <TextInput style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Buscar atletas..." placeholderTextColor={colors.mutedForeground}
              value={searchQ} onChangeText={setSearchQ} onSubmitEditing={handleSearch} returnKeyType="search" autoFocus />
            <TouchableOpacity onPress={handleSearch}>
              <Ionicons name="search" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {loading ? <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} /> :
            <FlatList data={searchResults} keyExtractor={u => u.id} contentContainerStyle={{ padding: 12 }}
              renderItem={({ item }) => (
                <View style={[styles.userRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Avatar uri={item.avatar_url} name={item.name} size={42} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.userName, { color: colors.foreground }]}>{item.name}</Text>
                    {item.bio ? <Text style={[styles.userBio, { color: colors.mutedForeground }]} numberOfLines={1}>{item.bio}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => handleSendRequest(item.id)}
                    style={[styles.addBtn, { backgroundColor: colors.primary }]}>
                    <Ionicons name="person-add" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={searchQ ? <Text style={[styles.emptyText, { color: colors.mutedForeground, textAlign: "center", marginTop: 40 }]}>Sin resultados</Text> : null}
            />
          }
        </View>
      )}

      {screen === "requests" && (
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => setScreen("convos")} style={{ padding: 12, flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="chevron-back" size={20} color={colors.foreground} />
            <Text style={[{ marginLeft: 4, fontFamily: "Inter_600SemiBold", color: colors.foreground }]}>Solicitudes de amistad</Text>
          </TouchableOpacity>
          <FlatList data={requests} keyExtractor={r => r.id} contentContainerStyle={{ padding: 12 }}
            renderItem={({ item }) => (
              <View style={[styles.userRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Avatar uri={item.requester?.avatar_url} name={item.requester?.name} size={42} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.userName, { color: colors.foreground }]}>{item.requester?.name}</Text>
                  <Text style={[styles.userBio, { color: colors.mutedForeground }]}>{timeAgo(item.created_at)}</Text>
                </View>
                <TouchableOpacity onPress={() => handleAccept(item.id)}
                  style={[styles.addBtn, { backgroundColor: "#30D158" }]}>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.mutedForeground, textAlign: "center", marginTop: 40 }]}>Sin solicitudes pendientes</Text>}
          />
        </View>
      )}

      {screen === "convos" && (
        <FlatList data={convos} keyExtractor={c => c.friend.id}
          onRefresh={loadConvos} refreshing={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openChat(item.friend)}
              style={[styles.convoRow, { borderBottomColor: colors.border }]}>
              <Avatar uri={item.friend.avatar_url} name={item.friend.name} size={48} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.convoName, { color: colors.foreground }]}>{item.friend.name}</Text>
                <Text style={[styles.convoLast, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {item.last_message?.content ?? "Empieza la conversación"}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                {item.last_message && <Text style={[styles.convoTime, { color: colors.mutedForeground }]}>{timeAgo(item.last_message.created_at)}</Text>}
                {item.unread > 0 && (
                  <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sin chats aún</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Busca otros atletas con el botón de arriba y envía solicitudes de amistad.
              </Text>
            </View>
          }
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  topTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  topActions: { flexDirection: "row", gap: 4 },
  iconBtn: { padding: 8, position: "relative" },
  badge: { position: "absolute", top: 4, right: 4, backgroundColor: "#FF3B5C", borderRadius: 8, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#fff", fontSize: 9, fontFamily: "Inter_700Bold" },
  authContainer: { flex: 1, justifyContent: "center", padding: 20 },
  authCard: { borderRadius: 20, borderWidth: 1, padding: 24 },
  authHeader: { alignItems: "center", marginBottom: 24 },
  authIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  authTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 4 },
  authSub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  authToggle: { flexDirection: "row", borderRadius: 10, overflow: "hidden", marginBottom: 16, backgroundColor: "rgba(255,255,255,0.05)" },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  toggleText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, fontSize: 14, fontFamily: "Inter_400Regular" },
  authBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  authBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  chatHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
  backBtn: { padding: 4 },
  chatTitle: { fontSize: 17, fontFamily: "Inter_700Bold", flex: 1 },
  msgList: { padding: 12, flexGrow: 1, justifyContent: "flex-end" },
  msgBubble: { maxWidth: "78%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 6 },
  msgLeft: { alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  msgRight: { alignSelf: "flex-end", borderBottomRightRadius: 4 },
  msgText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 20 },
  msgTime: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 3, textAlign: "right" },
  inputRow: { flexDirection: "row", alignItems: "center", padding: 10, borderTopWidth: 1, gap: 8 },
  msgInput: { flex: 1, borderWidth: 1, borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8, fontSize: 15, fontFamily: "Inter_400Regular", maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  searchBar: { flexDirection: "row", alignItems: "center", margin: 12, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  userRow: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 8 },
  userName: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
  userBio: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  convoRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  convoName: { fontFamily: "Inter_700Bold", fontSize: 15, marginBottom: 2 },
  convoLast: { fontSize: 13, fontFamily: "Inter_400Regular" },
  convoTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
  unreadBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  unreadText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  centerMsg: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 40 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
});
