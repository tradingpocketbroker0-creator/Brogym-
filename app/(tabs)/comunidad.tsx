import React, { useState, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Image,
  StyleSheet, FlatList, RefreshControl, ActivityIndicator, Alert, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useSocial } from "@/context/SocialContext";
import { api } from "@/services/api";
import { useFocusEffect } from "expo-router";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author_name?: string;
  author_avatar?: string;
}

interface Post {
  id: string;
  content?: string;
  image_url?: string;
  post_type?: string;
  likes_count: number;
  liked_by_me: boolean;
  comments_count: number;
  created_at: string;
  user_id: string;
  author_name?: string;
  author_avatar?: string;
}

interface Story {
  id: string;
  image_url?: string;
  text_content?: string;
  user_id: string;
  author_name?: string;
  author_avatar?: string;
  expires_at?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function Avatar({ uri, name, size = 36 }: { uri?: string; name?: string; size?: number }) {
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

function StoryBubble({ story, onPress }: { story: Story; onPress: () => void }) {
  const colors = useColors();
  return (
    <TouchableOpacity onPress={onPress} style={styles.storyBubble}>
      <View style={[styles.storyRing, { borderColor: colors.primary }]}>
        <Avatar uri={story.author_avatar} name={story.author_name} size={52} />
      </View>
      <Text style={[styles.storyName, { color: colors.mutedForeground }]} numberOfLines={1}>
        {story.author_name?.split(" ")[0] ?? "?"}
      </Text>
    </TouchableOpacity>
  );
}

function CommentsModal({ post, myId, visible, onClose }: { post: Post; myId?: string; visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  React.useEffect(() => {
    if (!visible) return;
    setLoading(true);
    api.getComments(post.id).then(setComments).catch(() => {}).finally(() => setLoading(false));
  }, [visible, post.id]);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const c = await api.addComment(post.id, text.trim());
      setComments(prev => [...prev, c]);
      setText("");
    } catch (e: any) { Alert.alert("Error", e.message); }
    finally { setSending(false); }
  };

  const handleDelete = (commentId: string) => {
    Alert.alert("Eliminar comentario", "¿Eliminar este comentario?", [
      { text: "Cancelar" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        setComments(prev => prev.filter(c => c.id !== commentId));
        try { await api.deleteComment(post.id, commentId); } catch {}
      }},
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.cmContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.cmHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="chevron-down" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.cmTitle, { color: colors.foreground }]}>Comentarios</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Post preview */}
        <View style={[styles.cmPostPreview, { borderBottomColor: colors.border }]}>
          <Avatar uri={post.author_avatar} name={post.author_name} size={34} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.authorName, { color: colors.foreground }]}>{post.author_name}</Text>
            {post.content ? <Text style={[styles.cmPostText, { color: colors.mutedForeground }]} numberOfLines={2}>{post.content}</Text> : null}
            {post.image_url ? <Text style={[styles.cmPostText, { color: colors.primary }]}>📷 Foto</Text> : null}
          </View>
        </View>

        {loading
          ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          : (
            <FlatList
              data={comments}
              keyExtractor={c => c.id}
              contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
              ListEmptyComponent={
                <View style={styles.center}>
                  <Ionicons name="chatbubble-outline" size={36} color={colors.border} />
                  <Text style={[styles.emptyText, { color: colors.mutedForeground, marginTop: 10 }]}>Sé el primero en comentar</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={[styles.cmRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Avatar uri={item.author_avatar} name={item.author_name} size={32} />
                  <View style={styles.cmBubble}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={[styles.cmAuthor, { color: colors.foreground }]}>{item.author_name ?? "Usuario"}</Text>
                      <Text style={[styles.cmTime, { color: colors.mutedForeground }]}>{timeAgo(item.created_at)}</Text>
                    </View>
                    <Text style={[styles.cmText, { color: colors.foreground }]}>{item.content}</Text>
                    {item.user_id === myId && (
                      <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ alignSelf: "flex-end", marginTop: 2 }}>
                        <Ionicons name="trash-outline" size={14} color={colors.mutedForeground} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            />
          )
        }

        <View style={[styles.cmInputBar, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
          <TextInput
            style={[styles.cmInput, { color: colors.foreground, backgroundColor: colors.background, borderColor: colors.border }]}
            placeholder="Escribe un comentario…"
            placeholderTextColor={colors.mutedForeground}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!text.trim() || sending}
            style={[styles.cmSendBtn, { backgroundColor: text.trim() ? colors.primary : colors.border }]}
          >
            {sending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="send" size={16} color="#fff" />
            }
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function PostCard({ post, onLike, onDelete, myId }: { post: Post; onLike: (id: string) => void; onDelete: (id: string) => void; myId?: string }) {
  const colors = useColors();
  const isOwn = post.user_id === myId;
  const [showComments, setShowComments] = useState(false);
  const [localCommentsCount, setLocalCommentsCount] = useState(post.comments_count ?? 0);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.postHeader}>
        <Avatar uri={post.author_avatar} name={post.author_name} size={38} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.authorName, { color: colors.foreground }]}>{post.author_name ?? "Usuario"}</Text>
          <Text style={[styles.timeText, { color: colors.mutedForeground }]}>{timeAgo(post.created_at)}</Text>
        </View>
        {isOwn && (
          <TouchableOpacity onPress={() => Alert.alert("Eliminar", "¿Eliminar este post?", [
            { text: "Cancelar" },
            { text: "Eliminar", style: "destructive", onPress: () => onDelete(post.id) }
          ])}>
            <Ionicons name="trash-outline" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>
      {post.content ? (
        <Text style={[styles.postContent, { color: colors.foreground }]}>{post.content}</Text>
      ) : null}
      {post.image_url ? (
        <Image source={{ uri: post.image_url }} style={styles.postImage} resizeMode="cover" />
      ) : null}
      <View style={styles.postActions}>
        <TouchableOpacity onPress={() => onLike(post.id)} style={styles.likeBtn}>
          <Ionicons name={post.liked_by_me ? "heart" : "heart-outline"} size={20} color={post.liked_by_me ? "#FF3B5C" : colors.mutedForeground} />
          <Text style={[styles.likeCount, { color: colors.mutedForeground }]}>{post.likes_count}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowComments(true)}
          style={styles.likeBtn}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.mutedForeground} />
          <Text style={[styles.likeCount, { color: colors.mutedForeground }]}>{localCommentsCount}</Text>
        </TouchableOpacity>
        {post.post_type === "workout" && (
          <View style={[styles.badge, { backgroundColor: colors.primary + "22" }]}>
            <Ionicons name="barbell-outline" size={12} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.primary }]}> Entrenamiento</Text>
          </View>
        )}
      </View>
      <CommentsModal
        post={post}
        myId={myId}
        visible={showComments}
        onClose={() => setShowComments(false)}
      />
    </View>
  );
}

