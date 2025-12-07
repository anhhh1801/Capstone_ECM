import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, FlatList } from 'react-native';
import { UserPlus, Search, Trash2, User, MailIcon } from 'lucide-react-native';
import axiosClient from '@/api/axiosClient';
import colors from '@/theme';

interface Props {
    courseId: number;
    isManager: boolean;
}

export default function CourseEnrollmentTab({ courseId, isManager }: Props) {
    const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [keyword, setKeyword] = useState("");
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        loadEnrolled();
    }, [courseId]);

    const loadEnrolled = async () => {
        try {
            const res = await axiosClient.get(`/courses/${courseId}/students`);
            setEnrolledStudents(res.data);
        } catch (error) {
            console.error("Load students fail:", error);
        }
    };

    const handleSearch = async () => {
        if (!keyword.trim()) return;
        setSearching(true);
        try {
            // Giả định API search user
            const res = await axiosClient.get(`/users/search?keyword=${keyword}`);
            // Lọc những em đã có trong lớp
            const existingIds = enrolledStudents.map(s => s.id);
            const filtered = res.data.filter((s: any) => !existingIds.includes(s.id));
            setSearchResults(filtered);
        } catch (error) {
            Alert.alert("Error", "Can not find student");
        } finally {
            setSearching(false);
        }
    };

    const handleAdd = async (student: any) => {
        try {
            await axiosClient.post(`/courses/${courseId}/students/${student.id}`);
            Alert.alert("Success", `Added ${student.firstName}`);
            setEnrolledStudents([...enrolledStudents, student]);
            setSearchResults(searchResults.filter(s => s.id !== student.id));
        } catch (error: any) {
            Alert.alert("Error", "Can not add new student");
        }
    };

    const handleRemove = (studentId: number) => {
        Alert.alert("Remove student", "Do you want to remove student from course?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive",
                onPress: async () => {
                    try {
                        await axiosClient.delete(`/courses/${courseId}/students/${studentId}`);
                        setEnrolledStudents(enrolledStudents.filter(s => s.id !== studentId));
                    } catch (error) {
                        Alert.alert("Error", "Can not delete");
                    }
                }
            }
        ]);
    };

    return (
        <View className="bg-sky-50 p-4 rounded-xl shadow-sm border border-sky-100">
            <View className="flex-row items-center gap-2 mb-4">
                <User size={20} color={colors.primary} />
                <Text className="text-lg font-bold text-primary">
                    Student List <Text className='text-accent'>({enrolledStudents.length})</Text>
                </Text>
            </View>

            {/* SEARCH BOX (Chỉ hiện khi là Manager) */}
            {isManager && (
                <View className="mb-4 bg-sky-50 p-3 rounded-lg">
                    <View className="flex-row gap-2 mb-2">
                        <TextInput
                            className="flex-1 bg-white border border-gray-200 p-2 rounded-lg"
                            placeholder="Email or Name..."
                            value={keyword}
                            onChangeText={setKeyword}
                        />
                        <TouchableOpacity onPress={handleSearch} className="bg-primary p-2 rounded-lg justify-center">
                            {searching ? <ActivityIndicator color="white" /> : <Search size={20} color="white" />}
                        </TouchableOpacity>
                    </View>

                    {/* Search Results List */}
                    {searchResults.length > 0 && (
                        <View className="bg-sky-50 border border-sky-100 rounded-lg max-h-40">
                            <FlatList
                                data={searchResults}
                                nestedScrollEnabled
                                keyExtractor={item => item.id.toString()}
                                renderItem={({ item }) => (
                                    <View className="flex-row justify-between items-center p-2 border-b border-gray-50">
                                        <View>
                                            <Text className="font-bold">{item.firstName} {item.lastName}</Text>
                                            <Text className="text-xs text-secondary">{item.email}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleAdd(item)} className="bg-green-50 p-1 rounded">
                                            <UserPlus size={18} color="#16a34a" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        </View>
                    )}
                </View>
            )}

            {/* ENROLLED LIST */}
            {enrolledStudents.length === 0 ? (
                <Text className="text-center text-secondary py-4">No Student Exist</Text>
            ) : (
                <View className="gap-2">
                    {enrolledStudents.map(student => (
                        <View key={student.id} className="flex-row justify-between items-center p-3 border border-sky-100 rounded-lg bg-sky-50">
                            <View className="flex-row items-center gap-3">
                                <View className="w-12 h-12 bg-white rounded-full border-primary border-2 items-center justify-center">
                                    <Text className="text-primary font-bold text-lg">{student.lastName?.[0]}</Text>
                                </View>
                                <View>
                                    <Text className="font-bold text-foreground">{student.firstName} {student.lastName}</Text>
                                    <View className="flex-row items-center gap-1 mb-1">
                                        <MailIcon size={14} color={colors.secondary} />
                                        <Text className="text-sm text-foreground">
                                            {student.email}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {isManager && (
                                <TouchableOpacity onPress={() => handleRemove(student.id)} className="p-2">
                                    <Trash2 size={18} color={colors.accent} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}