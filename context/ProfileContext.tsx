import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { BASE_URL } from "@env";
import { useRouter } from "expo-router";

interface ProfileContextData {
    profile: Record<string, any> | null; // Replace `any` with your profile type
    setProfile: (profile: Record<string, any> | null) => void;
    fetchProfile: () => Promise<void>; // Add a method to refetch the profile if needed
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
    const router = useRouter();

    const fetchProfile = async () => {
        try {
            const token = await SecureStore.getItemAsync("authToken");
            if (!token) {
                console.error("No auth token found");
                setProfile(null);
                return;
            }

            const response = await fetch(`${BASE_URL}/users/profile`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorBody = await response.text(); // Read the body once
                throw new Error(`Error fetching profile: ${response.status} ${response.statusText || errorBody}`);
            }

            const data = await response.json(); // Parse JSON body

            if (data.status === "success" && data.data) {
                setProfile(data.data); // Save profile data
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error) {
            // console.error("Error fetching profile data:", error);
            setProfile(null); // Reset profile on error
            router.replace("/(auth)/login");
        }
    };


    // Fetch profile on component mount
    useEffect(() => {
        fetchProfile();
    }, []);

    return (
        <ProfileContext.Provider value={{ profile, setProfile, fetchProfile }}>
            {children}
        </ProfileContext.Provider>
    );
};
