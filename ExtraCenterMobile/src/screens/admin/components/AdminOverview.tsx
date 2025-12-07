import React from 'react';
import { View, Text } from 'react-native';
import { Users, GraduationCap } from 'lucide-react-native';
import colors from '@/theme';

interface Props {
    totalTeachers: number;
    totalStudents: number;
}

export default function AdminOverview({ totalTeachers, totalStudents }: Props) {
    return (
        <View className="flex-row gap-4 mb-6">

            {/* Total Teachers Card */}
            <View className="flex-1 bg-primary p-4 rounded-xl shadow-sm">
                {/* Title full width */}
                <Text className="text-white text-xs font-bold uppercase mb-2">
                    Total Teachers
                </Text>

                {/* Number + Icon same row */}
                <View className="flex-row items-center justify-center gap-2">
                    <Text className="text-white text-2xl font-bold">{totalTeachers}</Text>
                    <View className="bg-white border-2 border-primary p-2 rounded-lg">
                        <Users size={20} color={colors.primary} />
                    </View>
                </View>
            </View>

            {/* Total Students Card */}
            <View className="flex-1 bg-secondary p-4 rounded-xl shadow-sm">
                <Text className="text-white text-xs font-bold uppercase mb-2">
                    Total Students
                </Text>

                <View className="flex-row items-center justify-center gap-2">
                    <Text className="text-white text-2xl font-bold">{totalStudents}</Text>
                    <View className="bg-white border-2 border-secondary p-2 rounded-lg">
                        <GraduationCap size={20} color={colors.secondary} />
                    </View>
                </View>
            </View>

        </View>

    );
}