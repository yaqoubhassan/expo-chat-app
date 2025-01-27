import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors } from "@/constants/Colors";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BASE_URL } from "@env";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { useProfile } from "@/context/ProfileContext";
import io from "socket.io-client"; // Import Socket.IO client
import { useFocusEffect } from "@react-navigation/native";

type Message = {
    id: string;
    text: string;
    type: "sent" | "received";
    isError?: boolean;
    media?: string; // Image or video URL
    audioDuration?: string; // For audio messages
};

export default function MessageScreen() {
    const router = useRouter();
    const { profile } = useProfile();
    const { chatId, name, avatar, receiverId, email } = useLocalSearchParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [inputHeight, setInputHeight] = useState(40);
    const [input, setInput] = useState("");
    const [socket, setSocket] = useState<any>(null);

    useFocusEffect(
        React.useCallback(() => {
            const socketInstance = io("http://192.168.1.163:3000", {
                transports: ["websocket"],
                query: {
                    token: SecureStore.getItemAsync("authToken"),
                },
            });

            setSocket(socketInstance);

            socketInstance.emit("joinRoom", profile?.id);

            // Listen for incoming messages
            socketInstance.on("message", (newMessage: any) => {
                const formattedMessage: Message = {
                    id: newMessage.id,
                    text: newMessage.content,
                    type: newMessage.sender._id === profile?.id ? "sent" : "received",
                    media: newMessage.media || undefined,
                    audioDuration: newMessage.audioDuration || undefined,
                };
                // setMessages((prevMessages) => [formattedMessage, ...prevMessages]);
                setMessages((prevMessages) => [...prevMessages, formattedMessage]);
            });

            // Clean up socket connection
            return () => {
                socketInstance.disconnect();
            };
        }, [profile?.id])
    );

    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            const token = await SecureStore.getItemAsync("authToken");
            if (!token) {
                throw new Error("Authentication token is missing. Please log in again.");
            }
            const response = await fetch(`${BASE_URL}/conversations/${chatId}/messages`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (data.status === "success") {
                const formattedMessages = data.data.map((msg: any) => ({
                    id: msg._id,
                    text: msg.content,
                    type: msg.sender._id === profile?.id ? "sent" : "received",
                    media: msg.media || undefined,
                    audioDuration: msg.audioDuration || undefined,
                }));
                setMessages(formattedMessages);
            } else {
                console.error("Failed to fetch messages");
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchMessages();
        }, [])
    );

    // useEffect(() => {
    //     fetchMessages();
    // }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: input,
            type: "sent",
            isError: false,
        };

        // Optimistically update the UI
        // setMessages((prevMessages) => [newMessage, ...prevMessages]);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInput("");

        try {
            const token = await SecureStore.getItemAsync("authToken");
            const response = await fetch(`${BASE_URL}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    receiverId: receiverId,
                    content: input,
                }),
            });

            const data = await response.json();
            if (data.status !== "success") {
                throw new Error("Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            // Mark the message as an error if it fails
            setMessages((prevMessages) =>
                prevMessages.map((msg) => {
                    if (msg.id === newMessage.id) {
                        return { ...msg, isError: true }; // Mark message as an error
                    }
                    return msg; // Leave other messages unchanged
                })
            );

        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isSent = item.type === "sent";
        const messageStyles = [
            styles.message,
            isSent ? styles.sentMessage : styles.receivedMessage,
        ];

        const messageTextStyles = [
            styles.messageText,
            isSent ? styles.sentMessageText : styles.receivedMessageText,
        ];

        return (
            <View style={[styles.messageContainer, isSent && { alignItems: "flex-end" }]}>
                {item.audioDuration ? (
                    <View style={messageStyles}>
                        <MaterialIcons name="play-arrow" size={24} color="#fff" />
                        <Text style={styles.audioText}>{item.audioDuration}</Text>
                    </View>
                ) : item.media ? (
                    <Image
                        source={{ uri: item.media }}
                        style={[styles.media, isSent && { borderColor: "#32CD32" }]}
                    />
                ) : (
                    <View style={messageStyles}>
                        <Text style={messageTextStyles}>{item.text}</Text>
                    </View>
                )}
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.heading}>
                    <View style={styles.backIconAndUsername}>
                        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
                            <MaterialIcons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.avatarAndUsername}>
                            <Image
                                source={typeof avatar === 'string' ? { uri: avatar } : undefined}
                                style={styles.profileImage}
                            />
                            <View>
                                <Text style={styles.headerName}>{name}</Text>
                                <Text style={styles.activeStatus}>Active 3m ago</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.audioAndVideoIcons}>
                        <TouchableOpacity style={styles.callIcon}>
                            <MaterialIcons name="call" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <MaterialIcons name="videocam" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Messages */}
            <FlatList
                data={messages}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={renderMessage}
                contentContainerStyle={styles.messageList}
            // inverted // Inverted to show latest messages at the bottom
            />

            {/* Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    value={input}
                    onChangeText={setInput}
                    style={[styles.input, { height: inputHeight }]}
                    placeholder="Type message"
                    placeholderTextColor="#888"
                    multiline={true}
                    keyboardType="default"
                    returnKeyType="default"
                    onContentSizeChange={(event) =>
                        setInputHeight(event.nativeEvent.contentSize.height)
                    }
                />
                <TouchableOpacity onPress={sendMessage} disabled={!input.trim()}>
                    <MaterialIcons name="send" size={24} color={!input.trim() ? "#888" : "#32CD32"} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        paddingHorizontal: 10,
        paddingTop: Platform.select({
            ios: 5, // Set paddingTop to 10 for iOS
            android: 20, // Default or other value for Android
        }),
        backgroundColor: "#32CD32",
    },
    heading: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: Colors.light.tint,
    },
    backIconAndUsername: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    avatarAndUsername: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 10,
    },
    headerName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    audioAndVideoIcons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    callIcon: {
        marginRight: 15,
    },
    activeStatus: {
        fontSize: 12,
        color: "#f0f0f0",
    },
    messageList: {
        flexGrow: 1,
        padding: 10,
    },
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
        backgroundColor: "#f0f0f0",
        alignSelf: "flex-end",
    },
    messageText: {
        fontSize: 14,
        color: "#fff",
        lineHeight: 20
    },
    receivedMessageText: {
        fontSize: 14,
        color: "#fff",
        lineHeight: 20
    },
    sentMessageText: {
        fontSize: 14,
        color: "#000",
        lineHeight: 20
    },
    audioText: {
        fontSize: 14,
        color: "#fff",
        marginLeft: 5,
    },
    media: {
        width: 150,
        height: 150,
        borderRadius: 10,
        borderWidth: 1,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        backgroundColor: "#fff",
    },
    input: {
        flex: 1,
        padding: 10,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        marginHorizontal: 10,
        minHeight: 40, // Minimum height for the input
        textAlignVertical: "top",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
