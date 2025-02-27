import io, { Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "@env";
import { Message, TypingEvent, MessageReadEvent } from "@/types/MessageTypes";

export interface SocketHandlers {
    onMessage: (message: any) => void;
    onMessageRead: (data: MessageReadEvent) => void;
    onTyping: (data: TypingEvent) => void;
    onStopTyping: (data: TypingEvent) => void;
    onUserStatusChange?: (onlineUserIds: string[]) => void;
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
            this.socket = io("http://192.168.1.163:3000", {
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

            if (handlers.onUserStatusChange) {
                this.socket.on("userStatusChange", handlers.onUserStatusChange);
            }

            return this.socket;
        } catch (error) {
            console.error("Socket initialization error:", error);
            return null;
        }
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
            this.socket.off("userStatusChange");
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new SocketService();