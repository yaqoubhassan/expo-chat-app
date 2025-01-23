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
            {/* <Stack.Screen name="(register)" /> */}
        </Stack>
    );
    // return <Stack screenOptions={{ headerShown: true, title: "Register" }} />;
}
