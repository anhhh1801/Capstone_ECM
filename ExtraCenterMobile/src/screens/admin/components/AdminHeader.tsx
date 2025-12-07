import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme';

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
        <View className="mb-4 flex-row justify-between items-center px-4 py-3 bg-primary rounded-xl">
            <View>
                <Text className="text-2xl font-bold text-white">User Management</Text>
                <Text className="text-white text-xs">Admin Dashboard</Text>
            </View>

            <TouchableOpacity
                onPress={handleLogout}
                className="bg-white p-2 rounded-xl border-2 border-red-500"
            >
                <LogOut size={24} color={colors.accent} />
            </TouchableOpacity>
        </View>
    );
}