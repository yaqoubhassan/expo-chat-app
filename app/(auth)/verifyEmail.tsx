import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    ScrollView
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import CustomSubmitButton from "@/components/CustomSubmitButton";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import Logo from "@/components/Logo";
import { BASE_URL } from "@env";

export default function VerifyEmailScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const [otp, setCode] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(10);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const confettiRef = useRef<ConfettiCannon | null>(null);

    const inputs: any = {};

    const saveToken = async (token: string) => {
        try {
            await SecureStore.setItemAsync("authToken", token);
            console.log("Token saved successfully");
        } catch (error) {
            console.error("Failed to save token:", error);
        }
    };

    const handleChange = (text: string, index: number) => {
        const updatedCode = [...otp];
        updatedCode[index] = text;
        setCode(updatedCode);

        if (text && index < otp.length - 1) {
            const nextInput = `input-${index + 1}`;
            const nextRef = inputs[nextInput];
            if (nextRef) {
                nextRef.focus();
            }
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            const prevInput = `input-${index - 1}`;
            const prevRef = inputs[prevInput];
            if (prevRef) {
                prevRef.focus();
            }

            const updatedCode = [...otp];
            updatedCode[index - 1] = "";
            setCode(updatedCode);
        }
    };

    const verifyCode = async () => {
        const enteredCode = otp.join("");
        if (enteredCode.length < 6) {
            Toast.show({
                type: "error",
                text1: "Invalid Code",
                text2: "Please enter a valid 6-digit code.",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/auth/verify-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, otp: enteredCode }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.data.token) {
                    await saveToken(data.data.token);
                }
                Toast.show({
                    type: "success",
                    text1: "Verification Successful",
                    text2: "You have been successfully verified!",
                });
                router.push("/");
            } else {
                Toast.show({
                    type: "error",
                    text1: "Verification Failed",
                    text2: data.message || "Invalid verification code.",
                });
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "An unexpected error occurred.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resendCode = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/auth/resend-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setTimer(10);
                setResendDisabled(true);

                if (confettiRef.current) {
                    confettiRef.current.start();
                }

                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Verification code resent successfully!",
                });
            } else {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: data.message || "Failed to resend code.",
                });
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "An unexpected error occurred.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        } else {
            setResendDisabled(false);
        }
    }, [timer]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
    };

    return (
        <>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView contentContainerStyle={styles.container}>
                    <Logo />
                    <Text style={styles.heading}>Verification</Text>
                    <Text style={styles.subheading}>A verification code has been sent to</Text>
                    <Text style={styles.email}>{(email as string).toLowerCase()}</Text>

                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                style={styles.otpInput}
                                value={digit}
                                onChangeText={(text) => handleChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                ref={(input) => (inputs[`input-${index}`] = input)}
                            />
                        ))}
                    </View>

                    <CustomSubmitButton title="Next" onPress={verifyCode} />

                    <Text style={styles.timerText}>
                        {timer > 0 ? `Resend code in ${formatTime(timer)}` : "You can now resend the code"}
                    </Text>

                    <TouchableOpacity onPress={resendCode} disabled={resendDisabled}>
                        <Text style={[styles.resendText, resendDisabled && styles.disabledText]}>
                            Resend Verification Code
                        </Text>
                    </TouchableOpacity>

                    <ConfettiCannon
                        count={150}
                        origin={{ x: 0, y: -15 }}
                        autoStart={false}
                        fadeOut={true}
                        ref={confettiRef}
                    />
                </ScrollView>
            </KeyboardAvoidingView>

            {isLoading && (
                <Modal transparent animationType="fade">
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#32CD32" />
                    </View>
                </Modal>
            )}
        </>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    heading: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 10,
    },
    subheading: {
        fontSize: 16,
        color: "#888",
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 20,
    },
    otpContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 30,
        width: "90%",
    },
    otpInput: {
        width: 40,
        height: 50,
        borderWidth: 1,
        borderColor: "#888",
        borderRadius: 10,
        textAlign: "center",
        fontSize: 18,
        color: "#000",
    },
    timerText: {
        fontSize: 14,
        color: "#888",
        marginTop: 20,
    },
    resendText: {
        fontSize: 16,
        color: "#32CD32",
        textDecorationLine: "underline",
        marginTop: 10,
    },
    disabledText: {
        color: "#ccc",
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
});
