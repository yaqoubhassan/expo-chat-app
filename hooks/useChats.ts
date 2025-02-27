import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '@env';
import { ChatItemType } from '@/types/Chat';

export const useChats = (profile: any, onlineUsers: string[]) => {
  const [chats, setChats] = useState<ChatItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchConversations = useCallback(async (pageNumber = 1, reset = false) => {
    if (!profile) {
      console.log('Profile not loaded yet, skipping conversation fetch');
      return;
    }

    let isMounted = true;
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        throw new Error('Authentication token is missing. Please log in again.');
      }

      const response = await fetch(`${BASE_URL}/conversations?page=${pageNumber}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Map the conversations to extract the "other" participant's info
        const mappedChats = data.data.map((conversation: any) => {
          const otherParticipant = conversation.participants?.find(
            (participant: any) => participant.email !== profile?.email
          );
          return {
            id: conversation._id,
            receiverId: otherParticipant?._id,
            name: otherParticipant?.name || 'Unknown User',
            email: otherParticipant?.email,
            avatar: otherParticipant?.avatar || 'https://example.com/default-avatar.png',
            lastMessage: conversation.lastMessage,
            lastMessageAt: conversation.lastMessageAt,
            isActive: onlineUsers.includes(otherParticipant?._id), // Use online status
            participants: conversation.participants || [],
          };
        });

        if (isMounted) {
          setChats((prevChats) => (reset ? mappedChats : [...prevChats, ...mappedChats]));
          setTotalPages(data.meta.totalPages);
        }
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [profile, onlineUsers]);

  // Handle pagination
  useEffect(() => {
    if (profile && page > 1) {
      fetchConversations(page, false);
    }
  }, [page, profile, fetchConversations]);

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPage(1);
    fetchConversations(1, true);
  }, [fetchConversations]);

  const updateChatsWithNewMessage = useCallback((updatedChat: any) => {
    const formattedChat: ChatItemType = {
      id: updatedChat.conversationId,
      receiverId: updatedChat.sender === profile.id ? updatedChat.receiver : updatedChat.sender,
      name: updatedChat.senderName,
      email: updatedChat.senderEmail,
      lastMessage: updatedChat.content,
      lastMessageAt: updatedChat.createdAt,
      participants: [updatedChat.sender, updatedChat.receiver],
      avatar: updatedChat.senderAvatar,
      isActive: onlineUsers.includes(updatedChat.sender),
    };

    setChats((prevChats) => {
      // Move updated chat to top if it exists, or add it
      const existingChatIndex = prevChats.findIndex(
        (chat) => chat.id === formattedChat.id
      );

      const updatedChats = [...prevChats];

      if (existingChatIndex !== -1) {
        // Remove existing chat
        updatedChats.splice(existingChatIndex, 1);
      }

      // Add updated chat to the top
      return [formattedChat, ...updatedChats];
    });
  }, [profile, onlineUsers]);

  const updateChatsWithOnlineStatus = useCallback((onlineUserIds: string[]) => {
    setChats(prevChats =>
      prevChats.map(chat => ({
        ...chat,
        isActive: onlineUserIds.includes(chat.receiverId)
      }))
    );
  }, []);

  return {
    chats,
    loading,
    page,
    totalPages,
    isRefreshing,
    fetchConversations,
    handleLoadMore,
    handleRefresh,
    updateChatsWithNewMessage,
    updateChatsWithOnlineStatus
  };
};