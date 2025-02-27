import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Colors } from "@/constants/Colors";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Header } from "@/components/Header";
import MessageItem from "@/components/MessageItem";
import styles from "@/styles/messageStyles";
import { useMessaging } from "@/hooks/useMessaging";
import { groupMessagesByDate } from "@/utils/groupeMessagesByDate";
import TypingIndicator from '@/components/TypingIndicator';
import { MessageGroup } from "@/types/MessageTypes";

export default function MessageScreen() {
    const router = useRouter();
    const { userId, name, avatar, receiverId } = useLocalSearchParams();
    const [inputHeight, setInputHeight] = useState(40);
    const [input, setInput] = useState("");
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Parse params
    const safeName = Array.isArray(name) ? name[0] : name || "Unknown User";
    const safeAvatar = Array.isArray(avatar) ? avatar[0] : avatar || "default-avatar-url";
    const safeReceiverId = Array.isArray(receiverId) ? receiverId[0] : receiverId as string;

    // Use our custom hook for messaging logic
    const {
        messages,
        isLoading,
        loadingMore,
        hasMore,
        isOtherUserTyping,
        activeStatus,
        sendMessage,
        markAsRead,
        handleTyping,
        fetchMessages,
        loadMoreMessages
    } = useMessaging(safeReceiverId);

    // Group messages by date
    const groupedMessages = groupMessagesByDate(messages);

    // Scroll to bottom function
    const scrollToBottom = () => {
        flatListRef.current?.scrollToEnd({ animated: true });
        setShowScrollToBottom(false);
    };

    // Load messages on screen focus
    useFocusEffect(
        React.useCallback(() => {
            fetchMessages();
        }, [])
    );

    // Scroll to bottom when new messages are added
    useEffect(() => {
        if (messages.length) {
            scrollToBottom();
        }
    }, [messages]);

    // Handle text input change
    const onChangeText = (text: string) => {
        setInput(text);
        handleTyping(text);
    };

    // Handle send button press
    const onSendPress = () => {
        if (!input.trim()) return;
        sendMessage(input);
        setInput("");
    };

    // Handle viewable items changed
    const handleViewableItemsChanged = ({ viewableItems }: any) => {
        const isAtBottom = viewableItems.some(
            (item: any) => item.index === groupedMessages.length - 1
        );
        setShowScrollToBottom(!isAtBottom);

        // Mark received messages as read when they become visible
        viewableItems.forEach((group: any) => {
            if (group.item.messages) {
                group.item.messages.forEach((msg: any) => {
                    if (msg.type === "received" && !msg.read) {
                        markAsRead(msg.id);
                    }
                });
            }
        });
    };

    // Viewability config for FlatList
    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50,
    };

    // Render message group
    const renderGroup = ({ item }: { item: MessageGroup }) => (
        <View>
            <Text style={styles.dateHeader}>{item.label}</Text>
            {item.messages.map((msg, index) => (
                <MessageItem key={`${msg.id}-${index}`} message={msg} />
            ))}
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
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
                        onEndReached={loadMoreMessages}
                    />
                )}

                {isOtherUserTyping && (
                    <View style={styles.typingIndicatorStyle}>
                        <TypingIndicator />
                    </View>
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
                        onChangeText={onChangeText}
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
                    <TouchableOpacity onPress={onSendPress} disabled={!input.trim()}>
                        <MaterialIcons
                            name="send"
                            size={24}
                            color={!input.trim() ? "#888" : "#32CD32"}
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}