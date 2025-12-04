import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminHeader() {
    const navigation = useNavigation<any>();

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem("user");
                            await AsyncStorage.removeItem("accessToken");

                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        } catch (error) {
                            console.error("Logout error", error);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View className="mb-4 flex-row justify-between items-center">
            <View>
                <Text className="text-2xl font-bold text-gray-800">User Management</Text>
                <Text className="text-gray-500 text-xs">Admin Dashboard</Text>
            </View>

            <TouchableOpacity
                onPress={handleLogout}
                className="bg-red-50 p-2.5 rounded-xl border border-red-100"
            >
                <LogOut size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>
    );
}