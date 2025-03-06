import io, { Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "@env";
import { Message, TypingEvent, MessageReadEvent, MessageUpdateEvent } from "@/types/MessageTypes";

export interface SocketHandlers {
    onMessage: (message: any) => void;
    onMessageRead: (data: MessageReadEvent) => void;
    onTyping: (data: TypingEvent) => void;
    onStopTyping: (data: TypingEvent) => void;
    onMessageUpdated?: (data: MessageUpdateEvent) => void;
}

class SocketService {
    private socket: Socket | null = null;
    private userId: string | null = null;
    private handlers: SocketHandlers | null = null;

    async initSocket(userId: string, handlers: SocketHandlers) {
        if (this.socket) {
            this.disconnectSocket();
        }

        this.userId = userId;
        this.handlers = handlers;

        try {
            const token = await SecureStore.getItemAsync("authToken");
            this.socket = io(`${BASE_URL}`, {
                transports: ["websocket"],
                query: {
                    userId,
                    token
                },
            });

            // Setup event listeners
            this.socket.on("connect", () => {
                if (this.socket) {
                    this.socket.emit("joinRoom", userId);
                }
            });

            this.socket.on("message", handlers.onMessage);
            this.socket.on("messageRead", handlers.onMessageRead);
            this.socket.on("typing", handlers.onTyping);
            this.socket.on("stopTyping", handlers.onStopTyping);

            this.socket.on("messageUpdated", (data) => {
                if (handlers.onMessageUpdated) {
                    // Transform the data to match expected format if needed
                    const updateEvent = {
                        messageId: data.id || data.messageId,
                        content: data.content,
                        receiverId: data.receiverId
                    };
                    handlers.onMessageUpdated(updateEvent);
                }
            });

            return this.socket;
        } catch (error) {
            console.error("Socket initialization error:", error);
            return null;
        }
    }

    updateMessage(messageId: string, content: string, receiverId: string) {
        if (!this.socket) {
            console.warn("Socket not connected when trying to update message");
            return;
        }
        this.socket.emit("messageUpdated", { messageId, content, receiverId });
    }

    sendMessage(receiverId: string, content: string) {
        if (!this.socket) {
            console.warn("Socket not connected when trying to send message");
            return;
        }
        this.socket.emit("message", { receiverId, content });
    }

    emitTyping(receiverId: string) {
        if (!this.socket || !this.userId) return;
        this.socket.emit("typing", { senderId: this.userId, receiverId });
    }

    emitStopTyping(receiverId: string) {
        if (!this.socket || !this.userId) return;
        this.socket.emit("stopTyping", { senderId: this.userId, receiverId });
    }

    emitMessageRead(messageId: string) {
        if (!this.socket) {
            console.warn("Socket not connected when trying to emit messageRead");
            return;
        }
        this.socket.emit("messageRead", {
            messageId,
            receiverId: this.userId,
        });
    }

    disconnectSocket() {
        if (this.socket) {
            this.socket.off("message");
            this.socket.off("messageRead");
            this.socket.off("typing");
            this.socket.off("stopTyping");
            this.socket.off("messageUpdated");
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new SocketService();