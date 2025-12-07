import React from 'react';
import { View, Text } from 'react-native';
import { Book, User, GraduationCap, Calendar } from 'lucide-react-native';
import { colors } from '@/theme';

interface Props {
    course: any;
}

export default function GeneralInfoTab({ course }: Props) {

    const InfoRow = ({ icon: Icon, label, value, color }: any) => (
        <View className="flex-row items-center gap-3 mb-4">
            <View className={`p-2 rounded-lg ${color}`}>
                <Icon size={20} color="#fff" />
            </View>
            <View>
                <Text className="text-xs font-bold text-primary">{label}</Text>
                <Text className="text-foreground">{value}</Text>
            </View>
        </View>
    );

    return (
        <View className="gap-4 ">
            {/* Description Card */}
            <View className="bg-sky-50 p-5 rounded-xl shadow-sm border border-sky-100">
                <Text className="font-bold text-primary mb-3 border-b border-sky-100 pb-2">Course Description</Text>
                <Text className="text-foreground leading-6">
                    {course.description || "Do not have description details."}
                </Text>
            </View>

            {/* Info Grid Card */}
            <View className="bg-sky-50 p-5 rounded-xl shadow-sm border border-sky-100">
                <Text className="font-bold text-prim mb-4 border-b border-sky-100 pb-2">Course Info</Text>

                <InfoRow
                    icon={Book} label="Subject" value={course.subject}
                    color="bg-primary"
                />
                <InfoRow
                    icon={GraduationCap} label="Grade" value={`Grade ${course.grade}`}
                    color="bg-secondary"
                />
                <InfoRow
                    icon={User} label="Teacher" value={`${course.teacher?.lastName} ${course.teacher?.firstName}`}
                    color="bg-yellow-500"
                />
                <InfoRow
                    icon={Calendar} label="Time" value={`${course.startDate} → ${course.endDate}`}
                    color="bg-orange-500"
                />
            </View>
        </View>
    );
}