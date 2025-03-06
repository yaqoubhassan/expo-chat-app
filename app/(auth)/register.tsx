import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import CustomSubmitButton from "@/components/CustomSubmitButton";
import Logo from "@/components/Logo";
import { BASE_URL } from "@env";
import Toast from "react-native-toast-message";
import CustomTextInput from "@/components/CustomTextInput";
import CustomPasswordInput from "@/components/CustomPasswordInput";

// Define a type for validation errors
type ValidationErrors = {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
};

export default function RegisterScreen() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState(false)

    const validateFields = (): ValidationErrors => {
        const errors: ValidationErrors = {};
        if (!name.trim()) errors.name = "Full name is required.";
        if (!email.trim()) errors.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email format.";
        if (!password) errors.password = "Password is required.";
        if (!confirmPassword) errors.confirmPassword = "Confirm password is required.";
        if (password && confirmPassword && password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
        }
        return errors;
    };

    const handleRegister = async () => {
        const errors = validateFields();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors({}); // Clear errors if validation passes
        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    confirmPassword
                }),
            });

            const data = await response.json();
            if (response.ok) {
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Registration successful! Please verify your email.",
                });
                router.push({ pathname: "/(auth)/verifyEmail", params: { email }, });
            } else {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: data.message || "Registration failed",
                });
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "An unexpected error occurred",
            });
        } finally {
            setLoading(false); // Hide loading indicator
        }

    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Blur screen and show loading indicator */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#32CD32" />
                    <Text style={styles.loadingText}>Registering...</Text>
                </View>
            )}
            <Logo />
            <Text style={styles.heading}>Sign Up</Text>
            <View style={styles.inputContainer}>
                <CustomTextInput
                    value={name}
                    placeholder="Full Name"
                    onChangeText={setName}
                    error={validationErrors.name}
                />

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

                <CustomPasswordInput
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    error={validationErrors.confirmPassword}
                />

            </View>

            <CustomSubmitButton title="Sign Up" onPress={handleRegister} />

            <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.signUpLink}>Sign In</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        paddingBottom: 20
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
    inputField: {
        marginBottom: 10,
    },
    input: {
        // backgroundColor: "#f0f8f0",
        borderRadius: 8,
        padding: 15,
        marginBottom: 5,
        fontSize: 16,
        color: "#000",
        borderWidth: 1,
        borderColor: "#ccc",
    },
    inputFocused: {
        borderColor: "#32CD32",
        borderWidth: 2
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        // backgroundColor: "#f0f8f0",
        borderRadius: 8,
        marginBottom: 5,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
        color: "#000",
    },
    eyeButton: {
        paddingHorizontal: 10,
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginBottom: 15,
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
