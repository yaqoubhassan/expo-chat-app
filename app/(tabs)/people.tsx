import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native";
import { fetchUsers } from "@/services/fetchUsers"; // Adjust the path
import UserItem from "@/components/UserItem";
import { User } from "@/types/User"; // Adjust the path
import { Colors } from "@/constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useProfile } from "@/context/ProfileContext";
import io, { Socket } from "socket.io-client";

export default function PeopleScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { profile } = useProfile();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const setupSocket = async () => {
      // const token = await SecureStore.getItemAsync("authToken");
      const newSocket = io("http://192.168.1.163:3000", {
        transports: ["websocket"],
        query: { userId: profile?.id }, // Replace dynamically
      });
      newSocket.on("userStatusChange", (onlineUserIds) => {
        setOnlineUsers(onlineUserIds);
      });
      setSocket(newSocket);
      return () => newSocket.disconnect();
    };
    setupSocket();
  }, []);

  const isUserOnline = (userId: string) => onlineUsers.includes(userId);

  const getUsers = async (pageNumber = 1, refreshing = false) => {
    if (!refreshing) setIsLoading(true);

    try {
      const data = await fetchUsers(pageNumber, 10);
      const newUsers = data.data as User[];

      setUsers((prev) => (refreshing ? newUsers : [...prev, ...newUsers]));
      setHasMore(pageNumber < data.meta.totalPages);
    } catch (error) {
      Alert.alert("Error", "Unable to fetch users. Please try again later.");
    } finally {
      if (!refreshing) setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadMoreUsers = () => {
    if (isLoading || !hasMore) return;
    setPage((prev) => prev + 1);
  };

  const refreshUsers = () => {
    setIsRefreshing(true);
    setPage(1);
    getUsers(1, true);
  };

  useEffect(() => {
    getUsers(page);
  }, [page]);


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.title}>People</Text>
          <TouchableOpacity>
            <MaterialIcons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item, index) => item.id || `user-${index}`}
        renderItem={({ item }) => <UserItem item={item} isOnline={isUserOnline(item._id)} />}
        onEndReached={loadMoreUsers}
        onEndReachedThreshold={0.5}
        refreshing={isRefreshing}
        onRefresh={refreshUsers}
        contentContainerStyle={styles.userList}
        ListFooterComponent={
          isLoading && !isRefreshing ? (
            <ActivityIndicator size="small" color={Colors.light.tint} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: Colors.light.tint,
  },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userList: {
    paddingVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  centerEmptyList: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyMessage: {
    fontSize: 16,
    color: Colors.light.tint,
    textAlign: "center",
  },
});