export default function ComunidadScreen() {
  const colors = useColors();
  const { socialUser } = useSocial();
  const [feed, setFeed] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showComposer, setShowComposer] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [feedData, storyData] = await Promise.all([api.getFeed(), api.getStories()]);
      setFeed(feedData);
      setStories(storyData);
    } catch (e: any) {
      console.warn("Error loading feed:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleRefresh = useCallback(() => { setRefreshing(true); loadData(); }, [loadData]);

  const handleLike = useCallback(async (postId: string) => {
    setFeed(prev => prev.map(p => p.id === postId
      ? { ...p, liked_by_me: !p.liked_by_me, likes_count: p.liked_by_me ? p.likes_count - 1 : p.likes_count + 1 }
      : p));
    try { await api.likePost(postId); } catch {}
  }, []);

  const handleDelete = useCallback(async (postId: string) => {
    setFeed(prev => prev.filter(p => p.id !== postId));
    try { await api.deletePost(postId); } catch {}
  }, []);

  const pickImage = useCallback(async () => {
    try {
      const ImagePicker = require("expo-image-picker");
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert("Permiso requerido", "Activa el acceso a fotos en Ajustes."); return; }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setShowComposer(true);
      }
    } catch (e: any) { Alert.alert("Error", e.message); }
  }, []);

  const handlePost = useCallback(async () => {
    if (!newPost.trim() && !selectedImage) return;
    setPosting(true);
    try {
      const post = await api.createPost({
        content: newPost.trim() || undefined,
        image_url: selectedImage || undefined,
      });
      const enriched = {
        ...post, liked_by_me: false, likes_count: 0,
        author_name: socialUser?.name, author_avatar: socialUser?.avatar_url,
      };
      setFeed(prev => [enriched, ...prev]);
      setNewPost("");
      setSelectedImage(null);
      setShowComposer(false);
    } catch (e: any) { Alert.alert("Error", e.message); }
    finally { setPosting(false); }
  }, [newPost, selectedImage, socialUser]);

  if (!socialUser) return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <Ionicons name="people-outline" size={48} color={colors.primary} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Red Social</Text>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          Inicia sesión en la red social desde el tab de Chat para conectar con otros.
        </Text>
      </View>
    </SafeAreaView>
  );

  const uniqueStories = stories.reduce((acc: Story[], s) => {
    if (!acc.find(x => x.user_id === s.user_id)) acc.push(s);
    return acc;
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={feed}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.title, { color: colors.foreground }]}>Comunidad</Text>
              <Ionicons name="globe-outline" size={22} color={colors.primary} />
            </View>

            {uniqueStories.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesRow}>
                {uniqueStories.map(s => (
                  <StoryBubble key={s.id} story={s} onPress={() => setSelectedStory(s)} />
                ))}
              </ScrollView>
            )}

            {/* Caja de publicación */}
            <TouchableOpacity
              onPress={() => setShowComposer(true)}
              activeOpacity={0.85}
              style={[styles.postBox, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Avatar uri={socialUser?.avatar_url} name={socialUser?.name} size={36} />
              <Text style={[styles.postPlaceholder, { color: colors.mutedForeground }]}>
                ¿Qué quieres compartir hoy?
              </Text>
              <View style={styles.postBoxActions}>
                <TouchableOpacity onPress={pickImage} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="image-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowComposer(true)}>
                  <Ionicons name="pencil-outline" size={22} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <PostCard post={item} onLike={handleLike} onDelete={handleDelete} myId={socialUser?.id} />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.center}>
              <Ionicons name="newspaper-outline" size={40} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground, marginTop: 12 }]}>
                Aún no hay posts. ¡Sé el primero!
              </Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* Modal compositor de post */}
      <Modal visible={showComposer} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => { setShowComposer(false); setSelectedImage(null); setNewPost(""); }}>
        <View style={[styles.composerContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.composerHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => { setShowComposer(false); setSelectedImage(null); setNewPost(""); }}>
              <Text style={[styles.composerCancel, { color: colors.mutedForeground }]}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={[styles.composerTitle, { color: colors.foreground }]}>Nueva publicación</Text>
            <TouchableOpacity
              onPress={handlePost}
              disabled={(!newPost.trim() && !selectedImage) || posting}
              style={[styles.composerPostBtn, { backgroundColor: (newPost.trim() || selectedImage) ? colors.primary : colors.border }]}
            >
              {posting
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.composerPostBtnText}>Publicar</Text>
              }
            </TouchableOpacity>
          </View>

          <View style={styles.composerBody}>
            <Avatar uri={socialUser?.avatar_url} name={socialUser?.name} size={42} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.composerName, { color: colors.foreground }]}>{socialUser?.name}</Text>
              <TextInput
                style={[styles.composerInput, { color: colors.foreground }]}
                placeholder="¿Qué quieres compartir?"
                placeholderTextColor={colors.mutedForeground}
                value={newPost}
                onChangeText={setNewPost}
                multiline
                autoFocus
              />
            </View>
          </View>

          {selectedImage && (
            <View style={styles.imagePreviewWrap}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} resizeMode="cover" />
              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                style={styles.imageRemoveBtn}
              >
                <Ionicons name="close-circle" size={26} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.composerToolbar, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
            <TouchableOpacity onPress={pickImage} style={styles.composerTool}>
              <Ionicons name="image-outline" size={24} color={colors.primary} />
              <Text style={[styles.composerToolLabel, { color: colors.primary }]}>Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setNewPost(prev => prev + " 💪"); }}
              style={styles.composerTool}
            >
              <Ionicons name="barbell-outline" size={24} color="#FB8C00" />
              <Text style={[styles.composerToolLabel, { color: "#FB8C00" }]}>Entreno</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setNewPost(prev => prev + " 🔥"); }}
              style={styles.composerTool}
            >
              <Ionicons name="flame-outline" size={24} color="#FF453A" />
              <Text style={[styles.composerToolLabel, { color: "#FF453A" }]}>Motivación</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedStory} transparent animationType="fade" onRequestClose={() => setSelectedStory(null)}>
        <TouchableOpacity style={styles.storyModal} activeOpacity={1} onPress={() => setSelectedStory(null)}>
          <View style={styles.storyModalContent}>
            <Text style={styles.storyModalAuthor}>{selectedStory?.author_name}</Text>
            {selectedStory?.image_url && (
              <Image source={{ uri: selectedStory.image_url }} style={styles.storyModalImage} resizeMode="contain" />
            )}
            {selectedStory?.text_content && (
              <Text style={styles.storyModalText}>{selectedStory.text_content}</Text>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  storiesRow: { paddingLeft: 12, marginBottom: 12 },
  storyBubble: { alignItems: "center", marginRight: 12, width: 68 },
  storyRing: { borderWidth: 2.5, borderRadius: 30, padding: 2, marginBottom: 4 },
  storyName: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  postBox: { flexDirection: "row", alignItems: "center", marginHorizontal: 12, marginBottom: 10, borderRadius: 14, borderWidth: 1, padding: 12, gap: 10 },
  postPlaceholder: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  postBoxActions: { flexDirection: "row", gap: 10, alignItems: "center" },
  postInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 36, maxHeight: 100 },
  sendBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  composerContainer: { flex: 1 },
  composerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  composerTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  composerCancel: { fontSize: 15, fontFamily: "Inter_400Regular" },
  composerPostBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  composerPostBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  composerBody: { flexDirection: "row", padding: 16, gap: 12 },
  composerName: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 6 },
  composerInput: { fontSize: 16, fontFamily: "Inter_400Regular", lineHeight: 22, minHeight: 80 },
  imagePreviewWrap: { marginHorizontal: 16, marginBottom: 12, borderRadius: 14, overflow: "hidden", position: "relative" },
  imagePreview: { width: "100%", height: 220, borderRadius: 14 },
  imageRemoveBtn: { position: "absolute", top: 8, right: 8 },
  composerToolbar: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, gap: 4, position: "absolute", bottom: 0, left: 0, right: 0 },
  composerTool: { flex: 1, alignItems: "center", gap: 4 },
  composerToolLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  card: { marginHorizontal: 12, marginBottom: 10, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  postHeader: { flexDirection: "row", alignItems: "center", padding: 12 },
  authorName: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  timeText: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  postContent: { paddingHorizontal: 12, paddingBottom: 10, fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  postImage: { width: "100%", height: 240 },
  postActions: { flexDirection: "row", alignItems: "center", padding: 10, gap: 12 },
  likeBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  likeCount: { fontSize: 14, fontFamily: "Inter_500Medium" },
  badge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  center: { alignItems: "center", justifyContent: "center", paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  cmContainer: { flex: 1 },
  cmHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  cmTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  cmPostPreview: { flexDirection: "row", alignItems: "flex-start", padding: 12, borderBottomWidth: 1 },
  cmPostText: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  cmRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10, gap: 8 },
  cmBubble: { flex: 1, borderRadius: 12, padding: 10, backgroundColor: "transparent" },
  cmAuthor: { fontSize: 13, fontFamily: "Inter_700Bold" },
  cmTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
  cmText: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4, lineHeight: 20 },
  cmInputBar: { flexDirection: "row", alignItems: "flex-end", padding: 10, gap: 8, borderTopWidth: 1, position: "absolute", bottom: 0, left: 0, right: 0 },
  cmInput: { flex: 1, borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14, fontFamily: "Inter_400Regular", maxHeight: 100 },
  cmSendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  storyModal: { flex: 1, backgroundColor: "rgba(0,0,0,0.92)", justifyContent: "center", alignItems: "center" },
  storyModalContent: { width: "90%", alignItems: "center" },
  storyModalAuthor: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 18, marginBottom: 16 },
  storyModalImage: { width: "100%", height: 400, borderRadius: 16 },
  storyModalText: { color: "#fff", fontSize: 18, fontFamily: "Inter_500Medium", marginTop: 16, textAlign: "center" },
});
