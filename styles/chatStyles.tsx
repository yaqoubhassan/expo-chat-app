import { StyleSheet, Platform } from "react-native";
import { Colors } from "@/constants/Colors";

export default StyleSheet.create({
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
    // New styles for typing indicator
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 20,
    },
    typingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#32CD32',
        marginRight: 4,
    },

});