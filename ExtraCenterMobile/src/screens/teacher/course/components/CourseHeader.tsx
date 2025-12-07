import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Edit, ArrowLeft } from 'lucide-react-native';
import { colors } from '@/theme';

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
                <ArrowLeft size={20} color={colors.primary} />
                <Text className="text-primary ml-1">Back</Text>
            </TouchableOpacity>

            <View className="bg-sky-50 p-5 rounded-xl shadow-sm border border-sky-100 relative overflow-hidden">
                <View className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full opacity-50" />

                <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-2">
                        <View className="flex-row flex-wrap items-center gap-2 mb-2">
                            <Text className="text-2xl font-bold text-primary">{course.name}</Text>
                            <View className={`px-2 py-1 rounded-full ${course.status === 'ACTIVE' ? 'bg-primary' : 'bg-secondary'}`}>
                                <Text className={`text-[10px] font-bold ${course.status === 'ACTIVE' ? 'text-white' : 'text-foreground'}`}>
                                    {course.status === 'ACTIVE' ? 'TEACHING' : course.status}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row items-center gap-1">
                            <Text className="text-white font-bold p-2 bg-secondary rounded-xl" numberOfLines={1}>
                                {course.center?.name || "Center is not updated!"}
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
                            <Edit size={20} color={colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}