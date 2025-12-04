import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Mail, Phone, Edit, Trash2, MapPin } from 'lucide-react-native';

interface Props {
    student: any;
    onEdit: () => void;
    onDelete: () => void;
}

export default function StudentCard({ student, onEdit, onDelete }: Props) {
    return (
        <View className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-3">
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800">
                        {student.firstName} {student.lastName}
                    </Text>
                    {student.connectedCenters && student.connectedCenters.length > 0 ? (
                        <View className="flex-row items-center mt-2 flex-wrap">
                            <View className="flex-row bg-blue-50 border border-blue-200 rounded px-2 py-1 ">
                                <MapPin size={14} color="#2563eb" style={{ marginRight: 4 }} />
                                <Text className="text-xs text-blue-700 font-medium">
                                    {student.connectedCenters[0].name}
                                </Text>
                            </View>

                            {student.connectedCenters.length > 1 && (
                                <Text className="text-xs text-gray-500 ml-2 font-medium">
                                    +{student.connectedCenters.length - 1} others
                                </Text>
                            )}
                        </View>
                    ) : (
                        <Text className="text-xs text-gray-400 mt-1 italic">No center assigned</Text>
                    )}
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3">
                    <TouchableOpacity onPress={onEdit} className="p-1">
                        <Edit size={20} color="#4b5563" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onDelete} className="p-1">
                        <Trash2 size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="space-y-1 mt-2 pt-2 border-t border-gray-50">
                <View className="flex-row items-center gap-2">
                    <Mail size={14} color="#9ca3af" />
                    <Text className="text-sm text-gray-600">{student.email}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <Phone size={14} color="#9ca3af" />
                    <Text className="text-sm text-gray-600">{student.phoneNumber || "---"}</Text>
                </View>
            </View>
        </View>
    );
}