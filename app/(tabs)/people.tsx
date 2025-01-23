import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/Colors';
import { SafeAreaView, Platform } from 'react-native';

const DUMMY_USERS = [
  {
    id: '1',
    name: 'Jenny Wilson',
    email: 'wilson@gmail.com',
    avatar: 'https://i.pravatar.cc/300?img=1',
    isActive: true,
  },
  {
    id: '2',
    name: 'Esther Howard',
    email: 'esther@gmail.com',
    avatar: 'https://i.pravatar.cc/300?img=2',
    isActive: false,
  },
  {
    id: '3',
    name: 'Ralph Edwards',
    email: 'ralph@gmail.com',
    avatar: 'https://i.pravatar.cc/300?img=3',
    isActive: false,
  },
  {
    id: '4',
    name: 'Jacob Jones',
    email: 'jacob@gmail.com',
    avatar: 'https://i.pravatar.cc/300?img=4',
    isActive: true,
  },
  {
    id: '5',
    name: 'Albert Flores',
    email: 'albert@gmail.com',
    avatar: 'https://i.pravatar.cc/300?img=5',
    isActive: false,
  }
];

export default function PeopleScreen() {
  const renderUserItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.userItem}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isActive && <View style={styles.activeIndicator} />}
      </View>
      <View style={styles.userDetails}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail} numberOfLines={1}>
          {item.email}
        </Text>
      </View>
      <Text style={styles.userTimestamp}>{item.timestamp}</Text>
    </TouchableOpacity>
  );

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
        data={DUMMY_USERS}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.userList}
      />
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
    // padding: 16,
    backgroundColor: Colors.light.tint,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#32CD32',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  userList: {
    paddingVertical: 10,
  },
  userItem: {
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
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  userEmail: {
    fontSize: 14,
    color: '#888888',
  },
  userTimestamp: {
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
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
});
