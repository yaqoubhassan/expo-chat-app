import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon'; // Import confetti cannon
import CustomSubmitButton from '@/components/CustomSubmitButton';
import { useRouter } from 'expo-router';
import Toast from "react-native-toast-message";
import Logo from '@/components/Logo';

export default function VerifyEmailScreen() {
    const router = useRouter();
    const [code, setCode] = useState(['', '', '', '', '', '']); // Array to hold OTP digits
    const [timer, setTimer] = useState(10); // Countdown timer in seconds
    const [resendDisabled, setResendDisabled] = useState(true); // Disable resend initially
    const confettiRef = useRef<ConfettiCannon | null>(null); // Correctly typed ref for ConfettiCannon

    const handleChange = (text: string, index: number) => {
        const updatedCode = [...code];
        updatedCode[index] = text;
        setCode(updatedCode);

        // Auto-focus next input
        if (text && index < code.length - 1) {
            const nextInput = `input-${index + 1}`;
            const nextRef = inputs[nextInput];
            if (nextRef) {
                nextRef.focus();
            }
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = `input-${index - 1}`;
            const prevRef = inputs[prevInput];
            if (prevRef) {
                prevRef.focus();
            }

            // Clear the previous field
            const updatedCode = [...code];
            updatedCode[index - 1] = '';
            setCode(updatedCode);
        }
    };

    const inputs: any = {};

    const verifyCode = () => {
        const enteredCode = code.join('');
        console.log('Entered Code:', enteredCode);
        // Add verification logic here
        router.push('/');
    };

    const resendCode = () => {
        console.log('Resending verification code...');
        setTimer(10); // Reset the timer to 2 minutes
        setResendDisabled(true);

        // Trigger confetti animation
        if (confettiRef.current) {
            confettiRef.current.start(); // TypeScript now knows `start` exists
        }

        // Show alert notification
        // Alert.alert('Success', 'Verification code resent successfully!');
        Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Verification code resent successfully!',
        });
    };

    // Countdown timer logic
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        } else {
            setResendDisabled(false); // Enable resend when the timer reaches 0
        }
    }, [timer]);

    // Format timer into MM:SS
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Logo />
            <Text style={styles.heading}>Verification</Text>
            <Text style={styles.subheading}>A verification code has been sent</Text>
            <Text style={styles.phoneNumber}>+1 18577 11111</Text>

            <View style={styles.otpContainer}>
                {code.map((digit, index) => (
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

            {/* Countdown Timer */}
            <Text style={styles.timerText}>
                {timer > 0 ? `Resend code in ${formatTime(timer)}` : 'You can now resend the code'}
            </Text>

            {/* Resend Code Link */}
            <TouchableOpacity onPress={resendCode} disabled={resendDisabled}>
                <Text style={[styles.resendText, resendDisabled && styles.disabledText]}>
                    Resend Verification Code
                </Text>
            </TouchableOpacity>

            {/* Confetti Animation */}
            <ConfettiCannon
                count={150}
                origin={{ x: 0, y: -15 }}
                autoStart={false}
                fadeOut={true}
                ref={confettiRef}
            />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        fontSize: 50,
        color: '#32CD32',
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 10,
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    },
    subheading: {
        fontSize: 16,
        color: '#888',
        marginBottom: 5,
    },
    phoneNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        width: '90%',
    },
    otpInput: {
        width: 40,
        height: 50,
        borderWidth: 1,
        borderColor: '#888',
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 18,
        color: '#000',
    },
    timerText: {
        fontSize: 14,
        color: '#888',
        marginTop: 20,
    },
    resendText: {
        fontSize: 16,
        color: '#32CD32',
        textDecorationLine: 'underline',
        marginTop: 10,
    },
    disabledText: {
        color: '#ccc',
    },
});
