import React from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { X, Building2, BookOpen, Users } from 'lucide-react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
    user: any;
    stats: any;
    loading: boolean;
}

export default function StatsModal({ visible, onClose, user, stats, loading }: Props) {
    const isTeacher = user?.role?.name === 'TEACHER';

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/50 justify-center items-center p-6">
                <View className="bg-white w-full rounded-2xl p-6 shadow-xl relative">
                    <TouchableOpacity onPress={onClose} className="absolute top-4 right-4 z-10 p-1 bg-gray-100 rounded-full">
                        <X size={20} color="#374151" />
                    </TouchableOpacity>

                    <Text className="text-xl font-bold text-gray-800 mb-1 text-center">
                        {isTeacher ? "Teacher Statistics" : "Student Statistics"}
                    </Text>
                    <Text className="text-sm text-gray-500 mb-6 text-center">
                        {user?.firstName} {user?.lastName}
                    </Text>

                    {loading ? (
                        <ActivityIndicator size="large" color="#2563eb" className="py-10" />
                    ) : stats ? (
                        <View className="gap-4">
                            {/* Dòng 1: Center */}
                            <View className="flex-row justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <View className="flex-row items-center gap-2">
                                    <Building2 size={18} color="#1d4ed8" />
                                    <Text className="text-blue-800 font-medium">
                                        {isTeacher ? "Managed Centers" : "Joined Centers"}
                                    </Text>
                                </View>
                                <Text className="text-2xl font-bold text-blue-600">{stats.totalCenters}</Text>
                            </View>

                            {/* Dòng 2: Course */}
                            <View className="flex-row justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                                <View className="flex-row items-center gap-2">
                                    <BookOpen size={18} color="#c2410c" />
                                    <Text className="text-orange-800 font-medium">
                                        {isTeacher ? "Courses Taught" : "Joined Courses"}
                                    </Text>
                                </View>
                                <Text className="text-2xl font-bold text-orange-600">{stats.totalCourses}</Text>
                            </View>

                            {/* Dòng 3: Student (Chỉ hiện cho Teacher) */}
                            {isTeacher && (
                                <View className="flex-row justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                                    <View className="flex-row items-center gap-2">
                                        <Users size={18} color="#15803d" />
                                        <Text className="text-green-800 font-medium">Total Students</Text>
                                    </View>
                                    <Text className="text-2xl font-bold text-green-600">{stats.totalStudents}</Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <Text className="text-center text-red-400">No data available.</Text>
                    )}

                    <TouchableOpacity onPress={onClose} className="mt-6 bg-gray-900 py-3 rounded-xl items-center">
                        <Text className="text-white font-bold">Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}