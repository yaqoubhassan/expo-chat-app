import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Image
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from "expo-router";

export default function EditProfileScreen() {
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Edit Profile</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.screenBody}>
                    {/* Profile Section */}
                    <View style={styles.profileSection}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={{ uri: 'https://i.pravatar.cc/300' }}
                                style={styles.avatar}
                            />
                            <TouchableOpacity style={styles.addButton}>
                                <MaterialIcons name="add" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Input Fields */}
                    <View style={styles.form}>
                        {[
                            { label: 'Name', placeholder: 'Annette Black', keyboardType: 'default' as const },
                            { label: 'Email', placeholder: 'annette@gmail.com', keyboardType: 'email-address' as const },
                            { label: 'Phone', placeholder: '(316) 555-0116', keyboardType: 'phone-pad' as const },
                        ].map((field, index) => (
                            <View key={index} style={styles.inputGroup}>
                                <Text style={styles.label}>{field.label}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={field.placeholder}
                                    keyboardType={field.keyboardType}
                                    placeholderTextColor="#aaa"
                                />
                            </View>
                        ))}

                        {/* Password Fields */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Old Password</Text>
                            <View style={styles.passwordWrapper}>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showOldPassword}
                                    placeholder="Old Password"
                                    placeholderTextColor="#aaa"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowOldPassword(!showOldPassword)}
                                    style={styles.iconWrapper}
                                >
                                    <MaterialIcons
                                        name={showOldPassword ? 'visibility' : 'visibility-off'}
                                        size={20}
                                        color="#aaa"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>New Password</Text>
                            <View style={styles.passwordWrapper}>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry={!showNewPassword}
                                    placeholder="New Password"
                                    placeholderTextColor="#aaa"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                    style={styles.iconWrapper}
                                >
                                    <MaterialIcons
                                        name={showNewPassword ? 'visibility' : 'visibility-off'}
                                        size={20}
                                        color="#aaa"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton}>
                            <Text style={styles.saveText}>Save Update</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        paddingBottom: 20,
    },
    screenBody: {
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#32CD32',
        paddingHorizontal: 16,
        paddingTop: 30,
        paddingBottom: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileSection: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ddd',
    },
    addButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#32CD32',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    form: {
        marginVertical: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 10,
        fontSize: 16,
        color: '#000',
        width: '100%'
    },
    passwordWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconWrapper: {
        marginLeft: -30,
        padding: 5,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 20
    },
    cancelButton: {
        backgroundColor: '#d3d3d3',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: '#32CD32',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    saveText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
    },
});
