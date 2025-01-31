import { StyleSheet, Platform } from "react-native";
import { Colors } from "@/constants/Colors";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        paddingHorizontal: 5,
        paddingTop: Platform.select({
            ios: 5, // Set paddingTop to 10 for iOS
            android: 20, // Default or other value for Android
        }),
        backgroundColor: "#32CD32",
    },
    heading: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: Colors.light.tint,
    },
    backIconAndUsername: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    avatarAndUsername: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 10,
    },
    headerName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    audioAndVideoIcons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    callIcon: {
        marginRight: 15,
    },
    activeStatus: {
        fontSize: 12,
        color: "#f0f0f0",
    },
    dateHeader: {
        flexDirection: "row",
        alignSelf: "center",
        fontSize: 14,
        color: "#000",
        backgroundColor: "#FAFAF8",
        textAlign: "center",
        marginVertical: 8,
        elevation: 1,
        maxWidth: "50%",
        paddingVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 10
    },
    messageList: {
        flexGrow: 1,
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 60,
    },
    sentMessage: {
        backgroundColor: "#f0f0f0",
        alignSelf: "flex-end",
    },
    messageText: {
        fontSize: 14,
        color: "#fff",
        lineHeight: 20
    },
    receivedMessageText: {
        fontSize: 14,
        color: "#fff",
        lineHeight: 20
    },
    sentMessageText: {
        fontSize: 14,
        color: "#000",
        lineHeight: 20
    },
    audioText: {
        fontSize: 14,
        color: "#fff",
        marginLeft: 5,
    },
    media: {
        width: 150,
        height: 150,
        borderRadius: 10,
        borderWidth: 1,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        backgroundColor: "#fff",
    },
    input: {
        flex: 1,
        padding: 10,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        marginHorizontal: 10,
        minHeight: 40,
        textAlignVertical: "top",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    typingIndicator: {
        fontSize: 14,
        color: "#888",
        fontStyle: "italic",
        paddingHorizontal: 16,
        marginBottom: 5,
    },
    scrollToBottomButton: {
        position: "absolute",
        bottom: 120,
        alignSelf: "flex-end",
        right: 5,
        borderWidth: 0,
        backgroundColor: "#D6DFD4",
        borderRadius: 5,
        padding: 10,
        elevation: 5,
    },
    noConversationContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    noConversationText: {
        fontSize: 16,
        color: "#888",
        textAlign: "center",
    },

});