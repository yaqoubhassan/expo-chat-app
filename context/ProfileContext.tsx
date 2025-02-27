import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "@env";
import { useRouter } from "expo-router";

interface ProfileContextData {
    profile: Record<string, any> | null; // Replace `any` with your profile type
    setProfile: (profile: Record<string, any> | null) => void;
    fetchProfile: () => Promise<void>;
    isLoading: boolean; // Added loading state
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
    const [profile, setProfile] = useState<Record<string, any> | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();

    const fetchProfile = async () => {
        setIsLoading(true);

        try {
            const token = await SecureStore.getItemAsync("authToken");
            if (!token) {
                console.error("No auth token found");
                setProfile(null);
                // Don't immediately redirect - let the component decide what to do
                return;
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
                // If it's not valid JSON, use the raw text
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
                setProfile(data.data); // Save profile data
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
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch profile on component mount with proper dependency array
    useEffect(() => {
        fetchProfile();
    }, [router]); // Add router to dependency array since it's used inside fetchProfile

    return (
        <ProfileContext.Provider value={{ profile, setProfile, fetchProfile, isLoading }}>
            {children}
        </ProfileContext.Provider>
    );
};