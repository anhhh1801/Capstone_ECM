import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { BookOpen, Users, UserCog } from 'lucide-react-native';

interface Props {
    activeTab: string;
    setActiveTab: (tab: "General Info" | "Students" | "Enrollment") => void;
    isManager: boolean;
}

export default function CourseTabs({ activeTab, setActiveTab, isManager }: Props) {
    const tabs = [
        { key: "General Info", label: "General Info", icon: BookOpen },
        { key: "Students", label: "Students", icon: Users },
        ...(isManager ? [{ key: "Enrollment", label: "Enrollment", icon: UserCog }] : [])
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
                            <tab.icon size={18} color={isActive ? "#2563eb" : "#6b7280"} />
                            <Text className={`font-medium ${isActive ? "text-blue-600" : "text-gray-500"}`}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}