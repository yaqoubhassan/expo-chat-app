import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import styles from "@/styles/chatStyles";

type SearchBarProps = {
    searchText: string;
    handleSearch: (text: string) => void;
    closeSearch: () => void;
}

const SearchBar = ({ searchText, handleSearch, closeSearch }: SearchBarProps) => {
    return (
        <View style={styles.searchBar}>
            <TextInput
                style={styles.searchInput}
                placeholder="Search by name or email"
                value={searchText}
                onChangeText={handleSearch}
            />
            <TouchableOpacity onPress={closeSearch}>
                <MaterialIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
        </View>
    );
};

export default SearchBar;