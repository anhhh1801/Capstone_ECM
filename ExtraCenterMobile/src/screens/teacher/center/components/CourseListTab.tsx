import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus, Trash2, Mail, Edit } from 'lucide-react-native';
import { Course } from '@/api/courseService';
import axiosClient from '@/api/axiosClient';
import colors from '@/theme';

interface Props {
    courses: Course[];
    centerId: number;
    isManager: boolean;
    onUpdate: () => void;
}

export default function CourseListTab({ courses, centerId, isManager, onUpdate }: Props) {
    const navigation = useNavigation<any>();

    const [inviteModalVisible, setInviteModalVisible] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [inviteEmail, setInviteEmail] = useState("");

    const handleDelete = (courseId: number) => {
        Alert.alert("Delete Course", "Sure to delete?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await axiosClient.delete(`/courses/${courseId}`);
                        Alert.alert("Successful", "Course Deleted");
                        onUpdate();
                    } catch (e) {
                        Alert.alert("Error", "Can Not Delete Course");
                    }
                }
            }
        ]);
    };

    const handleInviteSubmit = async () => {
        if (!selectedCourseId || !inviteEmail) return;
        try {
            await axiosClient.post(`/courses/${selectedCourseId}/invite?email=${inviteEmail}`);
            Alert.alert("Complete", "Invitations sent!");
            setInviteModalVisible(false);
            setInviteEmail("");
        } catch (e) {
            Alert.alert("Error", "Invitations sent fail");
        }
    };

    const openInviteModal = (courseId: number) => {
        setSelectedCourseId(courseId);
        setInviteModalVisible(true);
    };

    return (
        <View>
            <View className="flex-row justify-between items-center mb-4">
                <Text className="font-bold text-primary text-lg">
                    {isManager ? "All Courses" : "Invited Courses"}
                </Text>
                {isManager && (
                    <TouchableOpacity
                        onPress={() => navigation.navigate("CreateCourse", { centerId })}
                        className="bg-primary px-4 py-2 rounded-lg flex-row items-center"
                    >
                        <Plus size={16} color="white" />
                        <Text className="text-white font-bold ml-1">
                            Add</Text>
                    </TouchableOpacity>
                )}
            </View>

            {courses.length === 0 ? (
                <Text className="text-center text-gray-500 py-10">Do Not Have Any Course.</Text>
            ) : (
                courses.map((course) => (
                    <View key={course.id} className="bg-sky-50 p-5 rounded-xl shadow-sm border border-sky-100">
                        <TouchableOpacity onPress={() => navigation.navigate("CourseDetail", { courseId: course.id })}>
                            <View className="flex-row justify-between items-start mb-1">
                                <View className="flex-1">

                                    <Text className="text-primary font-bold text-lg">{course.name}</Text>

                                    <Text className="text-foreground text-xs">Subject: <Text className="text-secondary font-bold">{course.subject}</Text> - Grade: <Text className="text-secondary font-bold">{course.grade}</Text></Text>
                                </View>
                                {isManager && (
                                    <View className="flex-row gap-3">
                                        <TouchableOpacity onPress={() => navigation.navigate("CreateCourse", { courseId: course.id, isEdit: true, centerId: centerId })}>
                                            <Edit size={18} color={colors.primary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete(course.id)}>
                                            <Trash2 size={18} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            {isManager && (
                                <View className="mt-2 pt-2 border-t border-gray-50 flex-row justify-between items-center">
                                    <View>
                                        <Text className="text-l text-foreground">Teacher: <Text className='text-secondary font-bold'>{course.teacher?.firstName || "Not have"}</Text></Text>
                                        {course.invitationStatus === "PENDING" && <Text className="text-xs text-orange-500 italic">Waiting...</Text>}
                                    </View>
                                    <TouchableOpacity onPress={() => openInviteModal(course.id)} className="flex-row items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                                        <Mail size={12} color={colors.primary} />
                                        <Text className="text-primary text-xs font-bold">Invite Teacher</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                ))
            )}

            {/* Modal Mời Giáo Viên (Custom Modal đơn giản) */}
            <Modal visible={inviteModalVisible} transparent animationType="fade">
                <View className="flex-1 bg-black/50 justify-center items-center p-4">
                    <View className="bg-white w-full max-w-sm p-6 rounded-xl">
                        <Text className="text-lg font-bold mb-4">Invite teacher</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 mb-4"
                            placeholder="Enter teacher's email..."
                            value={inviteEmail}
                            onChangeText={setInviteEmail}
                            autoCapitalize="none"
                        />
                        <View className="flex-row justify-end gap-3">
                            <TouchableOpacity onPress={() => setInviteModalVisible(false)}>
                                <Text className="text-gray-500 font-bold px-3 py-2">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleInviteSubmit} className="bg-blue-600 px-4 py-2 rounded-lg">
                                <Text className="text-white font-bold">Send Invitation</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}