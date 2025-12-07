import React, { useCallback, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '@/api/axiosClient';

// Import Components
import CenterHeader from './components/CenterHeader';
import CenterTabs from './components/CenterTabs';
import CourseListTab from './components/CourseListTab';
import TeacherListTab from './components/TeacherListTab';
import StudentListTab from './components/StudentListTab';
import AssignStudentModal from './components/AssignStudentModal';
import StudentModal from '@/screens/teacher/student/components/StudentModal';
import colors from '@/theme';

const CenterDetail = () => {
    const route = useRoute<any>();
    const { centerId } = route.params;
    const navigation = useNavigation();

    const [centerInfo, setCenterInfo] = useState<any>(null);
    const [courses, setCourses] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [isManager, setIsManager] = useState(false);
    const [activeTab, setActiveTab] = useState<"courses" | "students" | "teachers">("courses");

    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isStudentModalOpen, setStudentModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<any>(null);

    const fetchData = async () => {
        if (!centerId) return;
        try {
            setLoading(true);
            const userStr = await AsyncStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            // 1. Lấy thông tin Center
            const resCenter = await axiosClient.get(`/centers/${centerId}`);
            setCenterInfo(resCenter.data);

            // Check Manager
            const managerCheck = resCenter.data.manager?.id === user.id;
            setIsManager(managerCheck);

            // 2. Lấy Courses
            const resCourses = await axiosClient.get(`/courses?centerId=${centerId}`);
            let fetchedCourses = resCourses.data;
            if (!managerCheck) {
                // Nếu không phải Manager, chỉ hiện khóa học mình dạy
                fetchedCourses = fetchedCourses.filter((c: any) => c.teacher?.id === user.id);
            }
            setCourses(fetchedCourses);

            // 3. Lấy Students
            const resStudents = await axiosClient.get(`/centers/${centerId}/students`);
            setStudents(resStudents.data);

            // 4. Lấy Teachers (Nếu là manager)
            if (managerCheck) {
                const resTeachers = await axiosClient.get(`/centers/${centerId}/teachers`);
                setTeachers(resTeachers.data);
            }

        } catch (error) {
            console.error("Load center's detail fail:", error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (centerId) {
                fetchData();
            }

            // Cleanup function (nếu cần, ở đây để trống)
            return () => { };
        }, [centerId]) // Dependency array: chỉ tạo lại hàm nếu centerId đổi
    );

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>

                {/* 1. Header */}
                <CenterHeader center={centerInfo} isManager={isManager} />

                {/* 2. Tabs */}
                <CenterTabs activeTab={activeTab} setActiveTab={setActiveTab} isManager={isManager} />

                {/* 3. Tab Content */}
                <View>
                    {activeTab === "courses" && (
                        <CourseListTab
                            courses={courses}
                            centerId={centerId}
                            isManager={isManager}
                            onUpdate={fetchData}
                        />
                    )}

                    {activeTab === "teachers" && (
                        <TeacherListTab
                            teachers={teachers}
                            isManager={isManager}
                        />
                    )}

                    {activeTab === "students" && (
                        <StudentListTab
                            students={students}
                            centerId={centerId}
                            onUpdate={fetchData}
                            onOpenAssign={() => setAssignModalOpen(true)}
                            onOpenCreate={(student) => {
                                setEditingStudent(student || null);
                                setStudentModalOpen(true);
                            }}
                        />
                    )}
                </View>
            </ScrollView>

            <AssignStudentModal
                isOpen={isAssignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                centerId={centerId}
                onSuccess={fetchData}
            />
            <StudentModal
                isOpen={isStudentModalOpen}
                onClose={() => setStudentModalOpen(false)}
                onSuccess={fetchData}
                studentToEdit={editingStudent}
                preSelectedCenterId={centerId}
            />
        </SafeAreaView>
    );
};

export default CenterDetail;