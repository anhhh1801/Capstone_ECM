import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Edit, ArrowLeft } from 'lucide-react-native';

interface Props {
    course: any;
    isManager: boolean;
}

export default function CourseHeader({ course, isManager }: Props) {
    const navigation = useNavigation<any>();

    if (!course) return null;

    return (
        <View className="mb-4">
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="flex-row items-center mb-4"
            >
                <ArrowLeft size={20} color="#6b7280" />
                <Text className="text-gray-500 ml-1">Back</Text>
            </TouchableOpacity>

            <View className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
                <View className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full opacity-50" />

                <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-2">
                        <View className="flex-row flex-wrap items-center gap-2 mb-2">
                            <Text className="text-2xl font-bold text-gray-800">{course.name}</Text>
                            <View className={`px-2 py-1 rounded-full ${course.status === 'ACTIVE' ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <Text className={`text-[10px] font-bold ${course.status === 'ACTIVE' ? 'text-green-700' : 'text-gray-600'}`}>
                                    {course.status || "ACTIVE"}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-center gap-1">
                            <MapPin size={16} color="#3b82f6" />
                            <Text className="text-gray-500 text-xs">
                                {course.center?.name || "Center have not updated yet"}
                            </Text>
                        </View>
                    </View>

                    {isManager && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate("CreateCourse", {
                                courseId: course.id,
                                isEdit: true,
                                centerId: course.center?.id
                            })}
                            className="bg-blue-50 p-2 rounded-lg"
                        >
                            <Edit size={20} color="#2563eb" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}