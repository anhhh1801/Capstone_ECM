import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookOpen, Users, Building2, Plus, CheckCircle } from 'lucide-react-native';

// Import API
import { getMyCenters } from '@/api/centerService';
import { getTeacherCourses } from '@/api/courseService';
import axiosClient from '@/api/axiosClient';

const TeacherDashboard = () => {
    const navigation = useNavigation<any>();

    // State lưu số liệu
    const [statsData, setStatsData] = useState({
        centers: 0,
        courses: 0,
        students: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const userStr = await AsyncStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            // 1. Lấy Centers & Courses song song
            const [centersRes, coursesRes] = await Promise.all([
                getMyCenters(user.id),
                getTeacherCourses(user.id)
            ]);

            // 2. Tính toán Students (Phức tạp hơn chút vì phải gộp từ các centers)
            // Lưu ý: Nếu backend có API /dashboard-stats thì tốt nhất, đây là cách tính thủ công ở client
            const studentIds = new Set();

            // Chạy vòng lặp lấy học sinh của từng center để đếm
            // (Dùng Promise.all để chạy nhanh hơn)
            await Promise.all(centersRes.map(async (center: any) => {
                try {
                    const res = await axiosClient.get(`/centers/${center.id}/students`);
                    res.data.forEach((s: any) => studentIds.add(s.id));
                } catch (e) {
                    console.warn(`Lỗi đếm học sinh center ${center.id}`);
                }
            }));

            setStatsData({
                centers: centersRes.length,
                courses: coursesRes.length,
                students: studentIds.size
            });

        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Tự động tải lại khi màn hình được focus
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Cấu hình hiển thị Stats
    const stats = [
        {
            label: "Total Centers",
            value: statsData.centers.toString(),
            icon: Building2,
            color: "bg-blue-500"
        },
        {
            label: "Total Courses",
            value: statsData.courses.toString(),
            icon: BookOpen,
            color: "bg-orange-500"
        },
        {
            label: "Total Students",
            value: statsData.students.toString(),
            icon: Users,
            color: "bg-green-500"
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                className="flex-1 p-5"
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <Text className="text-2xl font-bold text-primary mb-6">Overview</Text>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} className="my-10" />
                ) : (
                    <View className="flex-row flex-wrap justify-between mb-6">
                        {stats.map((stat, index) => (
                            <View
                                key={index}
                                // Logic: Item cuối cùng full width (nếu mảng lẻ 3 item), còn lại 48%
                                className={`bg-sky-50 p-4 rounded-xl shadow-sm mb-4 flex-row items-center gap-3 ${index === 2 ? 'w-full' : 'w-[48%]'}`}
                            >
                                <View className={`${stat.color} p-3 rounded-lg`}>
                                    <stat.icon size={20} color="white" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xs text-foreground">{stat.label}</Text>
                                    <Text className="text-xl font-bold text-foreground">{stat.value}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default TeacherDashboard;