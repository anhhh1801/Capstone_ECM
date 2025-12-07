import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { BookOpen, Users, UserCog } from 'lucide-react-native';
import colors from '../../../../theme';

interface Props {
    activeTab: string;
    setActiveTab: (tab: "courses" | "students" | "teachers") => void;
    isManager: boolean;
}

export default function CenterTabs({ activeTab, setActiveTab, isManager }: Props) {
    const tabs = [
        { key: "courses", label: "Courses", icon: BookOpen },
        { key: "students", label: "Students", icon: Users },
        ...(isManager ? [{ key: "teachers", label: "Teachers", icon: UserCog }] : [])
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
                            className={`mr-6 pb-3 flex-row items-center gap-2 border-b-2 ${isActive ? 'border-primary' : 'border-transparent'}`}>
                            <tab.icon size={18} color={isActive ? colors.primary : colors.secondary} />
                            <Text className={`font-medium ${isActive ? 'text-primary' : 'text-secondary'}`}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}