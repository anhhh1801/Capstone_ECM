import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Shield, User, GraduationCap } from 'lucide-react-native';

interface Props {
    activeTab: string;
    setActiveTab: (tab: "ADMIN" | "TEACHER" | "STUDENT") => void;
    counts: { admin: number, teacher: number, student: number };
}

export default function AdminTabs({ activeTab, setActiveTab, counts }: Props) {
    const tabs = [
        { key: "ADMIN", label: "Admins", icon: Shield, count: counts.admin },
        { key: "TEACHER", label: "Teachers", icon: User, count: counts.teacher },
        { key: "STUDENT", label: "Students", icon: GraduationCap, count: counts.student },
    ];

    return (
        <View className="border-b border-gray-200 mb-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key as any)}
                            className={`mr-6 pb-3 flex-row items-center gap-2 border-b-2 ${isActive ? "border-blue-600" : "border-transparent"
                                }`}
                        >
                            <tab.icon size={16} color={isActive ? "#2563eb" : "#9ca3af"} />
                            <Text className={`font-bold text-sm ${isActive ? "text-blue-600" : "text-gray-500"}`}>
                                {tab.label} <Text className="text-xs font-normal">({tab.count})</Text>
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}