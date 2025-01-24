import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#f4511e',
                },
                headerShown: false,
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="verifyEmail" options={{
                title: "Verify Email",
                headerStyle: { backgroundColor: "#32CD32" },
                headerTitleAlign: "center",
                headerTintColor: "#fff",
                headerShown: true,
            }} />
        </Stack>
    );
}
