export interface Message {
    id: string;
    text: string;
    type: 'sent' | 'received';
    createdAt?: Date;
    read: boolean;
    media?: string;
    audioDuration?: number;
    isError?: boolean;
}

export interface MessageGroup {
    label: string;
    messages: Message[];
}

export interface TypingEvent {
    senderId: string;
}

export interface MessageReadEvent {
    messageId: string;
}