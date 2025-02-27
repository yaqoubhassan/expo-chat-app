import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useRouter } from "expo-router";
import { useProfile } from "@/context/ProfileContext";
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

    const formattedTime = item.lastMessageAt
        ? formatDistanceToNow(parseISO(item.lastMessageAt), { addSuffix: true })
        : 'N/A';

    // Find the other participant (the one who is not the current user)
    const otherParticipant = item.participants.find(
        (participant: any) => participant._id !== profile?.id
    );

    // Check if the other participant is typing
    const isTyping = typingUser === otherParticipant?._id;

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
                    <Text style={styles.chatMessage} numberOfLines={1}>
                        {item.lastMessage || 'No messages yet'}
                    </Text>
                )}
            </View>
            <Text style={styles.chatTimestamp}>{formattedTime}</Text>
        </TouchableOpacity>
    );
};

export default ChatItem;