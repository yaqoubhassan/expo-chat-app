import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";

export default function LoginScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Logo */}
            <View style={styles.logoContainer}>
                {/* <Image source={require("./assets/logo.png")} style={styles.logo} /> */}
                <Text style={styles.logoText}>Freedom</Text>
            </View>

            {/* Sign In Heading */}
            <Text style={styles.heading}>Sign In</Text>

            {/* Input Fields */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Phone"
                    keyboardType="phone-pad"
                    placeholderTextColor="#888"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry
                    placeholderTextColor="#888"
                />
            </View>

            {/* Sign In Button */}
            <TouchableOpacity style={styles.signInButton} onPress={() => router.push("/")}>
                <Text style={styles.signInButtonText}>Sign in</Text>
            </TouchableOpacity>

            {/* Forgot Password and Sign Up Links */}
            <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don’t have an account? </Text>
                <TouchableOpacity>
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
    logoContainer: {
        alignItems: "center",
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        resizeMode: "contain",
    },
    logoText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
        marginTop: 10,
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
    input: {
        backgroundColor: "#f0f8f0",
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
        color: "#000",
    },
    signInButton: {
        backgroundColor: "#32CD32",
        borderRadius: 8,
        paddingVertical: 15,
        paddingHorizontal: 80,
        marginBottom: 15,
    },
    signInButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
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
});
