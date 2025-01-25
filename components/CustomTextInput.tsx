import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, TextInputProps } from "react-native";

interface CustomTextInputProps extends TextInputProps {
    label?: string;
    error?: string;
    isFocused?: boolean;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
    label,
    error,
    style,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    isFocused && styles.inputFocused,
                    style,
                ]}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholderTextColor="#888"
                {...props}
            />
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
    input: {
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        color: "#000",
        borderWidth: 1,
        borderColor: "#ccc",
    },
    inputFocused: {
        borderColor: "#32CD32",
        borderWidth: 2,
    },
    errorText: {
        color: "red",
        fontSize: 12,
        marginTop: 5,
    },
});

export default CustomTextInput;
