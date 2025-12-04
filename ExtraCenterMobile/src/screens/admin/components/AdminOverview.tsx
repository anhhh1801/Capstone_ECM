import React from 'react';
import { View, Text } from 'react-native';
import { Users, GraduationCap } from 'lucide-react-native';

interface Props {
    totalTeachers: number;
    totalStudents: number;
}

export default function AdminOverview({ totalTeachers, totalStudents }: Props) {
    return (
        <View className="flex-row gap-4 mb-6">
            <View className="flex-1 bg-blue-500 p-4 rounded-xl shadow-sm flex-row items-center justify-between">
                <View>
                    <Text className="text-blue-100 text-xs font-bold uppercase">Total Teachers</Text>
                    <Text className="text-white text-2xl font-bold">{totalTeachers}</Text>
                </View>
                <View className="bg-blue-400 p-2 rounded-lg">
                    <Users size={24} color="white" />
                </View>
            </View>

            <View className="flex-1 bg-green-500 p-4 rounded-xl shadow-sm flex-row items-center justify-between">
                <View>
                    <Text className="text-green-100 text-xs font-bold uppercase">Total Students</Text>
                    <Text className="text-white text-2xl font-bold">{totalStudents}</Text>
                </View>
                <View className="bg-green-400 p-2 rounded-lg">
                    <GraduationCap size={24} color="white" />
                </View>
            </View>
        </View>
    );
}