// fetchUsers.js
import { BASE_URL } from "@env";
import * as SecureStore from "expo-secure-store";

export const fetchUsers = async (pageNumber = 1, limit = 10) => {
    try {
        const token = await SecureStore.getItemAsync("authToken");
        if (!token) {
            throw new Error("Authentication token is missing. Please log in again.");
        }

        const response = await fetch(`${BASE_URL}/api/users?page=${pageNumber}&limit=${limit}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch users.");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};
