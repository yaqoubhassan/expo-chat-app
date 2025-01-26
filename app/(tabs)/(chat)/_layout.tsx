import { Stack } from "expo-router";
import React from "react";

export default function ProfileLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="[chatId]" options={{
                title: "Post Details",
                headerStyle: { backgroundColor: "#6B46C1" },
                headerTintColor: "#fff",
                headerShown: false,
            }} />
        </Stack>

    );
}