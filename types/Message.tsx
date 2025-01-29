export interface Message {
    id: string;
    text: string;
    type: "sent" | "received";
    isError?: boolean;
    media?: string;
    audioDuration?: string;
    createdAt?: Date;
    read?: boolean;
}