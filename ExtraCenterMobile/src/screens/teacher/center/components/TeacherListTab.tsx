import React from 'react';
import { View, Text } from 'react-native';
import { ShieldAlert, User as UserIcon } from 'lucide-react-native';

interface Props {
    teachers: any[];
    isManager: boolean;
}

export default function TeacherListTab({ teachers, isManager }: Props) {
    if (!isManager) {
        return (
            <View className="items-center justify-center p-10 bg-red-50 rounded-xl border border-red-100">
                <ShieldAlert size={48} color="#ef4444" className="mb-4" />
                <Text className="font-bold text-red-500 text-lg">Access Denied</Text>
                <Text className="text-red-400 text-center">Only Manager Can See This Information.</Text>
            </View>
        );
    }

    return (
        <View>
            <Text className="font-bold text-gray-700 text-lg mb-4">Teacher List ({teachers.length})</Text>
            <View className="gap-3">
                {teachers.map(t => (
                    <View key={t.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-row items-center gap-4">
                        <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                            <Text className="text-blue-600 font-bold text-xl">{t.lastName?.[0]}</Text>
                        </View>
                        <View>
                            <Text className="font-bold text-gray-800 text-lg">{t.firstName} {t.lastName}</Text>
                            <Text className="text-gray-500 text-xs">{t.email}</Text>
                            <Text className="text-gray-500 text-xs">{t.phoneNumber || "---"}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}