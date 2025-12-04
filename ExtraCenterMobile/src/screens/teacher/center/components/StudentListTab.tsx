import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { UserPlus, Trash2, Edit } from 'lucide-react-native';
import axiosClient from '@/api/axiosClient';

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
                <Text className="font-bold text-gray-700 text-lg">Student ({students.length})</Text>
                <View className="flex-row gap-2">
                    <TouchableOpacity onPress={onOpenAssign} className="bg-blue-50 px-3 py-2 rounded-lg">
                        <Text className="text-blue-600 font-bold text-xs">+ Find</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onOpenCreate()} className="bg-green-600 px-3 py-2 rounded-lg flex-row items-center gap-1">
                        <UserPlus size={14} color="white" />
                        <Text className="text-white font-bold text-xs">Create New Student</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="gap-3 pb-10">
                {students.map(s => (
                    <View key={s.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex-row justify-between items-center">
                        <View>
                            <Text className="font-bold text-gray-800">{s.firstName} {s.lastName}</Text>
                            <Text className="text-xs text-gray-500">{s.email}</Text>
                            <Text className="text-xs text-gray-500">{s.phoneNumber || "---"}</Text>
                        </View>
                        <View className="flex-row gap-3">
                            <TouchableOpacity onPress={() => onOpenCreate(s)}>
                                <Edit size={20} color="#2563eb" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleRemove(s.id)}>
                                <Trash2 size={20} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
                {students.length === 0 && <Text className="text-center text-gray-400 mt-5">Do Not Have Any Student.</Text>}
            </View>
        </View>
    );
}