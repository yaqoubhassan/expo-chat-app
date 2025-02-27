import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import io from "socket.io-client";
import { ChatItemType, TypingEvent } from '@/types/Chat';

const SOCKET_URL = "http://192.168.1.163:3000";

export const useSocket = (
  profileId: string | undefined,
  setOnlineUsers: (users: string[]) => void,
  setTypingUser: (userId: string | null) => void,
  updateChats: (updatedChat: any) => void
) => {
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    if (!profileId) {
      console.log('Profile ID not available, skipping socket setup');
      return;
    }

    let socketInstance: any = null;

    const setupSocket = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken');
        if (!token) {
          console.error('No auth token for socket connection');
          return;
        }

        // Close existing socket if any
        if (socket) {
          socket.disconnect();
        }

        socketInstance = io(SOCKET_URL, {
          transports: ['websocket'],
          query: { token, userId: profileId },
        });

        socketInstance.on('connect', () => {
          socketInstance.emit('joinRoom', profileId);
        });

        socketInstance.on('connect_error', (error: any) => {
          console.error('Socket connection error:', error);
        });

        // Handle online users updates
        socketInstance.on('userStatusChange', (onlineUserIds: string[]) => {
          setOnlineUsers(onlineUserIds);
        });

        socketInstance.on('typing', ({ senderId }: TypingEvent) => {
          console.log(`Typing event received from ${senderId}`);
          // Update the typing context to show the typing indicator
          if (senderId !== profileId) {
            // Only show typing indicator for other users, not the current user
            setTypingUser(senderId);
            console.log(`Set typing user to ${senderId}`);
          }
        });

        socketInstance.on('stopTyping', ({ senderId }: TypingEvent) => {
          // Clear the typing indicator when the user stops typing
          if (senderId !== profileId) {
            setTypingUser(null);
          }
        });

        // Handle new messages
        socketInstance.on('message', (updatedChat: any) => {
          const sender = updatedChat.sender || updatedChat.participants.find((p: any) => p._id !== profileId);
          const senderId = sender?._id;
          updateChats(updatedChat);
        });

        setSocket(socketInstance);
      } catch (error) {
        console.error('Error setting up socket:', error);
      }
    };

    setupSocket();

    // Cleanup function to disconnect socket when unmounting
    return () => {
      if (socketInstance) {
        socketInstance.off('message');
        socketInstance.off('userStatusChange');
        socketInstance.off('typing');
        socketInstance.off('stopTyping');
        socketInstance.off('connect');
        socketInstance.off('connect_error');
        socketInstance.disconnect();
      }
    };
  }, [profileId]); // Only recreate socket when profile.id changes

  return socket;
};