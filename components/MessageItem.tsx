import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Message } from "@/types/Message";

interface MessageItemProps {
    message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
    const isSent = message.type === "sent";
    const formattedTime = message.createdAt
        ? new Date(message.createdAt).toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })
        : "N/A";

    return (
        // <View style={[styles.messageContainer, isSent && { alignItems: "flex-end" }]}>
        //     <View
        //         style={[styles.message, isSent ? styles.sentMessage : styles.receivedMessage]}
        //     >
        //         <Text
        //             style={[
        //                 styles.messageText,
        //                 isSent ? styles.sentMessageText : styles.receivedMessageText,
        //             ]}
        //         >
        //             {message.text}
        //         </Text>
        //         <View style={styles.infoRow}>
        //             <Text style={styles.timestamp}>{formattedTime}</Text>
        //             {isSent && (
        //                 <MaterialIcons
        //                     name={message.read ? "done-all" : "done"}
        //                     size={16}
        //                     color={message.read ? "#32CD32" : "#6b6b6b"}
        //                     style={styles.readIcon}
        //                 />
        //             )}
        //         </View>
        //     </View>
        // </View>
        <View style={[styles.messageContainer, isSent && { justifyContent: "flex-end", }]}>
            <View style={isSent ? styles.messageRight : styles.messageleft}>
                <Text style={isSent ? { color: "#000" } : { color: "#000" }}>{message.text}</Text>
                <View style={styles.sentTime}>
                    <Text style={styles.timestamp}>{formattedTime}</Text>

                    <MaterialIcons
                        name="done-all"
                        size={16}
                        color="#32CD32"
                        style={styles.readIcon}
                    />
                </View>

                <View style={isSent ? styles.rightArrowBorder : styles.leftArrowBorder}></View>
                <View style={isSent ? styles.rightArrow : styles.leftArrow}></View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // messageContainer: {
    //     marginVertical: 5,
    //     paddingHorizontal: 5,
    // },
    // message: {
    //     padding: 12,
    //     borderRadius: 16,
    //     maxWidth: "70%",
    //     elevation: 1,
    //     shadowColor: "#000",
    //     shadowOffset: { width: 0, height: 2 },
    //     shadowOpacity: 0.15,
    //     shadowRadius: 3,
    // },
    // receivedMessage: {
    //     backgroundColor: "#fcfdf6",
    //     alignSelf: "flex-start",
    //     borderTopLeftRadius: 0,
    //     marginVertical: 4,
    // },
    // sentMessage: {
    //     backgroundColor: "#E4FFCA",
    //     alignSelf: "flex-end",
    //     borderTopRightRadius: 0,
    //     marginVertical: 4,
    // },
    // messageText: {
    //     fontSize: 14,
    // },
    // receivedMessageText: {
    //     color: "#000",
    // },
    // sentMessageText: {
    //     color: "#000",
    // },
    // infoRow: {
    //     flexDirection: "row",
    //     alignItems: "center",
    //     justifyContent: "flex-end",
    //     marginTop: 5,
    // },
    // timestamp: {
    //     fontSize: 12,
    //     color: "#6b6b6b",
    // },
    // readIcon: {
    //     marginLeft: 5,
    // },
    messageContainer: {
        flexDirection: "row",
        marginVertical: 8,
        marginHorizontal: 5,
    },
    messageRight: {
        backgroundColor: "#D9FDD3",
        maxWidth: "80%",
        minWidth: "20%",
        padding: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#D9FDD3",
        position: "relative",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    messageleft: {
        backgroundColor: "#f6f9f3",
        color: "#fff",
        maxWidth: "80%",
        minWidth: "20%",
        padding: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#f6f9f3",
        position: "relative",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    rightArrow: {
        position: "absolute",
        top: -1,
        right: -10,
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "#D9FDD3",
    },
    leftArrow: {
        position: "absolute",
        top: -1,
        left: -10,
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "#f6f9f3",
    },
    rightArrowBorder: {
        position: "absolute",
        top: -1,
        right: -10,
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,
        borderStyle: "solid",
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "#ccc",
    },
    leftArrowBorder: {
        position: "absolute",
        top: -1,
        left: -10,
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,
        borderStyle: "solid",
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "#ccc",
    },
    timestamp: {
        fontSize: 12,
        color: "#6b6b6b",
    },
    readIcon: {
        marginLeft: 5,
    },
    sentTime: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 5
    }

});

export default MessageItem;
