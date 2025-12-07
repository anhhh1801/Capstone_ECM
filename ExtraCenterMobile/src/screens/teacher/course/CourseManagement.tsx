import React, { useState, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ActivityIndicator,
    ScrollView, RefreshControl, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookOpen, Plus, Search, MapPin, ChevronRight, Calendar } from 'lucide-react-native';

import { getTeacherCourses, Course } from '@/api/courseService';
import colors from '@/theme';

const CourseManagement = () => {
    const navigation = useNavigation<any>();

    // State
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState("");

    // Hàm lấy dữ liệu
    const fetchCourses = async () => {
        try {
            const userStr = await AsyncStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            // Gọi API
            const data = await getTeacherCourses(user.id);
            setCourses(data);
        } catch (error) {
            console.error("Load course failed:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchCourses();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchCourses();
    };

    const filteredCourses = courses.filter(c =>
        c.name.toLowerCase().includes(searchText.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchText.toLowerCase())
    );

    const renderCourseItem = ({ item }: { item: Course }) => (
        <View className="bg-sky-50 p-4 rounded-xl border border-primary shadow-sm mb-3">
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-2">
                    <Text className="text-xl font-bold text-primary" numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text className="text-s text-foreground">
                        Subject: <Text className="text-secondary font-bold">{item.subject}</Text>
                    </Text>
                    <Text className="text-s text-foreground">
                        Grade: <Text className="text-secondary font-bold">{item.grade}</Text>
                    </Text>
                </View>

                <View className={`px-2 py-1 rounded-full ${item.status === 'ACTIVE' ? 'bg-primary' : 'bg-secondary'}`}>
                    <Text className={`text-[10px] font-bold ${item.status === 'ACTIVE' ? 'text-white' : 'text-foreground'}`}>
                        {item.status === 'ACTIVE' ? 'TEACHING' : item.status}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center gap-1 mb-3">
                <Text className="text-white font-bold p-2 bg-secondary rounded-xl" numberOfLines={1}>
                    {item.center?.name || "Center Not Assigned Yet"}
                </Text>
            </View>

            <View className="pt-3 border-t border-gray-50 flex-row justify-between items-center">
                <View className="flex-row items-center gap-1">
                    <Calendar size={14} color={colors.primary} />
                    <Text className="text-xs text-foreground">
                        {item.startDate ? `${item.startDate} - ${item.endDate}` : "No Schedule Yet"}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => navigation.navigate("CourseDetail", { courseId: item.id })}
                    className="flex-row items-center bg-sky-100 px-3 py-1.5 rounded-md"
                >
                    <Text className="text-primary text-xs font-bold">View Details</Text>
                    <ChevronRight size={14} color={colors.primary} />
                </TouchableOpacity>
            </View>
        </View>

    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-1 px-5 pt-2">

                {/* Header */}
                <View className="flex-row justify-between items-center mb-5">
                    <View className="flex-row items-center gap-2">
                        <BookOpen color={colors.primary} size={28} />
                        <Text className="text-2xl font-bold text-primary">Course</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("CreateCourse")}
                        className="bg-primary px-4 py-2 rounded-lg flex-row items-center">
                        <Plus size={18} color="white" />
                        <Text className="text-white font-bold ml-1">
                            Add</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="relative mb-5">
                    <View className="absolute left-3 top-3 z-10">
                        <Search size={20} color="#9ca3af" />
                    </View>
                    <TextInput
                        className="bg-sky-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-foreground"
                        placeholder="Seach course..."
                        placeholderTextColor="#9ca3af"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                {/* Danh sách khóa học */}
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text className="text-secondary mt-2">Loading details...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredCourses}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderCourseItem}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                        }
                        ListEmptyComponent={() => (
                            <View className="items-center justify-center py-20">
                                <BookOpen size={48} color="#e5e7eb" />
                                <Text className="text-secondary mt-4 text-center">
                                    Do not have any course.{'\n'}Create new course now!
                                </Text>
                            </View>
                        )}
                        contentContainerStyle={{ paddingBottom: 100 }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

export default CourseManagement;