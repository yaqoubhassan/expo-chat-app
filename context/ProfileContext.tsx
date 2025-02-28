import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "@env";
import { useRouter } from "expo-router";

// Define proper types for your profile
interface Profile {
    id: string;
    // Add other profile properties here
    [key: string]: any;
}

interface ProfileContextData {
    profile: Profile | null;
    setProfile: (profile: Profile | null) => void;
    fetchProfile: () => Promise<Profile | null>;
    isLoading: boolean;
    clearProfile: () => Promise<void>; // Added for logout functionality
}

const ProfileContext = createContext<ProfileContextData | null>(null);

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error("useProfile must be used within a ProfileProvider");
    }
    return context;
};

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    // Try to load cached profile on mount
    useEffect(() => {
        const loadCachedProfile = async () => {
            try {
                const cachedProfileJson = await SecureStore.getItemAsync("cachedProfile");
                if (cachedProfileJson) {
                    const cachedProfile = JSON.parse(cachedProfileJson);
                    setProfile(cachedProfile);
                }
            } catch (error) {
                console.error("Error loading cached profile:", error);
            }
        };

        loadCachedProfile();
    }, []);

    const fetchProfile = async (): Promise<Profile | null> => {
        setIsLoading(true);

        try {
            const token = await SecureStore.getItemAsync("authToken");
            if (!token) {
                console.error("No auth token found");
                setProfile(null);
                return null;
            }

            const response = await fetch(`${BASE_URL}/users/profile`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            // Try to parse response as JSON first
            let data;
            const responseText = await response.text();

            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error("Failed to parse response as JSON", parseError);

                if (!response.ok) {
                    throw new Error(`Error fetching profile: ${response.status} ${response.statusText || responseText}`);
                }
            }

            if (!response.ok) {
                // If we have JSON error data, use it
                if (data && data.message) {
                    throw new Error(data.message);
                } else {
                    throw new Error(`Error fetching profile: ${response.status}`);
                }
            }

            // At this point we have a successful response
            if (data.status === "success" && data.data) {
                const profileData = data.data;
                setProfile(profileData); // Save profile data

                // Cache the profile data
                await SecureStore.setItemAsync("cachedProfile", JSON.stringify(profileData));

                return profileData;
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
            setProfile(null); // Reset profile on error

            // Only redirect for authentication errors, not all errors
            if (error instanceof Error &&
                (error.message.includes("401") ||
                    error.message.includes("unauthorized") ||
                    error.message.includes("No auth token found"))) {
                router.replace("/(auth)/login");
            }

            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Function to clear profile (for logout)
    const clearProfile = async () => {
        setProfile(null);
        try {
            await SecureStore.deleteItemAsync("cachedProfile");
            await SecureStore.deleteItemAsync("authToken");
        } catch (error) {
            console.error("Error clearing profile data:", error);
        }
    };

    // Don't automatically fetch on mount - let components decide when to fetch

    return (
        <ProfileContext.Provider value={{
            profile,
            setProfile,
            fetchProfile,
            isLoading,
            clearProfile
        }}>
            {children}
        </ProfileContext.Provider>
    );
};