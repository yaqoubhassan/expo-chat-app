// UserItem.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { User } from "@/types/User"; // Adjust the path if necessary
import { useRouter } from "expo-router";

interface UserItemProps {
    item: User;
    isOnline: boolean;
}

const UserItem: React.FC<UserItemProps> = ({ item, isOnline }) => {

    const router = useRouter();
    return (
        <TouchableOpacity style={styles.userItem} onPress={() => router.push({
            pathname: `/(tabs)/(chat)/[userId]`,
            params: { userId: item._id, name: item.name, avatar: item.avatar, receiverId: item._id }
        })}>
            <View style={styles.avatarContainer}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                {isOnline && <View style={styles.activeIndicator} />}
            </View>
            <View style={styles.userDetails}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                    {item.email}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    userItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#EEEEEE",
    },
    avatarContainer: {
        marginRight: 12,
        position: "relative",
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    activeIndicator: {
        width: 15,
        height: 15,
        backgroundColor: "#32CD32",
        borderRadius: 10,
        position: "absolute",
        bottom: 2,
        right: 2,
        borderWidth: 2,
        borderColor: "#fff",
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    userEmail: {
        fontSize: 14,
        color: "#888888",
    },
});

export default UserItem;
