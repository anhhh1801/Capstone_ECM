import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Users, Search, Plus, Filter } from 'lucide-react-native';

import { getMyCenters } from '@/api/centerService';
import axiosClient from '@/api/axiosClient';
import StudentCard from './components/StudentCard';
import StudentModal from './components/StudentModal';
import colors from '@/theme';

const StudentManagement = () => {
    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<any>(null);

    const openCreateModal = () => {
        setEditingStudent(null);
        setModalOpen(true);
    };

    const openEditModal = (student: any) => {
        setEditingStudent(student);
        setModalOpen(true);
    };

    const fetchData = async () => {
        try {
            const userStr = await AsyncStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            // 1. Get list of centers managed by the teacher
            const centers = await getMyCenters(user.id);

            // 2. Use Map to store and merge data
            const studentMap = new Map<number, any>();

            // Iterate through each center to get student list
            for (const center of centers) {
                try {
                    const res = await axiosClient.get(`/centers/${center.id}/students`);
                    const studentsInCenter = res.data;

                    for (const student of studentsInCenter) {
                        // Check if this student already exists in the Map
                        if (studentMap.has(student.id)) {
                            // EXISTING CASE: Retrieve and add the current center
                            const existingStudent = studentMap.get(student.id);

                            // Check to avoid duplicate centers (if API returns weird data)
                            const isCenterAlreadyAdded = existingStudent.connectedCenters.some((c: any) => c.id === center.id);

                            if (!isCenterAlreadyAdded) {
                                existingStudent.connectedCenters.push(center);
                            }
                        } else {
                            // NEW CASE: Add to Map and initialize center list
                            studentMap.set(student.id, {
                                ...student,
                                connectedCenters: [center] // Start with current center
                            });
                        }
                    }
                } catch (e) {
                    console.warn(`Error fetching students at center ${center.id}`, e);
                }
            }

            // 3. Convert Map to Array for display
            const mergedStudents = Array.from(studentMap.values());

            setAllStudents(mergedStudents);
            setFilteredStudents(mergedStudents); // Reset filter

        } catch (error) {
            console.error("Error fetchData:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    useEffect(() => {
        if (!searchTerm) {
            setFilteredStudents(allStudents);
        } else {
            const lower = searchTerm.toLowerCase();
            const result = allStudents.filter(s =>
                s.firstName?.toLowerCase().includes(lower) ||
                s.lastName?.toLowerCase().includes(lower) ||
                s.email?.toLowerCase().includes(lower)
            );
            setFilteredStudents(result);
        }
    }, [searchTerm, allStudents]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleDelete = (studentId: number) => {
        Alert.alert(
            "Delete Student",
            "This action will permanently delete the student account. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete Permanently",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await axiosClient.delete(`/users/${studentId}`);
                            Alert.alert("Deleted", "Student has been removed from the system.");
                            fetchData();
                        } catch (e) {
                            Alert.alert("Error", "Could not delete this student.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-1 px-5 pt-2">

                <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center gap-2">
                        <Users size={28} color={colors.primary} />
                        <Text className="text-2xl font-bold text-primary">Students</Text>
                    </View>
                    <TouchableOpacity
                        onPress={openCreateModal}
                        className="bg-primary px-4 py-2 rounded-lg flex-row items-center">

                        <Plus size={18} color="white" />
                        <Text className="text-white font-bold ml-1">
                            Add</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="relative mb-4">
                    <View className="absolute left-3 top-3 z-10"><Search size={20} color="#9ca3af" /></View>
                    <TextInput
                        className="bg-sky-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-foreground"
                        placeholder="Search by name, email..."
                        placeholderTextColor="#9ca3af"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                </View>

                {/* List */}
                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} className="mt-10" />
                ) : (
                    <FlatList
                        data={filteredStudents}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <StudentCard
                                student={item}
                                onEdit={() => openEditModal(item)}
                                onDelete={() => handleDelete(item.id)}
                            />
                        )}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                        ListEmptyComponent={() => (
                            <Text className="text-center text-foreground mt-10">No students found.</Text>
                        )}
                        contentContainerStyle={{ paddingBottom: 80 }}
                    />
                )}
            </View>

            <StudentModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={handleRefresh}
                studentToEdit={editingStudent}
            />
        </SafeAreaView>
    );
};

export default StudentManagement;