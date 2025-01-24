import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { View, Text, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import "react-native-reanimated";

import Toast, { ToastConfig, ToastConfigParams } from "react-native-toast-message";
import { useColorScheme } from "@/hooks/useColorScheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

interface ToastProps {
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
        console.log("Auth Token:", userToken); // Debugging log
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
          console.log("Redirecting to login...");
          router.replace("/(auth)/login");
        } else {
          console.log("User authenticated, proceeding...");
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
    success: ({ text1, text2 }: ToastConfigParams<ToastProps>) => (
      <View style={[styles.toastContainer, styles.successToast]}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
      </View>
    ),
    error: ({ text1, text2 }: ToastConfigParams<ToastProps>) => (
      <View style={[styles.toastContainer, styles.errorToast]}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
      </View>
    ),
  };

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <Toast config={toastConfig} />
      <StatusBar style="auto" />
    </ThemeProvider>
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
