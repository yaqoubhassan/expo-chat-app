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
import { BASE_URL } from '@env';
import * as SecureStore from 'expo-secure-store';

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
    const { chatId } = useLocalSearchParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchMessages = async () => {
        setIsLoading(true);
        try {
            const token = await SecureStore.getItemAsync('authToken');
            if (!token) {
                throw new Error('Authentication token is missing. Please log in again.');
            }
            const response = await fetch(
                `${BASE_URL}/conversations/${chatId}/messages`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
            );
            const data = await response.json();
            console.log("data: ", chatId)

            if (data.status === "success") {
                const formattedMessages = data.data.map((msg: any) => ({
                    id: msg._id,
                    text: msg.content,
                    type: msg.sender.email === "yaqoubalhassan@gmail.com" ? "sent" : "received",
                    media: msg.type === "image" || msg.type === "video" ? msg.media : undefined,
                    audioDuration: msg.type === "audio" ? msg.audioDuration : undefined,
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

    useEffect(() => {
        fetchMessages();
    }, []);

    const renderMessage = ({ item }: { item: Message }) => {
        const isSent = item.type === "sent";
        const messageStyles = [
            styles.message,
            isSent ? styles.sentMessage : styles.receivedMessage,
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
                        <Text style={styles.messageText}>{item.text}</Text>
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
                                source={{ uri: "https://i.pravatar.cc/300" }}
                                style={styles.profileImage}
                            />
                            <View>
                                <Text style={styles.headerName}>Kristin Watson</Text>
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
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messageList}
            />

            {/* Input */}
            <View style={styles.inputContainer}>
                <TouchableOpacity>
                    <MaterialIcons name="attach-file" size={24} color={Colors.light.tint} />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Type message"
                    placeholderTextColor="#888"
                />
                <TouchableOpacity>
                    <MaterialIcons name="send" size={24} color={Colors.light.tint} />
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
        paddingTop: 20,
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
    sentMessage: {
        backgroundColor: "#32CD32",
        alignSelf: "flex-end",
    },
    receivedMessage: {
        backgroundColor: "#f0f0f0",
        alignSelf: "flex-start",
    },
    messageText: {
        fontSize: 14,
        color: "#000",
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
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
