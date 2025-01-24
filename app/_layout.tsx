import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { View, Text, StyleSheet } from "react-native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import Toast, { ToastConfig, ToastConfigParams } from "react-native-toast-message";
import { useColorScheme } from "@/hooks/useColorScheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Define types for the Toast properties
interface ToastProps {
  text1?: string; // Making text1 optional
  text2?: string; // Making text2 optional
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Custom toast configuration with proper types
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
