import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogout = async () => {
        try {
            await SecureStore.deleteItemAsync("authToken");
            setIsLoggedIn(false);
            // setUser(null);
            Toast.show({
                type: "success",
                text1: "Success",
                text2: "You have been logged out.",
            });
            router.replace("/(auth)/login");
        } catch (error) {
            console.error("Logout error:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to log out. Please try again",
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
                {/* <TouchableOpacity>
                        <MaterialIcons name="settings" size={24} color="#fff" />
                        </TouchableOpacity> */}
            </View>
            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.screenBody}>
                    {/* Profile Section */}
                    <View style={styles.profileSection}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={{ uri: 'https://i.pravatar.cc/300' }}
                                style={styles.avatar}
                            />
                            <TouchableOpacity style={styles.addButton}>
                                <MaterialIcons name="add" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.name}>Annette Black</Text>
                    </View>

                    {/* User Info */}
                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>User ID</Text>
                            <Text style={styles.infoValue}>@annette.me</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Location</Text>
                            <Text style={styles.infoValue}>New York, NYC</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phone</Text>
                            <Text style={styles.infoValue}>(239) 555-0108</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Email Address</Text>
                            <Text style={styles.infoValue}>demo@mail.com</Text>
                        </View>
                    </View>

                    {/* Edit Profile Button */}
                    <TouchableOpacity style={styles.editProfileButton} onPress={() => router.push("/(tabs)/(editProfile)/[userId]")}>
                        <Text style={styles.editProfileText}>Edit profile</Text>
                    </TouchableOpacity>

                    {/* Logout Button */}
                    <View style={styles.logoutButtonContainer}>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={24} color="#d32f2f" style={{ transform: [{ rotate: '180deg' }] }} />
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    content: {
        paddingBottom: 20,
    },
    screenBody: {
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#32CD32',
        paddingHorizontal: 16,
        paddingTop: 30,
        paddingBottom: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    addButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#32CD32',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#000',
    },
    infoSection: {
        marginVertical: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    infoLabel: {
        fontSize: 16,
        color: '#666',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    editProfileButton: {
        backgroundColor: '#32CD32',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    editProfileText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
    logoutButtonContainer: {
        marginTop: 70,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        // backgroundColor: '#FF6347',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        width: '40%',
        borderWidth: 1,
        borderColor: '#d32f2f'
    },
    logoutText: {
        fontSize: 16,
        color: '#d32f2f',
        fontWeight: '500',
    },
});
