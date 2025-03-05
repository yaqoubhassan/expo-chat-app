import { useState, useEffect, useRef, useCallback, useContext, useMemo } from "react";
import { TypingContext } from '@/context/TypingContext';
import { useProfile } from "@/context/ProfileContext";
import { useOnlineStatus } from "@/context/OnlineStatusContext";
import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "@env";
import { Message, MessageReadEvent, TypingEvent, MessageUpdateEvent } from "@/types/MessageTypes";
import socketService from "@/services/socketService";
import { useLocalSearchParams } from "expo-router";

export const useMessaging = (receiverId: string) => {
  const { profile } = useProfile();
  const { userId } = useLocalSearchParams();
  const { isTyping, setIsTyping, typingUser, setTypingUser } = useContext(TypingContext);
  const { isUserOnline } = useOnlineStatus(); // Use the online status context
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<string | null>(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  // Get user's online status - will be reactive whenever the context updates
  const isReceiverOnline = isUserOnline(receiverId);

  // Format last seen timestamp
  const formatLastSeen = useCallback((timestamp: string | number | Date): string => {
    const lastSeenDate = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastSeenDate.getTime()) / 1000);

    if (diffSeconds < 10) return "Online";
    if (diffSeconds < 60) return `Active ${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `Active ${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `Active ${Math.floor(diffSeconds / 3600)}h ago`;

    return `Active ${lastSeenDate.toLocaleDateString()}`;
  }, []);

  // Use useMemo for activeStatus to recalculate when dependencies change
  const activeStatus = useMemo(() => {
    if (isReceiverOnline) {
      return "Online";
    } else if (lastSeenTimestamp) {
      return formatLastSeen(lastSeenTimestamp);
    }
    return "";
  }, [isReceiverOnline, lastSeenTimestamp, formatLastSeen]);

  // Update last seen time periodically when user is offline
  useEffect(() => {
    if (isReceiverOnline || !lastSeenTimestamp) return;

    // Update the formatted time every minute to show accurate "X minutes ago"
    const intervalId = setInterval(() => {
      // This will trigger a re-calculation of activeStatus via the useMemo
      const forceUpdate = {};
      setLastSeenTimestamp(prev => prev ? String(new Date(prev)) : prev);
    }, 60000); // Update every minute

    return () => clearInterval(intervalId);
  }, [isReceiverOnline, lastSeenTimestamp]);

  const handleMessageUpdated = useCallback((data: any) => {
    const { messageId, content } = data;
    console.log("Message updated event received:", messageId, content);

    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, text: content, isEdited: true } : msg
      )
    );
  }, []);

  // Socket event handlers
  const handleNewMessage = useCallback((newMessage: any) => {
    const formattedMessage: Message = {
      id: newMessage.id,
      text: newMessage.content,
      type: newMessage.sender === profile?.id ? "sent" : "received",
      createdAt: newMessage.createdAt || Date.now(),
      read: newMessage.read || false,
    };

    setMessages((prevMessages) => [...prevMessages, formattedMessage]);

    if (newMessage.sender === receiverId && !formattedMessage.read) {
      markAsRead(formattedMessage.id);
    }

    // Clear typing indicator when message received
    if (newMessage.sender === receiverId) {
      setIsOtherUserTyping(false);
      setTypingUser(null);
    }
  }, [profile?.id, receiverId]);

  const handleMessageRead = useCallback(({ messageId }: MessageReadEvent) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
  }, []);

  const handleUserTyping = useCallback(({ senderId }: TypingEvent) => {
    if (senderId === receiverId) {
      setIsOtherUserTyping(true);
      setTypingUser(senderId);
    }
  }, [receiverId]);

  const handleUserStopTyping = useCallback(({ senderId }: TypingEvent) => {
    if (senderId === receiverId) {
      setIsOtherUserTyping(false);
      setTypingUser(null);
    }
  }, [receiverId]);

  // Initialize socket connection
  useEffect(() => {
    if (!profile?.id || !receiverId) return;

    const setupSocket = async () => {
      await socketService.initSocket(profile.id, {
        onMessage: handleNewMessage,
        onMessageRead: handleMessageRead,
        onTyping: handleUserTyping,
        onStopTyping: handleUserStopTyping,
        onMessageUpdated: handleMessageUpdated
      });
    };

    setupSocket();

    console.log("Socket setup complete, listening for message updates");

    return () => {
      socketService.disconnectSocket();
      // Clear typing timeout if it exists
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [profile?.id, receiverId, handleMessageUpdated]);

  const startEditingMessage = (message: Message) => {
    setEditingMessage(message);
  };

  // Function to cancel editing
  const cancelEditingMessage = () => {
    setEditingMessage(null);
  };

  const updateMessage = async (messageId: string, content: string) => {
    if (!content.trim()) return;

    try {
      const token = await SecureStore.getItemAsync("authToken");
      const response = await fetch(`${BASE_URL}/messages/${messageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content,
        }),
      });
      const data = await response.json();

      if (data.status === "success") {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, text: content, isEdited: true } : msg
          )
        );

        socketService.updateMessage(messageId, content, receiverId);
      } else {
        throw new Error("Failed to update message");
      }
    } catch (error) {
      console.error("Error updating message:", error);

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, isError: true } : msg
        )
      );
    } finally {
      // Reset editing state
      setEditingMessage(null);
    }
  };

  // Fetch messages function
  const fetchMessages = async (page = 1) => {
    if (loadingMore || !hasMore) return;

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

        setMessages((prevMessages) => [...prevMessages, ...formattedMessages]);
        setHasMore(data.hasMore);

        // If we have lastSeen data from the API, store it
        if (data.activeStatus) {
          setLastSeenTimestamp(data.activeStatus);
        }
      } else if (data.message === "No conversation found") {
        setMessages([]);
      } else {
        console.error("Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Send message function
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

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
          content: content,
        }),
      });
      const data = await response.json();

      const newMessage: Message = {
        id: data.data.message._id,
        text: content,
        type: "sent",
        isError: false,
        createdAt: new Date(),
        read: data.data.message.read
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);

      if (data.status !== "success") {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      await fetch(`${BASE_URL}/messages/${messageId}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      socketService.emitMessageRead(messageId);

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, read: true } : m))
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Handle typing indicator
  const handleTyping = (text: string) => {
    if (!isTyping) {
      setIsTyping(true);
      setTypingUser(profile?.id);
      socketService.emitTyping(receiverId);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTypingUser(null);
      socketService.emitStopTyping(receiverId);
      typingTimeoutRef.current = null;
    }, 1000);
  };

  // Load next page of messages
  const loadMoreMessages = () => {
    if (!loadingMore && hasMore) {
      setCurrentPage((prevPage) => {
        const nextPage = prevPage + 1;
        fetchMessages(nextPage);
        return nextPage;
      });
    }
  };

  return {
    messages,
    isLoading,
    loadingMore,
    hasMore,
    isOtherUserTyping,
    activeStatus,
    editingMessage,
    sendMessage,
    markAsRead,
    handleTyping,
    fetchMessages,
    loadMoreMessages,
    startEditingMessage,
    cancelEditingMessage,
    updateMessage,
    isReceiverOnline
  };
};