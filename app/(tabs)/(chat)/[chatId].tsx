import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    ActivityIndicator,
    KeyboardAvoidingView,
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
import { Header } from "@/components/Header";
import MessageItem from "@/components/MessageItem";
import styles from "@/styles/messageStyles";
import { Message } from "@/types/Message";


interface TypingEvent {
    senderId: string; // Adjust type based on your actual data
}

export default function MessageScreen() {
    const [isTyping, setIsTyping] = useState(false);
    const router = useRouter();
    const { profile } = useProfile();
    const { chatId, name, avatar, receiverId, email } = useLocalSearchParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [inputHeight, setInputHeight] = useState(40);
    const [input, setInput] = useState("");
    const [socket, setSocket] = useState<any>(null);
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null); // Ref for FlatList
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true); // Track if there are more messages
    const [loadingMore, setLoadingMore] = useState(false);

    const safeName = Array.isArray(name) ? name[0] : name || "Unknown User";
    const safeAvatar = Array.isArray(avatar) ? avatar[0] : avatar || "default-avatar-url";

    let typingTimeout: NodeJS.Timeout | undefined;

    const scrollToBottom = () => {
        flatListRef.current?.scrollToEnd({ animated: true });
        setShowScrollToBottom(false); // Hide the button after scrolling
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchMessages();
        }, [currentPage])
    );

    useFocusEffect(

        React.useCallback(() => {
            if (messages.length) {
                scrollToBottom(); // Scroll to the bottom when a new message is added
            }
        }, [messages])
    );

    const markAsRead = async (messageId: string) => {
        try {
            const token = await SecureStore.getItemAsync("authToken");
            await fetch(`${BASE_URL}/messages/${messageId}/read`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });

            // Notify sender about read status
            socket.emit("messageRead", {
                messageId,
                receiverId: profile?.id,
            });
        } catch (error) {
            console.error("Error marking message as read:", error);
        }
    };

    const handleViewableItemsChanged = ({ viewableItems }: any) => {
        const isAtBottom = viewableItems.some(
            (item: any) => item.index === messages.length - 1
        );
        setShowScrollToBottom(!isAtBottom);
        viewableItems.forEach((item: any) => {
            if (item.item.type === "received" && !item.item.read) {
                markAsRead(item.item.id);
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === item.item.id ? { ...msg, read: true } : msg
                    )
                );
            }
        });
    };

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50,
    };

    const handleTyping = (text: string) => {
        setInput(text);

        if (!isTyping) {
            setIsTyping(true);
            socket.emit("typing", { senderId: profile?.id, receiverId });
        }

        clearTimeout(typingTimeout);

        typingTimeout = setTimeout(() => {
            setIsTyping(false);
            socket.emit("stopTyping", { senderId: profile?.id, receiverId });
        }, 1000);
    };

    useEffect(() => {
        if (socket) {
            socket.on("message", (newMessage: any) => {
                const formattedMessage: Message = {
                    id: newMessage.id,
                    text: newMessage.content,
                    type: newMessage.sender === profile?.id ? "sent" : "received",
                    createdAt: newMessage.createdAt || Date.now(),
                    read: newMessage.read || false,
                };

                setMessages((prevMessages) => [...prevMessages, formattedMessage]);
            });

            socket.on("messageRead", ({ messageId }: { messageId: string }) => {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg.id === messageId ? { ...msg, read: true } : msg
                    )
                );
            });

            socket.on("typing", ({ senderId }: TypingEvent) => {
                if (senderId === receiverId) setIsOtherUserTyping(true);
            });

            socket.on("stopTyping", ({ senderId }: TypingEvent) => {
                if (senderId === receiverId) setIsOtherUserTyping(false);
            });
        }

        return () => {
            socket?.off("message");
            socket?.off("messageRead");
            socket?.off("typing");
            socket?.off("stopTyping");
        };
    }, [socket, receiverId]);

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

            return () => {
                socketInstance.disconnect();
            };
        }, [receiverId])
    );

    const fetchMessages = async (page = 1) => {
        // setIsLoading(true);
        if (loadingMore || !hasMore) return; // Prevent multiple requests

        setLoadingMore(true);
        try {
            const token = await SecureStore.getItemAsync("authToken");
            if (!token) {
                throw new Error("Authentication token is missing. Please log in again.");
            }

            const response = await fetch(
                `${BASE_URL}/conversations/${chatId}/messages?page=${page}&limit=20`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = await response.json();

            if (data.status === "success") {
                const formattedMessages = data.data.map((msg: any) => ({
                    id: msg._id,
                    text: msg.content,
                    type: msg.sender._id === profile?.id ? "sent" : "received",
                    createdAt: msg.createdAt || Date.now(),
                    read: msg.read || false,
                    media: msg.media || undefined,
                    audioDuration: msg.audioDuration || undefined,
                }));
                setMessages((prevMessages) => [...prevMessages, ...formattedMessages]); // Prepend older messages
                setHasMore(data.hasMore);
            } else {
                console.error("Failed to fetch messages");
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            // setIsLoading(false);
            setLoadingMore(false);

        }
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

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

            const newMessage: Message = {
                id: data.data.message._id,
                text: input,
                type: "sent",
                isError: false,
                createdAt: new Date,
                read: data.data.message.read
            };

            setMessages((prevMessages) => [...prevMessages, newMessage]);
            setInput("");

            if (data.status !== "success") {
                throw new Error("Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message:", error);

        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        return <MessageItem message={item} />;
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <SafeAreaView style={styles.container}>

                <Header
                    onBackPress={() => router.back()}
                    name={safeName}
                    avatar={safeAvatar}
                    activeStatus="Active 3m ago"
                />

                {/* Messages */}
                <FlatList
                    ListHeaderComponent={
                        loadingMore ? (
                            <ActivityIndicator size="small" color={Colors.light.tint} />
                        ) : null
                    }
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    renderItem={renderMessage}
                    contentContainerStyle={[styles.messageList]}
                    onViewableItemsChanged={handleViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    onEndReachedThreshold={0.1} // Load more when 10% from the top
                    onEndReached={() => {
                        if (!loadingMore && hasMore) {
                            setCurrentPage((prevPage) => {
                                const nextPage = prevPage + 1;
                                fetchMessages(nextPage); // Fetch the next page
                                return nextPage;
                            });
                        }
                    }}
                />


                {isOtherUserTyping && (
                    <Text style={styles.typingIndicator}>Typing...</Text>
                )}

                {/* Scroll to Bottom Button */}
                {showScrollToBottom && (
                    <TouchableOpacity
                        style={styles.scrollToBottomButton}
                        onPress={scrollToBottom}
                    >
                        <MaterialIcons name="arrow-downward" size={24} color="#000" />
                    </TouchableOpacity>
                )}

                {/* Input */}

                <View style={styles.inputContainer}>
                    <TextInput
                        value={input}
                        onChangeText={handleTyping}
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
        </KeyboardAvoidingView>
    );
}
