import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { parseISO, format, isToday, isYesterday, isThisWeek, differenceInDays } from 'date-fns';
import { useRouter } from "expo-router";
import { useProfile } from "@/context/ProfileContext";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import TypingIndicator from './TypingIndicator';
import styles from "@/styles/chatStyles";
import { ChatItemType } from '@/types/Chat';

type ChatItemProps = {
    item: ChatItemType;
    typingUser: string | null;
}

const ChatItem = ({ item, typingUser }: ChatItemProps) => {
    const router = useRouter();
    const { profile } = useProfile();

    // Format timestamp based on when the message was sent
    const formatMessageTime = (timestamp: string) => {
        if (!timestamp) return 'N/A';

        const date = parseISO(timestamp);
        const now = new Date();

        if (isToday(date)) {
            // If message was sent today, show time (e.g., 14:30)
            return format(date, 'HH:mm');
        } else if (isYesterday(date)) {
            // If message was sent yesterday, show "Yesterday"
            return 'Yesterday';
        } else if (isThisWeek(date)) {
            // If message was sent within this week, show day name (e.g., "Tuesday")
            // Calculate how many days ago to determine if we should show the day name
            const daysAgo = differenceInDays(now, date);
            if (daysAgo <= 6) {  // Within the last 7 days
                return format(date, 'EEEE');  // Day name (Monday, Tuesday, etc.)
            }
        }

        // Otherwise, show full date (DD/MM/YYYY)
        return format(date, 'dd/MM/yyyy');
    };

    const formattedTime = item.lastMessageAt
        ? formatMessageTime(item.lastMessageAt)
        : 'N/A';

    // Find the other participant (the one who is not the current user)
    let otherParticipantId = null;
    if (item.participants && Array.isArray(item.participants)) {
        const otherParticipant = item.participants.find(
            (participant: any) => participant._id !== profile?.id
        );
        otherParticipantId = otherParticipant?._id;
    }

    // If we couldn't find it, use the receiverId (which should always be available)
    if (!otherParticipantId && item.receiverId) {
        otherParticipantId = item.receiverId;
    }

    // Check if the other participant is typing
    const isTyping = typingUser === otherParticipantId;

    return (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => router.push({
                pathname: `/[userId]`,
                params: {
                    userId: item.receiverId,
                    name: item.name,
                    avatar: item.avatar,
                    email: item.email,
                    receiverId: item.receiverId
                }
            })}
        >
            <View style={styles.avatarContainer}>
                <Image
                    source={{ uri: item.avatar || 'https://example.com/default-avatar.png' }}
                    style={styles.avatar}
                />
                {item.isActive && <View style={styles.activeIndicator} />}
            </View>
            <View style={styles.chatDetails}>
                <Text style={styles.chatName}>{item.name || 'Unknown User'}</Text>
                {isTyping ? (
                    <TypingIndicator />
                ) : (
                    <View style={styles.lastMessageContainer}>
                        {item.isLastMessageSent && (
                            <MaterialIcons
                                name={item.isLastMessageRead ? "done-all" : "done"}
                                size={16}
                                color={item.isLastMessageRead ? "#32CD32" : "#6b6b6b"}
                                style={styles.messageStatusIcon}
                            />
                        )}
                        <Text
                            style={[
                                styles.chatMessage,
                                item.unreadCount > 0 && !item.isLastMessageSent && styles.unreadMessage
                            ]}
                            numberOfLines={1}
                        >
                            {item.lastMessage || 'No messages yet'}
                        </Text>
                    </View>
                )}
            </View>
            <View style={styles.chatMetadata}>
                <Text style={[
                    styles.chatTimestamp,
                    item.unreadCount > 0 && !item.isLastMessageSent && styles.unreadTimestamp
                ]}>
                    {formattedTime}
                </Text>
                {item.unreadCount > 0 && !item.isLastMessageSent && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                            {item.unreadCount > 99 ? '99+' : item.unreadCount}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export default ChatItem;