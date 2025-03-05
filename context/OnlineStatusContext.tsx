import React, {
    createContext,
    useState,
    useContext,
    useEffect,
    ReactNode,
    useCallback
} from 'react';
import { usePathname } from 'expo-router';
import { useFocusEffect } from "@react-navigation/native";
import { useProfile } from './ProfileContext';
import io, { Socket } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import { AppState } from "react-native";

const SOCKET_URL = "http://192.168.1.163:3000";

// Define the shape of the context
interface OnlineStatusContextType {
    onlineUsers: string[];
    isUserOnline: (userId: string) => boolean;
    setOnlineUsers?: (users: string[]) => void;
}

// Create the context
const OnlineStatusContext = createContext<OnlineStatusContextType>({
    onlineUsers: [],
    isUserOnline: () => false,
});

// Provider component
export const OnlineStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const pathname = usePathname();
    const { profile } = useProfile();
    const [socket, setSocket] = useState<any>(null);

    // Exclude routes where user is not considered online
    const excludedRoutes = [
        '/(auth)/login',
        '/(auth)/register',
        '/(auth)/verify'
    ];

    // Function to check if current route allows online status
    const isOnlineRoute = () => {
        return !excludedRoutes.some(route => pathname?.startsWith(route));
    };

    // Modify setOnlineUsers to only update when on an online route
    const safeSetOnlineUsers = (users: string[]) => {
        if (isOnlineRoute()) {
            setOnlineUsers(users);
        }
    };

    // Function to check if a specific user is online
    const isUserOnline = (userId: string) => {
        return onlineUsers.includes(userId);
    };

    useFocusEffect(
        useCallback(() => {
            if (!profile?.id) {
                console.log("User ID not available, skipping socket setup");
                return;
            }

            let socketInstance: any = null;

            const setupSocket = async () => {
                try {
                    const token = await SecureStore.getItemAsync("authToken");
                    if (!token) {
                        console.error("No auth token for socket connection");
                        return;
                    }

                    // Disconnect any existing socket before creating a new one
                    if (socket) {
                        socket.disconnect();
                    }

                    socketInstance = io(SOCKET_URL, {
                        transports: ["websocket"],
                        query: { token, userId: profile?.id },
                    });

                    socketInstance.on("connect", () => {
                        socketInstance.emit("joinRoom", profile?.id);
                    });

                    socketInstance.on("connect_error", (error: any) => {
                        console.error("Socket connection error:", error);
                    });

                    // Update online users when the backend sends updates
                    socketInstance.on("userStatusChange", (onlineUserIds: string[]) => {
                        // console.log('User status changed', {
                        //     previousOnlineUsers: Array.from(onlineUsers),
                        //     newOnlineUsers: onlineUserIds
                        // });
                        setOnlineUsers(onlineUserIds);
                    });

                    setSocket(socketInstance);
                } catch (error) {
                    console.error("Error setting up socket1:", error);
                }
            };

            setupSocket();

            // Listen for app state changes (active/inactive)
            const handleAppStateChange = (nextAppState: any) => {
                if (nextAppState === "active") {
                    setupSocket(); // Reconnect socket when the app is active
                } else {
                    socketInstance?.disconnect();
                }
            };

            const appStateListener = AppState.addEventListener("change", handleAppStateChange);

            return () => {
                if (socketInstance) {
                    socketInstance.off("userStatusChange");
                    socketInstance.off("connect");
                    socketInstance.off("connect_error");
                    socketInstance.disconnect();
                }
                appStateListener.remove();
            };
        }, [profile?.id])
    )

    return (
        <OnlineStatusContext.Provider
            value={{
                onlineUsers,
                isUserOnline,
                setOnlineUsers,
            }}
        >
            {children}
        </OnlineStatusContext.Provider>
    );
};

// Custom hook to use the online status context
export const useOnlineStatus = () => {
    const context = useContext(OnlineStatusContext);
    if (!context) {
        throw new Error('useOnlineStatus must be used within an OnlineStatusProvider');
    }
    return context;
};