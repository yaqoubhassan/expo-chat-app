export type Participant = {
    _id: string;
    name: string;
    email: string;
    avatar: string;
};

export type ChatItemType = {
    id: string;
    receiverId: string;
    name: string;
    email: string;
    lastMessage: string;
    lastMessageAt: string;
    participants: Participant[];
    avatar: string;
    isActive: boolean;
    unreadCount: number;
};

export interface TypingEvent {
    senderId: string;
}