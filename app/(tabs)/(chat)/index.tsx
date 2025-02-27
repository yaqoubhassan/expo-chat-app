import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/Colors';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '@env';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import io from "socket.io-client";
import { useProfile } from "@/context/ProfileContext";
import { TypingContext } from '@/context/TypingContext';

interface TypingEvent {
  senderId: string; // Adjust type based on your actual data
}

type Participant = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
};

type ChatItem = {
  id: string;
  receiverId: string,
  name: string;
  email: string,
  lastMessage: string;
  lastMessageAt: string;
  participants: Participant[];
  avatar: string;
  isActive: boolean;
};

export default function ChatsScreen() {
  const { typingUser, setTypingUser } = useContext(TypingContext);
  const router = useRouter();
  const { profile, fetchProfile, isLoading: profileLoading } = useProfile();
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Replace your current useFocusEffect hooks with this single one
  useFocusEffect(
    useCallback(() => {
      // Only fetch profile if it's not already loaded
      if (!profile || !profile.id) {
        fetchProfile().then(() => {
          fetchConversations(1, true);
        });
      } else {
        // If profile is already loaded, fetch conversations directly
        fetchConversations(1, true);
      }

      return () => {
        // Cleanup when screen loses focus
      };
    }, []) // Empty dependency array to run only on focus changes
  );

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

  // Setup socket connection when profile is available
  useEffect(() => {
    if (!profile?.id) {
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

        socketInstance = io("http://192.168.1.163:3000", {
          transports: ['websocket'],
          query: { token, userId: profile.id },
        });

        socketInstance.on('connect', () => {
          console.log('Socket connected');
          socketInstance.emit('joinRoom', profile.id);
        });

        socketInstance.on('connect_error', (error: any) => {
          console.error('Socket connection error:', error);
        });

        // Handle online users updates
        socketInstance.on('userStatusChange', (onlineUserIds: string[]) => {
          console.log('Online users updated:', onlineUserIds);
          setOnlineUsers(onlineUserIds);

          // Update chat items with active status
          setChats(prevChats =>
            prevChats.map(chat => ({
              ...chat,
              isActive: onlineUserIds.includes(chat.receiverId)
            }))
          );
        });

        socketInstance.on('typing', ({ senderId }: TypingEvent) => {

          // Update the typing context to show the typing indicator
          if (senderId !== profile.id) {
            // Only show typing indicator for other users, not the current user
            setTypingUser(senderId);
          }
        });

        socketInstance.on('stopTyping', ({ senderId }: TypingEvent) => {

          // Clear the typing indicator when the user stops typing
          if (senderId !== profile.id) {
            setTypingUser(null);
          }
        });

        // Handle new messages
        socketInstance.on('message', (updatedChat: any) => {

          const formattedChat: ChatItem = {
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
        socketInstance.off('connect');
        socketInstance.off('connect_error');
        socketInstance.disconnect();
      }
    };
  }, [profile?.id]); // Only recreate socket when profile.id changes

  const handleSearch = (text: string) => {
    setSearchText(text);
    // Filter chats based on search text
    // You could implement this functionality if needed
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchProfile();
    setPage(1);
    fetchConversations(1, true);
  };

  const renderChatItem = ({ item }: { item: ChatItem }) => {
    const formattedTime = item.lastMessageAt
      ? formatDistanceToNow(parseISO(item.lastMessageAt), { addSuffix: true })
      : 'N/A';

    // Find the other participant (the one who is not the current user)
    const otherParticipant = item.participants.find(
      (participant) => participant._id !== profile?.id
    );

    // Check if the other participant is typing
    const isTyping = typingUser === otherParticipant?._id;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => router.push({
          pathname: `/[userId]`,
          params: {
            userId: item.receiverId,
            name: item.name,
            avatar: item.avatar,
            email: item.email,
            receiverId: item.receiverId
          }
        })}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.avatar || 'https://example.com/default-avatar.png' }}
            style={styles.avatar}
          />
          {item.isActive && <View style={styles.activeIndicator} />}
        </View>
        <View style={styles.chatDetails}>
          <Text style={styles.chatName}>{item.name || 'Unknown User'}</Text>
          {isTyping ? (
            <Text style={[styles.chatMessage, styles.typingText]}>
              Typing...
            </Text>
          ) : (
            <Text style={styles.chatMessage} numberOfLines={1}>
              {item.lastMessage || 'No messages yet'}
            </Text>
          )}
        </View>
        <Text style={styles.chatTimestamp}>{formattedTime}</Text>
      </TouchableOpacity>
    );
  };

  if (profileLoading) {
    // Show a loading indicator if the profile is still loading
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#32CD32" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.title}>Chats</Text>
          <TouchableOpacity onPress={() => setSearchActive(true)}>
            <MaterialIcons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        {searchActive && (
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email"
              value={searchText}
              onChangeText={handleSearch}
            />
            <TouchableOpacity
              onPress={() => {
                setSearchActive(false);
                setSearchText('');
              }}
            >
              <MaterialIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading && page === 1 ? (
        <ActivityIndicator size="large" color={Colors.light.tint} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={renderChatItem}
          contentContainerStyle={[
            styles.chatList,
            { flexGrow: chats.length === 0 ? 1 : undefined }, // Center empty message if no chats
          ]}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={
            page < totalPages && loading ? (
              <ActivityIndicator size="small" color={Colors.light.tint} />
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No chats available</Text>
                <MaterialIcons name="chat-bubble-outline" size={48} color="#888888" />
              </View>
            ) : null
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // Handle new chat creation
          console.log("New chat button pressed");
          // You could navigate to a contact list screen here
        }}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    fontSize: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.light.tint,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#32CD32',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  chatList: {
    paddingVertical: 10,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  avatarContainer: {
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  activeIndicator: {
    width: 15,
    height: 15,
    backgroundColor: '#32CD32',
    borderRadius: 10,
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatDetails: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  chatMessage: {
    fontSize: 14,
    color: '#888888',
  },
  chatTimestamp: {
    fontSize: 12,
    color: Colors.light.subtext,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 40,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 50,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#888888',
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  typingText: {
    fontStyle: 'italic',
    color: '#32CD32', // Using the app's tint color
  },
});