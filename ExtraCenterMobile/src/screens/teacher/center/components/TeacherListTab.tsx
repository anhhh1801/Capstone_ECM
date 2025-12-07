import React from 'react';
import { View, Text } from 'react-native';
import { MailIcon, PhoneCallIcon, ShieldAlert, User as UserIcon } from 'lucide-react-native';
import { colors } from '@/theme';

interface Props {
    teachers: any[];
    isManager: boolean;
}

export default function TeacherListTab({ teachers, isManager }: Props) {
    if (!isManager) {
        return (
            <View className="items-center justify-center p-10 bg-red-50 rounded-xl border border-red-100">
                <ShieldAlert size={48} color={colors.accent} className="mb-4" />
                <Text className="font-bold text-accent text-lg">Access Denied</Text>
                <Text className="text-foreground text-center">Only Manager Can See This Information.</Text>
            </View>
        );
    }

    return (
        <View>
            <Text className="font-bold text-primary text-lg mb-4">Teacher List ({teachers.length})</Text>
            <View className="gap-3">
                {teachers.map(t => (
                    <View key={t.id} className="bg-sky-50 p-4 rounded-xl border border-sky-100 shadow-sm flex-row items-center gap-4">
                        <View className="w-12 h-12 bg-white rounded-full border-primary border-2 items-center justify-center">
                            <Text className="text-primary font-bold text-lg">{t.firstName?.[0]}</Text>
                        </View>
                        <View>
                            <Text className="font-bold text-foreground text-lg">{t.firstName} {t.lastName}</Text>
                            <View className="flex-row items-center gap-1 mb-1">
                                <MailIcon size={14} color={colors.secondary} />
                                <Text className="text-sm text-foreground">
                                    {t.email}
                                </Text>
                            </View>
                            {t.phoneNumber ? (
                                <View className="flex-row items-center gap-1 mb-1">
                                    <PhoneCallIcon size={14} color={colors.secondary} />
                                    <Text className="text-sm text-foreground">{t.phoneNumber}</Text>
                                </View>
                            ) : (
                                <Text className="text-xs text-secondary">No Number!</Text>
                            )}
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}