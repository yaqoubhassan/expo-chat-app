import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Text,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/Colors';
import { useFocusEffect } from "@react-navigation/native";
import { useProfile } from "@/context/ProfileContext";
import { TypingContext } from '@/context/TypingContext';
import styles from "@/styles/chatStyles";

// Components
import ChatItem from '@/components/ChatItem';
import EmptyChatList from '@/components/EmptyChatList';
import ChatsHeader from '@/components/ChatsHeader';

// Hooks
import { useChats } from '@/hooks/useChats';
import { useSocket } from '@/hooks/useSocket';

export default function ChatsScreen() {
  const { typingUser, setTypingUser } = useContext(TypingContext);
  const { profile, fetchProfile, isLoading: profileLoading } = useProfile();

  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Initialize chat-related functionality
  const {
    chats,
    loading,
    isRefreshing,
    totalPages,
    handleLoadMore,
    handleRefresh,
    fetchConversations,
    updateChatsWithNewMessage,
    updateChatsWithOnlineStatus
  } = useChats(profile, onlineUsers);

  // Initialize socket connection
  useSocket(
    profile?.id,
    (onlineUserIds) => {
      setOnlineUsers(onlineUserIds);
      updateChatsWithOnlineStatus(onlineUserIds);
    },
    setTypingUser,
    updateChatsWithNewMessage
  );

  // Handle search functionality
  const handleSearch = (text: string) => {
    setSearchText(text);
    // Filter chats based on search text
    // You could implement this functionality if needed
  };

  // Fetch data when screen comes into focus
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
      <ChatsHeader
        searchActive={searchActive}
        setSearchActive={setSearchActive}
        searchText={searchText}
        handleSearch={handleSearch}
      />

      {loading && !isRefreshing ? (
        <ActivityIndicator size="large" color={Colors.light.tint} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={({ item }) => (
            <ChatItem item={item} typingUser={typingUser} />
          )}
          contentContainerStyle={[
            styles.chatList,
            { flexGrow: chats.length === 0 ? 1 : undefined }, // Center empty message if no chats
          ]}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          ListFooterComponent={
            totalPages > 1 && loading ? (
              <ActivityIndicator size="small" color={Colors.light.tint} />
            ) : null
          }
          ListEmptyComponent={!loading ? <EmptyChatList /> : null}
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