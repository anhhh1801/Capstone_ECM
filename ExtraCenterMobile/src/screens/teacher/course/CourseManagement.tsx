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
        <TouchableOpacity
            onPress={() => navigation.navigate("CourseDetail", { courseId: item.id })}
            className="bg-white p-4 mb-3 rounded-xl border border-gray-100 shadow-sm active:bg-gray-50"
        >
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-2">
                    <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text className="text-xs text-blue-600 font-medium mt-0.5">
                        {item.subject} • Grade {item.grade}
                    </Text>
                </View>

                <View className={`px-2 py-1 rounded-full ${item.status === 'ACTIVE' ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Text className={`text-[10px] font-bold ${item.status === 'ACTIVE' ? 'text-green-700' : 'text-gray-600'}`}>
                        {item.status === 'ACTIVE' ? 'TEACHING' : item.status}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center gap-1 mb-3">
                <MapPin size={14} color="#9ca3af" />
                <Text className="text-xs text-gray-500 flex-1" numberOfLines={1}>
                    {item.center?.name || "Center Not Assigned Yet"}
                </Text>
            </View>

            <View className="pt-3 border-t border-gray-50 flex-row justify-between items-center">
                <View className="flex-row items-center gap-1">
                    <Calendar size={14} color="#6b7280" />
                    <Text className="text-xs text-gray-500">
                        {item.startDate ? `${item.startDate} - ${item.endDate}` : "No Schedule Yet"}
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <Text className="text-xs font-bold text-blue-600 mr-1">Details</Text>
                    <ChevronRight size={14} color="#2563eb" />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-1 px-5 pt-2">

                {/* Header */}
                <View className="flex-row justify-between items-center mb-5">
                    <View className="flex-row items-center gap-2">
                        <BookOpen color="#2563eb" size={28} />
                        <Text className="text-2xl font-bold text-gray-800">Course</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("CreateCourse")}
                        className="bg-blue-600 px-3 py-2 rounded-lg flex-row items-center gap-1 shadow-sm"
                    >
                        <Plus size={18} color="white" />
                        <Text className="text-white font-bold text-xs">Add</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="relative mb-5">
                    <View className="absolute left-3 top-3 z-10">
                        <Search size={20} color="#9ca3af" />
                    </View>
                    <TextInput
                        className="bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-gray-700"
                        placeholder="Seach course..."
                        placeholderTextColor="#9ca3af"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                {/* Danh sách khóa học */}
                {loading ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#2563eb" />
                        <Text className="text-gray-400 mt-2">Loading details...</Text>
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
                                <Text className="text-gray-400 mt-4 text-center">
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