import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Logo() {
    return (
        <View style={styles.logoContainer}>
            {/* <Image source={require("./assets/logo.png")} style={styles.logo} /> */}
            <Text style={styles.logoText}>Freedom</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#32CD32',
    },
});
