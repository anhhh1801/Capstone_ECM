import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { UserPlus, Trash2, Edit, PencilLineIcon, MailIcon, PhoneCallIcon } from 'lucide-react-native';
import axiosClient from '@/api/axiosClient';
import { colors } from '@/theme';

interface Props {
    students: any[];
    centerId: number;
    onUpdate: () => void;
    onOpenAssign: () => void;
    onOpenCreate: (student?: any) => void;
}

export default function StudentListTab({ students, centerId, onUpdate, onOpenAssign, onOpenCreate }: Props) {

    const handleRemove = (studentId: number) => {
        Alert.alert("Remove Student", "Sure to remove student from center?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove", style: "destructive",
                onPress: async () => {
                    try {
                        await axiosClient.delete(`/centers/${centerId}/students/${studentId}`);
                        Alert.alert("Remove Successfully");
                        onUpdate();
                    } catch (e) { Alert.alert("Remove fail"); }
                }
            }
        ]);
    };

    return (
        <View>
            <View className="flex-row justify-between items-center mb-4">
                <Text className="font-bold text-primary text-lg">Student ({students.length})</Text>
                <View className="flex-row gap-2">
                    <TouchableOpacity onPress={onOpenAssign} className="bg-secondary px-3 py-2 rounded-lg">
                        <Text className="text-white font-bold text-xs">+ Find</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onOpenCreate()} className="bg-primary px-3 py-2 rounded-lg flex-row items-center gap-1">
                        <UserPlus size={14} color="white" />
                        <Text className="text-white font-bold text-xs">Create New Student</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="gap-3 pb-10">
                {students.map(s => (
                    <View key={s.id} className="bg-sky-50 p-4 rounded-xl border border-sky-100 shadow-sm flex-row justify-between items-center">
                        <View>
                            <Text className="font-bold text-foreground mb-2">{s.firstName} {s.lastName}</Text>
                            <View className="flex-row items-center gap-1 mb-1">
                                <MailIcon size={14} color={colors.secondary} />
                                <Text className="text-sm text-foreground">
                                    {s.email}
                                </Text>
                            </View>
                            {s.phoneNumber ? (
                                <View className="flex-row items-center gap-1 mb-1">
                                    <PhoneCallIcon size={14} color={colors.secondary} />
                                    <Text className="text-sm text-foreground">{s.phoneNumber}</Text>
                                </View>
                            ) : (
                                <Text className="text-xs text-secondary">No Phone Number</Text>
                            )}

                        </View>
                        <View className="flex-row gap-3">
                            <TouchableOpacity onPress={() => onOpenCreate(s)}>
                                <Edit size={20} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleRemove(s.id)}>
                                <Trash2 size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
                {students.length === 0 && <Text className="text-center text-secondary mt-5">Do Not Have Any Student.</Text>}
            </View>
        </View>
    );
}