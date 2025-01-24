import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import CustomSubmitButton from "@/components/CustomSubmitButton";
import Logo from "@/components/Logo";
import CustomTextInput from "@/components/CustomTextInput";
import CustomPasswordInput from "@/components/CustomPasswordInput";
import { BASE_URL } from "@env";
import * as SecureStore from "expo-secure-store";

// Define a type for validation errors
type ValidationErrors = {
    email?: string;
    password?: string;
};

export default function LoginScreen() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState(false);

    const validateFields = (): ValidationErrors => {
        const errors: ValidationErrors = {};
        if (!email.trim()) errors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email format.";
        if (!password.trim()) errors.password = "Password is required.";
        return errors;
    };

    const saveToken = async (token: string) => {
        try {
            await SecureStore.setItemAsync("authToken", token);
            console.log("Token saved successfully");
        } catch (error) {
            console.error("Failed to save token:", error);
        }
    };

    const handleLogin = async () => {
        const errors = validateFields();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors({}); // Clear errors if validation passes
        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                if (data.data.token) {
                    await saveToken(data.data.token);
                }
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Login successful!",
                });
                router.push("/"); // Navigate to the home screen
            } else {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: data.message || "Login failed.",
                });
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "An unexpected error occurred.",
            });
        } finally {
            setLoading(false); // Hide loading indicator
        }
    };

    return (
        <View style={styles.container}>
            {/* Loading Overlay */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#32CD32" />
                    <Text style={styles.loadingText}>Logging in...</Text>
                </View>
            )}

            {/* Logo */}
            <Logo />

            {/* Sign In Heading */}
            <Text style={styles.heading}>Sign In</Text>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
                <CustomTextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    error={validationErrors.email}
                />
                <CustomPasswordInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    error={validationErrors.password}
                />
            </View>

            {/* Sign In Button */}
            <CustomSubmitButton title="Sign In" onPress={handleLogin} />

            {/* Forgot Password and Sign Up Links */}
            <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don’t have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                    <Text style={styles.signUpLink}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 20,
    },
    inputContainer: {
        width: "100%",
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: "#888",
        fontSize: 14,
        textDecorationLine: "underline",
        marginBottom: 20,
    },
    signUpContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    signUpText: {
        fontSize: 14,
        color: "#888",
    },
    signUpLink: {
        fontSize: 14,
        color: "#32CD32",
        fontWeight: "bold",
        textDecorationLine: "underline",
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    loadingText: {
        marginTop: 10,
        color: "#fff",
        fontSize: 16,
    },
});
