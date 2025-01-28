// components/MessageItem.tsx
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

type Message = {
    id: string;
    text: string;
    type: "sent" | "received";
    isError?: boolean;
    media?: string;
    audioDuration?: string;
};

interface MessageItemProps {
    message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
    const isSent = message.type === "sent";

    return (
        <View style={[styles.messageContainer, isSent && { alignItems: "flex-end" }]}>
            {message.audioDuration ? (
                <View style={[styles.message, isSent ? styles.sentMessage : styles.receivedMessage]}>
                    <MaterialIcons name="play-arrow" size={24} color="#fff" />
                    <Text style={styles.audioText}>{message.audioDuration}</Text>
                </View>
            ) : message.media ? (
                <Image
                    source={{ uri: message.media }}
                    style={[styles.media, isSent && { borderColor: "#32CD32" }]}
                />
            ) : (
                <View style={[styles.message, isSent ? styles.sentMessage : styles.receivedMessage]}>
                    <Text style={[styles.messageText, isSent ? styles.sentMessageText : styles.receivedMessageText]}>
                        {message.text}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    messageContainer: {
        marginVertical: 5,
    },
    message: {
        padding: 10,
        borderRadius: 10,
        maxWidth: "75%",
    },
    receivedMessage: {
        backgroundColor: "#32CD32",
        alignSelf: "flex-start",
    },
    sentMessage: {
        backgroundColor: "#D8D8D8",
        alignSelf: "flex-end",
    },
    messageText: {
        fontSize: 14,
    },
    receivedMessageText: {
        color: "#fff",
    },
    sentMessageText: {
        color: "#000",
    },
    media: {
        width: 150,
        height: 150,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#fff",
    },
    audioText: {
        color: "#fff",
        marginLeft: 5,
    },
});

export default MessageItem;
