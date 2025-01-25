import React, { useState } from "react";
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInputProps,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

interface CustomPasswordInputProps extends TextInputProps {
    label?: string;
    error?: string;
    isFocused?: boolean;
}

const CustomPasswordInput: React.FC<CustomPasswordInputProps> = ({
    label,
    error,
    style,
    ...props
}) => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View
                style={[
                    styles.passwordContainer,
                    isFocused && styles.inputFocused,
                ]}
            >
                <TextInput
                    style={[styles.passwordInput, style]}
                    secureTextEntry={!passwordVisible}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholderTextColor="#888"
                    {...props}
                />
                <TouchableOpacity
                    onPress={() => setPasswordVisible(!passwordVisible)}
                >
                    <Icon
                        name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#888"
                    />
                </TouchableOpacity>
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        color: "#888",
        marginBottom: 5,
        fontWeight: "bold"
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        paddingHorizontal: 10,
    },
    inputFocused: {
        borderColor: "#32CD32",
        borderWidth: 2,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
        color: "#000",
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: 5,
    },
});

export default CustomPasswordInput;
