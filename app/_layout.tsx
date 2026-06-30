import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { SocialProvider } from "@/context/SocialContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="categoria/[id]"
        options={{
          headerShown: true,
          title: "",
          headerStyle: { backgroundColor: "#0A0A0A" },
          headerTintColor: "#FFFFFF",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="ejercicio/[id]"
        options={{
          headerShown: true,
          title: "",
          headerStyle: { backgroundColor: "#0A0A0A" },
          headerTintColor: "#FFFFFF",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="cronometro"
        options={{
          headerShown: true,
          title: "Cronómetro",
          presentation: "modal",
          headerStyle: { backgroundColor: "#0A0A0A" },
          headerTintColor: "#FFFFFF",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="imc"
        options={{
          headerShown: true,
          title: "Calculadora IMC",
          presentation: "modal",
          headerStyle: { backgroundColor: "#0A0A0A" },
          headerTintColor: "#FFFFFF",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="logros"
        options={{
          headerShown: true,
          title: "Logros",
          headerStyle: { backgroundColor: "#0A0A0A" },
          headerTintColor: "#FFFFFF",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="sesion/[categoryId]"
        options={{
          headerShown: true,
          title: "Sesión",
          headerStyle: { backgroundColor: "#0A0A0A" },
          headerTintColor: "#FFFFFF",
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppProvider>
              <SocialProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <KeyboardProvider>
                    <RootLayoutNav />
                  </KeyboardProvider>
                </GestureHandlerRootView>
              </SocialProvider>
            </AppProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
