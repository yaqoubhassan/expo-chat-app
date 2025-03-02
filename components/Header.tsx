import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, Dimensions, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface HeaderProps {
    onBackPress: () => void;
    name: string;
    avatar: string;
    activeStatus: string;
}

export const Header: React.FC<HeaderProps> = ({ onBackPress, name, avatar, activeStatus }) => {
    const [showAvatarModal, setShowAvatarModal] = useState(false);

    const openAvatarModal = () => {
        setShowAvatarModal(true);
    };

    const closeAvatarModal = () => {
        setShowAvatarModal(false);
    };

    return (
        <View style={styles.headerContainer}>
            <View style={styles.backButtonAndUserInfo}>
                <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.tint} />
                </TouchableOpacity>

                <View style={styles.userInfoContainer}>
                    <TouchableOpacity onPress={openAvatarModal} activeOpacity={0.7}>
                        <Image source={{ uri: avatar }} style={styles.avatar} />
                    </TouchableOpacity>
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

            {/* Avatar Modal */}
            <Modal
                visible={showAvatarModal}
                transparent={true}
                animationType="fade"
                onRequestClose={closeAvatarModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={closeAvatarModal}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: avatar }}
                                style={styles.largeAvatar}
                                resizeMode="contain"
                            />
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={closeAvatarModal}
                            >
                                <Ionicons name="close-circle" size={36} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const { width, height } = Dimensions.get('window');

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
            ios: 5,
            android: 30,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width * 0.9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        position: 'relative',
    },
    largeAvatar: {
        width: width * 0.9,
        height: width * 0.9,
        borderRadius: 12,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 18,
    },
});