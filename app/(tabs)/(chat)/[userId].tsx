import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { groupMessagesByDate } from "@/utils/groupeMessagesByDate";


interface TypingEvent {
    senderId: string; // Adjust type based on your actual data
}

export default function MessageScreen() {
    const [isTyping, setIsTyping] = useState(false);
    const router = useRouter();
    const { profile } = useProfile();
    const { userId, name, avatar, receiverId, email } = useLocalSearchParams();
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
    const [activeStatus, setActiveStatus] = useState<string>("");
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

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
            if (socket) {
                socket.emit("messageRead", {
                    messageId,
                    receiverId: profile?.id,
                });
            } else {
                console.warn("Socket is not connected when trying to emit messageRead");
            }
        } catch (error) {
            console.error("Error marking message as read:", error);
        }
    };

    const handleViewableItemsChanged = ({ viewableItems }: any) => {
        const isAtBottom = viewableItems.some(
            (item: any) => item.index === messages.length - 1
        );
        setShowScrollToBottom(!isAtBottom);
        viewableItems.forEach((group: any) => {
            if (group.item.messages) {
                group.item.messages.forEach((msg: Message) => {
                    if (msg.type === "received" && !msg.read) {
                        markAsRead(msg.id);
                        setMessages((prev) =>
                            prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m))
                        );
                    }
                });
            }
        });
    };

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50,
    };

    useEffect(() => {
        const setupSocket = async () => {
            // const token = await SecureStore.getItemAsync("authToken");
            const newSocket = io("http://192.168.1.163:3000", {
                transports: ["websocket"],
                query: { userId: profile?.id }, // Replace dynamically
            });
            newSocket.on("userStatusChange", (onlineUserIds) => {
                setOnlineUsers(onlineUserIds);
            });
            setSocket(newSocket);
            return () => newSocket.disconnect();
        };
        setupSocket();
    }, []);

    const formatLastSeen = (timestamp: string | number | Date): string => {
        const lastSeenDate = new Date(timestamp);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));

        if (diffMinutes < 1) return "Online";
        if (diffMinutes < 60) return `Active ${diffMinutes}m ago`;
        if (diffMinutes < 1440) return `Active ${Math.floor(diffMinutes / 60)}h ago`;

        return `Active ${lastSeenDate.toLocaleDateString()}`;
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
                `${BASE_URL}/conversations/${userId}/messages?page=${page}&limit=20`,
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

                if (data.activeStatus) {
                    setActiveStatus(formatLastSeen(data.activeStatus)); // Convert timestamp
                }
            }
            else if (data.message === "No conversation found") {
                setMessages([]); // Set messages to empty
            }

            else {
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

    const groupedMessages = groupMessagesByDate(messages);

    // const renderGroup = ({ item }: { item: any }) => (
    //     <View>
    //         <Text style={styles.dateHeader}>{item.label}</Text>
    //         {item.messages.map((msg: Message, index: number) => (
    //             <MessageItem key={msg.id || index} message={msg} />
    //         ))}
    //     </View>
    // );

    const renderGroup = useCallback(({ item }: { item: any }) => (
        <View>
            <Text style={styles.dateHeader}>{item.label}</Text>
            {item.messages.map((msg: Message, index: number) => (
                <MessageItem key={msg.id || index} message={msg} />
            ))}
        </View>
    ), []);


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
                    activeStatus={activeStatus}
                />

                {messages.length === 0 ? (
                    <View style={styles.noConversationContainer}>
                        <Text style={styles.noConversationText}>
                            No messages yet. Start the conversation!
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        ListHeaderComponent={
                            loadingMore ? (
                                <ActivityIndicator size="small" color={Colors.light.tint} />
                            ) : null
                        }
                        ref={flatListRef}
                        data={groupedMessages}
                        keyExtractor={(item, index) => `group-${index}`}
                        renderItem={renderGroup}
                        contentContainerStyle={styles.messageList}
                        onViewableItemsChanged={handleViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        onEndReachedThreshold={0.1}
                        onEndReached={() => {
                            if (!loadingMore && hasMore) {
                                setCurrentPage((prevPage) => {
                                    const nextPage = prevPage + 1;
                                    fetchMessages(nextPage);
                                    return nextPage;
                                });
                            }
                        }}
                        initialNumToRender={5}
                        windowSize={3}
                        getItemLayout={(data, index) => ({
                            length: 80, // Approximate row height
                            offset: 80 * index,
                            index,
                        })}
                    />
                )}


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
