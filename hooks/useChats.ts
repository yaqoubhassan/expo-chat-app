import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '@env';
import { ChatItemType } from '@/types/Chat';
import { useOnlineStatus } from '@/context/OnlineStatusContext';

export const useChats = (profile: any) => {
  const [chats, setChats] = useState<ChatItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use the online status context instead of passing onlineUsers as a prop
  const { onlineUsers } = useOnlineStatus();

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

      const response = await fetch(`${BASE_URL}/api/conversations?page=${pageNumber}&limit=10`, {
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

          const isLastMessageSent = conversation.lastMessageSender === profile?.id;
          const isLastMessageRead = conversation.lastMessageRead || false;

          return {
            id: conversation._id,
            receiverId: otherParticipant?._id,
            name: otherParticipant?.name || 'Unknown User',
            email: otherParticipant?.email,
            avatar: otherParticipant?.avatar || 'https://example.com/default-avatar.png',
            lastMessage: conversation.lastMessage,
            lastMessageAt: conversation.lastMessageAt,
            // Use onlineUsers from the context to determine active status
            isActive: onlineUsers.includes(otherParticipant?._id),
            participants: conversation.participants || [],
            unreadCount: conversation.unreadCount,
            isLastMessageSent: isLastMessageSent,
            isLastMessageRead: isLastMessageRead,
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
  }, [profile, onlineUsers]); // Add onlineUsers to dependency array

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
    const isLastMessageSent = updatedChat.sender === profile?.id;
    const isLastMessageRead = updatedChat.lastMessageRead || false;

    const formattedChat: ChatItemType = {
      id: updatedChat.conversationId,
      receiverId: updatedChat.sender === profile.id ? updatedChat.receiver : updatedChat.sender,
      name: updatedChat.senderName,
      email: updatedChat.senderEmail,
      lastMessage: updatedChat.content,
      lastMessageAt: updatedChat.createdAt,
      unreadCount: updatedChat.unreadCount,
      participants: [updatedChat.sender, updatedChat.receiver],
      avatar: updatedChat.senderAvatar,
      // Use onlineUsers from the context to determine active status
      isActive: onlineUsers.includes(updatedChat.sender),
      isLastMessageSent: isLastMessageSent,
      isLastMessageRead: isLastMessageRead,
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

  // Remove updateChatsWithOnlineStatus as it's now handled by the context

  const updateChatUnreadCount = useCallback((conversationId: string, newUnreadCount = 0) => {
    setChats(prevChats =>
      prevChats.map(chat =>
        chat.id === conversationId
          ? { ...chat, unreadCount: newUnreadCount }
          : chat
      )
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
    updateChatUnreadCount
  };
};