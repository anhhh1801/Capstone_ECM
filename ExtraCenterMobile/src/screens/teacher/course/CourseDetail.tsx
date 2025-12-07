import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '@/api/axiosClient';

// Components
import CourseHeader from './components/CourseHeader';
import CourseTabs from './components/CourseTabs';
import GeneralInfoTab from './components/GeneralInfoTab';
import CourseEnrollmentTab from './components/CourseEnrollmentTab';
import colors from '@/theme';

const CourseDetail = () => {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { courseId } = route.params;

    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isManager, setIsManager] = useState(false);
    const [activeTab, setActiveTab] = useState<"General Info" | "Students" | "Enrollment">("General Info");

    const fetchDetail = async () => {
        try {
            const userStr = await AsyncStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            // Gọi API lấy chi tiết khóa học
            const res = await axiosClient.get(`/courses/${courseId}`);
            setCourse(res.data);

            // Kiểm tra quyền Manager: User hiện tại == Manager của Center chứa khóa học này
            if (res.data.center && res.data.center.manager) {
                if (user.id === res.data.center.manager.id) {
                    setIsManager(true);
                }
            }
        } catch (error) {
            console.error("Error when taking course's detail:", error);
            Alert.alert("Error", "Can not load the course's detail");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) fetchDetail();
    }, [courseId]);

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (!course) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
                <Text className="text-accent">No Course Exist</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
                {/* 1. Header */}
                <CourseHeader course={course} isManager={isManager} />

                {/* 2. Tabs */}
                <CourseTabs activeTab={activeTab} setActiveTab={setActiveTab} isManager={isManager} />

                {/* 3. Content */}
                <View>
                    {activeTab === "General Info" && (
                        <GeneralInfoTab course={course} />
                    )}

                    {activeTab === "Students" && (
                        // Tab này chỉ hiện danh sách (Read Only)
                        <CourseEnrollmentTab courseId={courseId} isManager={false} />
                    )}

                    {activeTab === "Enrollment" && isManager && (
                        // Tab này hiện full chức năng quản lý
                        <CourseEnrollmentTab courseId={courseId} isManager={true} />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CourseDetail;