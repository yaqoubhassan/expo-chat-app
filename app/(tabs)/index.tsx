import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/Colors';
import { SafeAreaView, Platform } from 'react-native';

const DUMMY_CHATS = [
  {
    id: '1',
    name: 'Jenny Wilson',
    message: 'Hope you are doing well...',
    timestamp: '3m ago',
    avatar: 'https://i.pravatar.cc/300?img=1',
    isActive: true,
  },
  {
    id: '2',
    name: 'Esther Howard',
    message: 'Hello Abdullah! I am...',
    timestamp: '8m ago',
    avatar: 'https://i.pravatar.cc/300?img=2',
    isActive: false,
  },
  {
    id: '3',
    name: 'Ralph Edwards',
    message: 'Do you have update...',
    timestamp: '5d ago',
    avatar: 'https://i.pravatar.cc/300?img=3',
    isActive: false,
  },
  {
    id: '4',
    name: 'Jacob Jones',
    message: "You're welcome :)",
    timestamp: '5d ago',
    avatar: 'https://i.pravatar.cc/300?img=4',
    isActive: true,
  },
  {
    id: '5',
    name: 'Albert Flores',
    message: 'Thanks',
    timestamp: '6d ago',
    avatar: 'https://i.pravatar.cc/300?img=5',
    isActive: false,
  },
];

export default function ChatsScreen() {
  const renderChatItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.chatItem}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isActive && <View style={styles.activeIndicator} />}
      </View>
      <View style={styles.chatDetails}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.chatMessage} numberOfLines={1}>
          {item.message}
        </Text>
      </View>
      <Text style={styles.chatTimestamp}>{item.timestamp}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.title}>Chats</Text>
          <TouchableOpacity>
            <MaterialIcons name="search" size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Recent Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButtonActive}>
            <Text style={styles.filterTextActive}>Active</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={DUMMY_CHATS}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.chatList}
      />
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
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.light.tint,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#32CD32',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  filters: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.light.background,
  },
  filterButton: {
    marginRight: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  filterText: {
    fontSize: 14,
    color: '#32CD32',
    fontWeight: '500',
  },
  activeFilter: {
    backgroundColor: Colors.light.tint,
  },
  activeFilterText: {
    color: '#fff',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  filterButtonActive: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: 'rgba(34, 139, 34, 0)',
    borderRadius: 20,
    borderColor: "#FFF",
    borderWidth: 1

  },
  filterTextActive: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  chatTime: {
    fontSize: 12,
    color: '#AAAAAA',
  },
});
