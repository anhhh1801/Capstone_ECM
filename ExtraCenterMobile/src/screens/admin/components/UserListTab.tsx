import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Lock, Unlock, BarChart2, Mail } from 'lucide-react-native';

interface Props {
    users: any[];
    onToggleLock: (user: any) => void;
    onViewStats: (user: any) => void;
}

export default function UserListTab({ users, onToggleLock, onViewStats }: Props) {

    const renderItem = ({ item }: { item: any }) => (
        <View className={`bg-white p-4 mb-3 rounded-xl border shadow-sm ${item.locked ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <Text className={`text-lg font-bold ${item.locked ? 'text-gray-500' : 'text-gray-800'}`}>
                        {item.firstName} {item.lastName}
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <Mail size={12} color="#6b7280" />
                        <Text className="text-gray-500 text-xs ml-1">{item.email}</Text>
                    </View>
                </View>
                {item.locked && <Lock size={20} color="#ef4444" />}
            </View>

            <View className="flex-row gap-3 border-t border-gray-100 pt-3 mt-3">
                <TouchableOpacity
                    onPress={() => onToggleLock(item)}
                    className={`flex-1 py-2 rounded-lg flex-row justify-center items-center gap-2 ${item.locked ? 'bg-green-600' : 'bg-red-50'}`}
                >
                    {item.locked ? <Unlock size={14} color="white" /> : <Lock size={14} color="#ef4444" />}
                    <Text className={`font-bold text-xs ${item.locked ? 'text-white' : 'text-red-600'}`}>
                        {item.locked ? 'Unlock' : 'Lock'}
                    </Text>
                </TouchableOpacity>

                {/* Nút Stats chỉ hiện cho Teacher và Student (Admin thường không có stats) */}
                {item.role.name !== 'ADMIN' && (
                    <TouchableOpacity
                        onPress={() => onViewStats(item)}
                        className="flex-1 bg-gray-100 py-2 rounded-lg flex-row justify-center items-center gap-2"
                    >
                        <BarChart2 size={14} color="#374151" />
                        <Text className="font-bold text-gray-700 text-xs">Statistics</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <FlatList
            data={users}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={<Text className="text-center text-gray-400 mt-10">No users found.</Text>}
            contentContainerStyle={{ paddingBottom: 50 }}
            scrollEnabled={false} // Để ScrollView cha xử lý cuộn
        />
    );
}