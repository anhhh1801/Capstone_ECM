import React from 'react';
import { View, Text } from 'react-native';
import { Book, User, GraduationCap, Calendar } from 'lucide-react-native';

interface Props {
    course: any;
}

export default function GeneralInfoTab({ course }: Props) {

    const InfoRow = ({ icon: Icon, label, value, color }: any) => (
        <View className="flex-row items-center gap-3 mb-4">
            <View className={`p-2 rounded-lg ${color}`}>
                <Icon size={20} color="#4b5563" />
            </View>
            <View>
                <Text className="text-xs text-gray-500">{label}</Text>
                <Text className="font-medium text-gray-800">{value}</Text>
            </View>
        </View>
    );

    return (
        <View className="gap-4">
            {/* Description Card */}
            <View className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <Text className="font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">Course Description</Text>
                <Text className="text-gray-600 leading-6">
                    {course.description || "Do not have description details."}
                </Text>
            </View>

            {/* Info Grid Card */}
            <View className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <Text className="font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Course Info</Text>

                <InfoRow
                    icon={Book} label="Subject" value={course.subject}
                    color="bg-indigo-50"
                />
                <InfoRow
                    icon={GraduationCap} label="Grade" value={`Grade ${course.grade}`}
                    color="bg-orange-50"
                />
                <InfoRow
                    icon={User} label="Teacher" value={`${course.teacher?.lastName} ${course.teacher?.firstName}`}
                    color="bg-blue-50"
                />
                <InfoRow
                    icon={Calendar} label="Time" value={`${course.startDate} → ${course.endDate}`}
                    color="bg-green-50"
                />
            </View>
        </View>
    );
}