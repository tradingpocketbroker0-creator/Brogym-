import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

function getBase(): string {
  const dev = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  if (dev) return dev;
  const domain = process.env.REPLIT_DEV_DOMAIN ?? process.env.REPLIT_DOMAINS?.split(",")[0];
  if (domain) return `https://${domain}/api/social`;
  return "/api/social";
}

const BASE = getBase();

async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem("social_token");
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Error del servidor");
  return data;
}

export const api = {
  setBase(url: string) {
    (api as any)._base = url;
  },

  async register(body: { name: string; email: string; password: string; age?: number; gender?: string; weight?: number; height?: number }) {
    return request("/auth/register", { method: "POST", body: JSON.stringify(body) });
  },

  async login(email: string, password: string) {
    return request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  },

  async getMe() {
    return request("/auth/me");
  },

  async updateMe(body: { name?: string; bio?: string; gym?: string; avatar_url?: string }) {
    return request("/auth/me", { method: "PUT", body: JSON.stringify(body) });
  },

  async searchUsers(q: string) {
    return request(`/users/search?q=${encodeURIComponent(q)}`);
  },

  async getUser(id: string) {
    return request(`/users/${id}`);
  },

  async getFriends() {
    return request("/friends");
  },

  async getFriendRequests() {
    return request("/friends/requests");
  },

  async sendFriendRequest(targetId: string) {
    return request(`/friends/request/${targetId}`, { method: "POST" });
  },

  async acceptFriendRequest(requestId: string) {
    return request(`/friends/accept/${requestId}`, { method: "POST" });
  },

  async removeFriend(friendshipId: string) {
    return request(`/friends/${friendshipId}`, { method: "DELETE" });
  },

  async exploreUsers(q?: string, goal?: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (goal) params.set("goal", goal);
    return request(`/explore?${params.toString()}`);
  },

  async getFeed() {
    return request("/feed");
  },

  async createPost(body: { content?: string; image_url?: string; post_type?: string }) {
    return request("/posts", { method: "POST", body: JSON.stringify(body) });
  },

  async likePost(postId: string) {
    return request(`/posts/${postId}/like`, { method: "POST" });
  },

  async deletePost(postId: string) {
    return request(`/posts/${postId}`, { method: "DELETE" });
  },

  async getStories() {
    return request("/stories");
  },

  async createStory(body: { image_url?: string; text_content?: string }) {
    return request("/stories", { method: "POST", body: JSON.stringify(body) });
  },

  async getMessages(friendId: string) {
    return request(`/messages/${friendId}`);
  },

  async sendMessage(friendId: string, content: string) {
    return request(`/messages/${friendId}`, { method: "POST", body: JSON.stringify({ content }) });
  },

  async getConversations() {
    return request("/conversations");
  },

  async getComments(postId: string) {
    return request(`/posts/${postId}/comments`);
  },

  async addComment(postId: string, content: string) {
    return request(`/posts/${postId}/comments`, { method: "POST", body: JSON.stringify({ content }) });
  },

  async deleteComment(postId: string, commentId: string) {
    return request(`/posts/${postId}/comments/${commentId}`, { method: "DELETE" });
  },
};

export async function saveToken(token: string) {
  await AsyncStorage.setItem("social_token", token);
}

export async function clearToken() {
  await AsyncStorage.removeItem("social_token");
}
