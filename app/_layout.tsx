import "react-native-reanimated"; // Ensure this is imported first
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { View, Text, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

import Toast, { ToastConfig, ToastConfigParams } from "react-native-toast-message";
import { useColorScheme } from "@/hooks/useColorScheme";

import { ProfileProvider } from "@/context/ProfileContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

interface ToastProps {
  type?: String,
  text1?: string;
  text2?: string;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userToken = await SecureStore.getItemAsync("authToken");
        setIsAuthenticated(!!userToken); // Set authentication status
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false); // Assume unauthenticated on error
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const handleNavigation = async () => {
      if (loaded && isAuthenticated !== null) {
        if (!isAuthenticated) {
          router.replace("/(auth)/login");
        }
        await SplashScreen.hideAsync(); // Always hide splash screen
      }
    };

    handleNavigation();
  }, [loaded, isAuthenticated]);

  if (!loaded || isAuthenticated === null) {
    return null; // Wait until fonts and authentication status are resolved
  }

  const toastConfig: ToastConfig = {
    success: ({ type = "success", text1, text2 }: ToastConfigParams<ToastProps>) => (
      <View style={[styles.toastContainer, styles.successToast]}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
      </View>
    ),
    error: ({ type = "error", text1, text2 }: ToastConfigParams<ToastProps>) => (
      <View style={[styles.toastContainer, styles.errorToast]}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
      </View>
    ),
    info: ({ type = "info", text1, text2 }: ToastConfigParams<ToastProps>) => (
      <View style={[styles.toastContainer, styles.infoToast]}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
      </View>
    ),
  };

  return (
    <ProfileProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <Toast config={toastConfig} />
        <StatusBar style="auto" />
      </ThemeProvider>
    </ProfileProvider>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    padding: 15,
    borderRadius: 8,
    width: "90%",
    alignSelf: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  successToast: {
    backgroundColor: "green",
  },
  errorToast: {
    backgroundColor: "red",
  },
  infoToast: {
    backgroundColor: "yellow"
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  toastMessage: {
    fontSize: 14,
    color: "white",
  },
});
