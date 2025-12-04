import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { ShieldAlert, AlertTriangle } from 'lucide-react-native';

interface Props {
    onDeactivate: () => void;
}

export default function DangerZone({ onDeactivate }: Props) {
    const confirmDeactivate = () => {
        Alert.alert(
            "WARNING: Deactivate Account",
            "Are you sure? You will not be able to login again until an Admin reactivates your account.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Deactivate", style: "destructive", onPress: onDeactivate }
            ]
        );
    };

    return (
        <View className="bg-red-50 rounded-xl border border-red-100 overflow-hidden mb-10">
            <View className="p-4 border-b border-red-100 flex-row items-center gap-2">
                <ShieldAlert size={20} color="#b91c1c" />
                <Text className="font-bold text-red-700">Danger Zone</Text>
            </View>

            <View className="p-4">
                <Text className="font-bold text-gray-800 mb-1">Deactivate Account</Text>
                <Text className="text-sm text-gray-500 mb-4">
                    Your account will be locked immediately. You cannot login until you contact support.
                </Text>

                <TouchableOpacity
                    onPress={confirmDeactivate}
                    className="flex-row items-center justify-center bg-white border border-red-300 py-3 rounded-lg active:bg-red-600 active:border-red-600 group"
                >
                    <AlertTriangle size={18} color="#dc2626" style={{ marginRight: 8 }} />
                    <Text className="text-red-600 font-bold">Deactivate Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}