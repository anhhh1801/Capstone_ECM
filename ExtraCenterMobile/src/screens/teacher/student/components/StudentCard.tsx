import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Mail, Phone, Edit, Trash2, MapPin } from 'lucide-react-native';
import colors from '@/theme';

interface Props {
    student: any;
    onEdit: () => void;
    onDelete: () => void;
}

export default function StudentCard({ student, onEdit, onDelete }: Props) {
    return (
        <View className="bg-sky-50 p-4 rounded-xl border border-primary shadow-sm mb-3">
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <Text className="text-lg font-bold text-primary">
                        {student.firstName} {student.lastName}
                    </Text>
                    {student.connectedCenters && student.connectedCenters.length > 0 ? (
                        <View className="flex-row items-center mt-2 flex-wrap">
                            <View className="flex-row bg-secondary border border-blue-200 rounded px-2 py-1 ">
                                <Text className="text-xs text-white font-medium">
                                    {student.connectedCenters[0].name}
                                </Text>
                            </View>

                            {student.connectedCenters.length > 1 && (
                                <Text className="text-xs text-white ml-2 font-medium">
                                    +{student.connectedCenters.length - 1} others
                                </Text>
                            )}
                        </View>
                    ) : (
                        <Text className="text-xs text-accent mt-1 italic">No center assigned</Text>
                    )}
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3">
                    <TouchableOpacity onPress={onEdit} className="p-1">
                        <Edit size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onDelete} className="p-1">
                        <Trash2 size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="space-y-1 mt-2 pt-2 border-t border-primary">
                <View className="flex-row items-center gap-2">
                    <Mail size={14} color={colors.secondary} />
                    <Text className=" text-foreground">{student.email}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <Phone size={14} color={colors.secondary} />
                    <Text className=" text-foreground">{student.phoneNumber || "---"}</Text>
                </View>
            </View>
        </View>
    );
}