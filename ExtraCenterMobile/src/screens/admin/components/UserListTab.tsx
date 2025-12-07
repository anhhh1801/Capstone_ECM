import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Lock, Unlock, BarChart2, Mail } from 'lucide-react-native';
import colors from '@/theme';

interface Props {
    users: any[];
    onToggleLock: (user: any) => void;
    onViewStats: (user: any) => void;
}

export default function UserListTab({ users, onToggleLock, onViewStats }: Props) {

    const renderItem = ({ item }: { item: any }) => (
        <View className={`p-4 mb-3 rounded-xl border shadow-sm border-2 bg-white ${item.locked ? 'border-accent bg-red-100' : 'border-primary bg-sky-50'}`}>
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <Text className={`text-lg font-bold text-primary mb-1`}>
                        {item.firstName} {item.lastName}
                    </Text>
                    <View className="flex-row items-center mt-1">
                        <Mail size={12} color={colors.secondary} />
                        <Text className="text-foreground text-xs ml-1">{item.email}</Text>
                    </View>
                </View>
                {item.locked && <Lock size={20} color="#ef4444" />}
            </View>

            <View className="flex-row gap-3 border-t border-sky-100 pt-3 mt-3">
                <TouchableOpacity
                    onPress={() => onToggleLock(item)}
                    className={`flex-1 py-2 rounded-lg flex-row justify-center items-center gap-2 border-2 bg-white ${item.locked ? 'border-secondary' : 'border-accent'}`}
                >
                    {item.locked ? <Unlock size={14} color={colors.secondary} /> : <Lock size={14} color={colors.accent} />}
                    <Text className={`font-bold text-xs ${item.locked ? 'text-secondary' : 'text-red-600'}`}>
                        {item.locked ? 'Unlock' : 'Lock'}
                    </Text>
                </TouchableOpacity>

                {/* Nút Stats chỉ hiện cho Teacher và Student (Admin thường không có stats) */}
                {item.role.name !== 'ADMIN' && (
                    <TouchableOpacity
                        onPress={() => onViewStats(item)}
                        className="flex-1 bg-sky-50 py-2 rounded-lg flex-row justify-center items-center gap-2 border-2 border-primary"
                    >
                        <BarChart2 size={14} color="#374151" />
                        <Text className="font-bold text-foreground text-xs">Statistics</Text>
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
            ListEmptyComponent={<Text className="text-center text-secondary mt-10">No users found.</Text>}
            contentContainerStyle={{ paddingBottom: 50 }}
            scrollEnabled={false} // Để ScrollView cha xử lý cuộn
        />
    );
}