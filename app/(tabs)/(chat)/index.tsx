import React, { useState, useEffect, useCallback } from 'react';
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
import { useProfile } from '@/context/ProfileContext';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

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
  const router = useRouter();
  const { profile } = useProfile();
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchConversations = useCallback(async (pageNumber = 1, reset = false) => {
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
            isActive: false, // Set this based on real-time activity if applicable
          };
        });

        setChats((prevChats) => (reset ? mappedChats : [...prevChats, ...mappedChats]));
        setTotalPages(data.meta.totalPages);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      if (isMounted) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [profile?.email]);

  useFocusEffect(
    React.useCallback(() => {
      fetchConversations(page, true);
    }, [page, fetchConversations])
  );
  // useEffect(() => {
  //   fetchConversations(page, true);
  // }, [page, fetchConversations]);

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    fetchConversations(1, true);
  };

  const renderChatItem = ({ item }: { item: ChatItem }) => {
    // console.log("Item: ", item)
    // const otherParticipant = item.participants?.find(
    //   (participant) => participant.email !== profile?.email
    // );

    const formattedTime = formatDistanceToNow(parseISO(item.lastMessageAt), {
      addSuffix: true,
    });

    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => router.push({
        pathname: `/[chatId]`,
        params: { chatId: item.id, name: item.name, avatar: item.avatar, email: item.email, receiverId: item.receiverId }
      })}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.avatar || 'https://example.com/default-avatar.png' }}
            style={styles.avatar}
          />
        </View>
        <View style={styles.chatDetails}>
          <Text style={styles.chatName}>{item.name || 'Unknown User1'}</Text>
          <Text style={styles.chatMessage} numberOfLines={1}>
            {item.lastMessage || 'No messages yet'}
          </Text>
        </View>
        <Text style={styles.chatTimestamp}>{formattedTime || 'N/A'}</Text>
      </TouchableOpacity>
    );
  };

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
          // keyExtractor={(item, index) => item.id || index.toString()}
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
      <TouchableOpacity style={styles.fab}>
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
    // marginBottom: 10,
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
    width: 10,
    height: 10,
    backgroundColor: '#32CD32',
    borderRadius: 5,
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
});
