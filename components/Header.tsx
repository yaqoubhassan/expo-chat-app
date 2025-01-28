import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Platform } from "react-native";

interface HeaderProps {
    onBackPress: () => void;
    name: string;
    avatar: string;
    activeStatus: string;
}

export const Header: React.FC<HeaderProps> = ({ onBackPress, name, avatar, activeStatus }) => {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.backButtonAndUserInfo}>
                <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.tint} />
                </TouchableOpacity>

                <View style={styles.userInfoContainer}>
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                    <View>
                        <Text style={styles.userName}>{name}</Text>
                        <Text style={styles.activeStatus}>{activeStatus}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="call" size={24} color={Colors.light.tint} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.iconButton, { marginLeft: 20 }]}>
                    <Ionicons name="videocam" size={24} color={Colors.light.tint} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 8,
        backgroundColor: Colors.light.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
        paddingTop: Platform.select({
            ios: 5, // Set paddingTop to 10 for iOS
            android: 30, // Default or other value for Android
        }),
    },
    backButtonAndUserInfo: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    backButton: {
        marginRight: 12,
    },
    userInfoContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 35,
        height: 35,
        borderRadius: 20,
        marginRight: 8,
    },
    userName: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.light.text,
    },
    activeStatus: {
        fontSize: 12,
        color: Colors.light.subtext,
    },
    actionsContainer: {
        flexDirection: "row",
    },
    iconButton: {
        marginLeft: 16,
    },
});
