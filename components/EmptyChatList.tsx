import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import styles from "@/styles/chatStyles";

const EmptyChatList = () => {
    return (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chats available</Text>
            <MaterialIcons name="chat-bubble-outline" size={48} color="#888888" />
        </View>
    );
};

export default EmptyChatList;