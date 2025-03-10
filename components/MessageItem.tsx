import React, { memo } from "react";
import { View, Text, Image, StyleSheet, Alert, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Message } from "@/types/MessageTypes";

interface MessageItemProps {
    message: Message;
    onEditPress: (message: Message) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onEditPress }) => {
    const isSent = message.type === "sent";
    const formattedTime = message.createdAt
        ? new Date(message.createdAt).toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })
        : "N/A";

    const handleLongPress = () => {
        // Only allow editing sent messages
        if (isSent) {
            Alert.alert(
                "Message Options",
                "What would you like to do?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Edit",
                        onPress: () => onEditPress(message)
                    },
                    // You can add delete option here as well
                ]
            );
        }
    };
    return (
        <TouchableOpacity onLongPress={handleLongPress}
            delayLongPress={500}
            activeOpacity={0.9}>
            <View style={[styles.messageContainer, isSent && { justifyContent: "flex-end", }]}>
                <View style={isSent ? styles.messageRight : styles.messageleft}>
                    <Text style={isSent ? { color: "#000" } : { color: "#000" }}>
                        {message.text}
                        {message.isEdited && <Text style={styles.editedText}> (edited)</Text>}
                    </Text>
                    <View style={styles.sentTime}>
                        <Text style={styles.timestamp}>{formattedTime}</Text>

                        {isSent && (
                            <MaterialIcons
                                name={message.read ? "done-all" : "done"}
                                size={16}
                                color={message.read ? "#32CD32" : "#6b6b6b"}
                                style={styles.readIcon}
                            />
                        )}
                    </View>

                    <View style={isSent ? styles.rightArrowBorder : styles.leftArrowBorder}></View>
                    <View style={isSent ? styles.rightArrow : styles.leftArrow}></View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    messageContainer: {
        flexDirection: "row",
        marginVertical: 8,
        marginHorizontal: 5,
    },
    messageRight: {
        backgroundColor: "#D9FDD3",
        maxWidth: "90%",
        minWidth: "20%",
        padding: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#D9FDD3",
        position: "relative",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    messageleft: {
        backgroundColor: "#f6f9f3",
        color: "#fff",
        maxWidth: "90%",
        minWidth: "20%",
        padding: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#f6f9f3",
        position: "relative",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    rightArrow: {
        position: "absolute",
        top: -1,
        right: -10,
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "#D9FDD3",
    },
    leftArrow: {
        position: "absolute",
        top: -1,
        left: -10,
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "#f6f9f3",
    },
    rightArrowBorder: {
        position: "absolute",
        top: -1,
        right: -10,
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,
        borderStyle: "solid",
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "#ccc",
    },
    leftArrowBorder: {
        position: "absolute",
        top: -1,
        left: -10,
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,
        borderStyle: "solid",
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "#ccc",
    },
    timestamp: {
        fontSize: 12,
        color: "#6b6b6b",
    },
    readIcon: {
        marginLeft: 5,
    },
    sentTime: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 5
    },
    editedText: {
        fontSize: 11,
        fontStyle: 'italic',
        color: '#6b6b6b',
    },
});

// export default memo(MessageItem);

export default memo(MessageItem, (prevProps, nextProps) => {
    return prevProps.message.id === nextProps.message.id &&
        prevProps.message.read === nextProps.message.read &&
        prevProps.message.text === nextProps.message.text &&
        prevProps.message.isEdited === nextProps.message.isEdited;
});
