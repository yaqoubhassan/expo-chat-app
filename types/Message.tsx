export interface Message {
    id: string;
    text: string;
    type: "sent" | "received";
    isError?: boolean;
    media?: string; // Image or video URL
    audioDuration?: string; // For audio messages
}