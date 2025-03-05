import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import { BASE_URL } from "@env";
import CustomTextInput from "@/components/CustomTextInput";
import CustomPasswordInput from "@/components/CustomPasswordInput";
import Toast from "react-native-toast-message";
import { useSocket } from "@/hooks/useSocket";
import { useProfile } from "@/context/ProfileContext";
import { useFocusEffect } from "@react-navigation/native";


export default function EditProfileScreen() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState<string | null>(null);
    const [deleteAvatar, setDeleteAvatar] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { profile } = useProfile();

    const router = useRouter();

    const socket = useSocket(
        profile?.id,
        () => { },
        () => { }
    );

    useFocusEffect(
        useCallback(() => {

            if (socket) {
                socket.connect();
            }

            return () => {
                if (socket) {
                    socket.disconnect();
                }
            };
        }, [socket])
    );

    // Fetch user profile and populate fields
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = await SecureStore.getItemAsync("authToken");
                if (!token) {
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: "Authentication token not found.",
                    });
                    return;
                }

                const response = await fetch(`${BASE_URL}/users/profile`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch profile");
                }

                const data = await response.json();
                setName(data.data.name || "");
                setEmail(data.data.email || "");
                setAvatar(data.data.avatar || "https://i.pravatar.cc/300");
            } catch (error) {
                console.error("Error fetching profile:", error);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Unable to load profile information.",
                });
                // Alert.alert("Error", "Unable to load profile information.");
            }
        };

        fetchProfile();
    }, []);

    // Handle avatar change
    const handleChooseAvatar = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Toast.show({
                type: "info",
                text1: "Permission Denied",
                text2: "You need to allow access to your media library.",
            });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,  // Reduce quality to 70%
            base64: false,
        });

        if (!result.canceled && result.assets?.length > 0) {
            setAvatar(result.assets[0].uri);
            setDeleteAvatar(false); // Ensure deleteAvatar is reset
        }
    };

    // Remove avatar
    const handleRemoveAvatar = () => {
        setAvatar(null);
        setDeleteAvatar(true);
    };

    // Update profile function
    const handleSave = async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync("authToken");
            if (!token) {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Authentication token not found..",
                });
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append("name", name);
            formData.append("email", email);

            // Handle avatar logic
            if (deleteAvatar) {
                formData.append("deleteAvatar", "true");
            } else if (avatar) {
                const uriParts = avatar.split(".");
                const fileType = uriParts[uriParts.length - 1];
                formData.append("avatar", {
                    uri: avatar,
                    name: `avatar.${fileType}`,
                    type: `image/${fileType}`,
                } as unknown as Blob);
            }

            if (oldPassword && newPassword) {
                formData.append("oldPassword", oldPassword);
                formData.append("newPassword", newPassword);
            }

            const response = await fetch(`${BASE_URL}/users/update`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to update profile");
            }

            Toast.show({
                type: "success",
                text1: "Success",
                text2: "Profile updated successfully.",
            });
            router.back();
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error updating profile:", error.message);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: error.message,
                });
            } else {
                console.error("Unknown error:", error);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "An unexpected error occurred.",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Loading Overlay */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#32CD32" />
                    <Text style={styles.loadingText}>Updating profile...</Text>
                </View>
            )}
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Edit Profile</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.screenBody}>
                    {/* Profile Section */}
                    <View style={styles.profileSection}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={avatar ? { uri: avatar } : require('@/assets/images/avatar.png')}
                                style={styles.avatar}
                            />
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={handleChooseAvatar}
                            >
                                <MaterialIcons name="add" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        {avatar && (
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={handleRemoveAvatar}
                            >
                                <Text style={styles.removeText}>Remove Avatar</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Input Fields */}
                    <View style={styles.form}>
                        <CustomTextInput
                            label="Name"
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                        />
                        <CustomTextInput
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                        />
                        {/* <CustomPasswordInput
                            label="Old Password"
                            value={oldPassword}
                            onChangeText={setOldPassword}
                            placeholder="Enter old password"
                        />
                        <CustomPasswordInput
                            label="New Password"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Enter new password"
                        /> */}
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => router.back()}
                            disabled={loading}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            <Text style={styles.saveText}>
                                {loading ? "Saving..." : "Save Update"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    content: { paddingBottom: 20 },
    screenBody: { paddingHorizontal: 16 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#32CD32",
        paddingHorizontal: 16,
        paddingTop: 30,
        paddingBottom: 20,
    },
    title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
    profileSection: { alignItems: "center", marginVertical: 20 },
    avatarWrapper: { position: "relative" },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#ddd" },
    addButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#32CD32",
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    form: { marginVertical: 20 },
    buttons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        marginBottom: 20,
    },
    cancelButton: {
        backgroundColor: "#d3d3d3",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flex: 1,
        marginRight: 10,
        alignItems: "center",
    },
    saveButton: {
        backgroundColor: "#32CD32",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flex: 1,
        marginLeft: 10,
        alignItems: "center",
    },
    cancelText: { fontSize: 16, color: "#000", fontWeight: "500" },
    saveText: { fontSize: 16, color: "#fff", fontWeight: "500" },
    removeButton: {
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#ff4d4d",
        borderRadius: 8,
    },
    removeText: {
        color: "#fff",
        fontWeight: "500",
        fontSize: 14,
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
