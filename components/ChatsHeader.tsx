import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import SearchBar from './SearchBar';
import styles from "@/styles/chatStyles";

type HeaderProps = {
    searchActive: boolean;
    setSearchActive: (active: boolean) => void;
    searchText: string;
    handleSearch: (text: string) => void;
}

const ChatsHeader = ({
    searchActive,
    setSearchActive,
    searchText,
    handleSearch
}: HeaderProps) => {

    const closeSearch = () => {
        setSearchActive(false);
        handleSearch('');
    };

    return (
        <View style={styles.header}>
            <View style={styles.heading}>
                <Text style={styles.title}>Chats</Text>
                <TouchableOpacity onPress={() => setSearchActive(true)}>
                    <MaterialIcons name="search" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
            {searchActive && (
                <SearchBar
                    searchText={searchText}
                    handleSearch={handleSearch}
                    closeSearch={closeSearch}
                />
            )}
        </View>
    );
};

export default ChatsHeader;