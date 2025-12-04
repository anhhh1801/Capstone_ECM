import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, Modal, FlatList, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, Save, Building2, BookOpen, Calendar, ChevronDown, X } from 'lucide-react-native';

import { getMyCenters, Center } from '@/api/centerService';
import { createCourse, updateCourse, getCourseById, CreateCourseData } from '@/api/courseService';

interface ScreenFormData {
    name: string;
    subject: string;
    grade: string;
    description: string;
    startDate: string;
    endDate: string;
    centerId?: number;
}

const subjects = ["Math", "Physics", "Chemistry", "English", "Literature", "Biology", "History", "Geography"];

const CreateCourse = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { centerId: paramCenterId, isEdit, courseId } = route.params || {};

    const [formData, setFormData] = useState<ScreenFormData>({
        name: "", subject: "", grade: "10", description: "",
        startDate: "", endDate: "", centerId: paramCenterId ? Number(paramCenterId) : undefined
    });

    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(false);

    const [showCenterModal, setShowCenterModal] = useState(false);
    const [showSubjectModal, setShowSubjectModal] = useState(false);

    useEffect(() => {
        const fetchCenters = async () => {
            try {
                const userStr = await AsyncStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const res = await getMyCenters(user.id);
                    setCenters(res);
                }
            } catch (error) {
                console.error("Error getting center", error);
            }
        };
        fetchCenters();
    }, []);

    useEffect(() => {
        const fetchCourseDetail = async () => {
            if (isEdit && courseId) {
                setLoading(true);
                try {
                    const data = await getCourseById(courseId);
                    setFormData({
                        name: data.name,
                        subject: data.subject,
                        grade: data.grade.toString(),
                        description: data.description || "",
                        startDate: data.startDate || "",
                        endDate: data.endDate || "",
                        centerId: data.center?.id
                    });
                } catch (error) {
                    Alert.alert("Error", "Load course's details fail");
                    navigation.goBack();
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchCourseDetail();
    }, [isEdit, courseId]);


    const handleSumit = async () => {
        if (!formData.name || !formData.centerId || !formData.subject) {
            Alert.alert("Missing Information", "Please enter Name, Subject and assign Center.");
            return;
        }

        setLoading(true);
        try {
            const userStr = await AsyncStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            const payload: CreateCourseData = {
                name: formData.name,
                subject: formData.subject,
                grade: Number(formData.grade),
                description: formData.description,
                startDate: formData.startDate,
                endDate: formData.endDate,
                centerId: formData.centerId!,
                teacherId: user.id,
            };

            if (isEdit && courseId) {
                await updateCourse(courseId, payload);
                Alert.alert("Successful", "Course Updated!", [
                    { text: "OK", onPress: () => navigation.goBack() } // GoBack sẽ tự refresh lại màn trước nhờ useFocusEffect
                ]);
            } else {
                await createCourse(payload);
                Alert.alert("Successfull", "New Course Created!", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            }

        } catch (error: any) {
            console.error("Create course fail:", error);
            const msg = error.response?.data ? JSON.stringify(error.response.data) : "Errors happen";
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    const SelectInput = ({ label, value, placeholder, onPress, disabled = false, icon: Icon }: any) => (
        <View className="mb-4">
            <Text className="text-sm font-bold text-gray-700 mb-1 ml-1">{label} <Text className="text-red-500">*</Text></Text>
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled}
                className={`flex-row items-center border rounded-xl p-3 ${disabled ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-300'}`}
            >
                {Icon && <Icon size={18} color="#6b7280" style={{ marginRight: 10 }} />}
                <Text className={`flex-1 ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                    {value || placeholder}
                </Text>
                {!disabled && <ChevronDown size={18} color="#6b7280" />}
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-5 py-3 flex-row items-center bg-white border-b border-gray-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <ArrowLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">
                    {isEdit ? "Edit Course" : "Create Course"}
                </Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView contentContainerStyle={{ padding: 20 }}>

                    {/* Chọn Trung tâm */}
                    <SelectInput
                        label="Center"
                        placeholder="-- Choose --"
                        value={centers.find(c => c.id === formData.centerId)?.name}
                        onPress={() => setShowCenterModal(true)}
                        disabled={!!paramCenterId}
                        icon={Building2}
                    />

                    {/* Tên khóa học */}
                    <View className="mb-4">
                        <Text className="text-sm font-bold text-gray-700 mb-1 ml-1">Course Name <Text className="text-red-500">*</Text></Text>
                        <TextInput
                            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900"
                            placeholder="Example: Math 10"
                            value={formData.name}
                            onChangeText={t => setFormData({ ...formData, name: t })}
                        />
                    </View>

                    {/* Môn học & Khối lớp */}
                    <View className="flex-row gap-4 mb-4">
                        <View className="flex-1">
                            <SelectInput
                                label="Subject"
                                placeholder="Choose Subject"
                                value={formData.subject}
                                onPress={() => setShowSubjectModal(true)}
                                icon={BookOpen}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-gray-700 mb-1 ml-1">Grade <Text className="text-red-500">*</Text></Text>
                            <TextInput
                                className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900"
                                placeholder="10"
                                keyboardType="numeric"
                                value={formData.grade}
                                onChangeText={t => setFormData({ ...formData, grade: t })}
                            />
                        </View>
                    </View>

                    {/* Thời gian */}
                    <View className="flex-row gap-4 mb-4">
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-gray-700 mb-1 ml-1">Start date</Text>
                            <View className="relative">
                                <View className="absolute left-3 top-3.5 z-10"><Calendar size={16} color="#9ca3af" /></View>
                                <TextInput
                                    className="bg-white border border-gray-300 rounded-xl py-3 pl-10 pr-3 text-gray-900"
                                    placeholder="YYYY-MM-DD"
                                    value={formData.startDate}
                                    onChangeText={t => setFormData({ ...formData, startDate: t })}
                                />
                            </View>
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-gray-700 mb-1 ml-1">End Date</Text>
                            <View className="relative">
                                <View className="absolute left-3 top-3.5 z-10"><Calendar size={16} color="#9ca3af" /></View>
                                <TextInput
                                    className="bg-white border border-gray-300 rounded-xl py-3 pl-10 pr-3 text-gray-900"
                                    placeholder="YYYY-MM-DD"
                                    value={formData.endDate}
                                    onChangeText={t => setFormData({ ...formData, endDate: t })}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Mô tả */}
                    <View className="mb-6">
                        <Text className="text-sm font-bold text-gray-700 mb-1 ml-1">Description</Text>
                        <TextInput
                            className="bg-white border border-gray-300 rounded-xl p-3 text-gray-900 h-24"
                            placeholder="Content..."
                            multiline
                            textAlignVertical="top"
                            value={formData.description}
                            onChangeText={t => setFormData({ ...formData, description: t })}
                        />
                    </View>

                    {/* Button Submit */}
                    <TouchableOpacity
                        onPress={handleSumit}
                        disabled={loading}
                        className={`py-3.5 rounded-xl flex-row justify-center items-center gap-2 ${loading ? 'bg-gray-400' : 'bg-blue-600'}`}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Save size={20} color="white" />}
                        <Text className="text-white font-bold text-lg">
                            {isEdit ? "Update Course" : "Save Course"}
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Modal Chọn Trung Tâm */}
            <Modal visible={showCenterModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white h-[60%] rounded-t-3xl p-5">
                        <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
                            <Text className="text-xl font-bold">Choose Course</Text>
                            <TouchableOpacity onPress={() => setShowCenterModal(false)}><X size={24} color="#374151" /></TouchableOpacity>
                        </View>
                        <FlatList
                            data={centers}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className="p-4 border-b border-gray-50 active:bg-gray-50"
                                    onPress={() => { setFormData({ ...formData, centerId: item.id }); setShowCenterModal(false); }}
                                >
                                    <Text className="text-lg text-gray-800">{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Modal Chọn Môn Học */}
            <Modal visible={showSubjectModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white h-[50%] rounded-t-3xl p-5">
                        <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
                            <Text className="text-xl font-bold">Choose Subject</Text>
                            <TouchableOpacity onPress={() => setShowSubjectModal(false)}><X size={24} color="#374151" /></TouchableOpacity>
                        </View>
                        <FlatList
                            data={subjects}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className="p-4 border-b border-gray-50 active:bg-gray-50"
                                    onPress={() => { setFormData({ ...formData, subject: item }); setShowSubjectModal(false); }}
                                >
                                    <Text className="text-lg text-gray-800">{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default CreateCourse;