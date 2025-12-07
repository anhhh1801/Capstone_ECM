import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, Modal, FlatList, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, Save, Building2, BookOpen, Calendar, ChevronDown, X } from 'lucide-react-native';
import { colors } from '@/theme';

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
            <Text className="text-sm font-bold text-primary mb-1 ml-1">{label} <Text className="text-accent">*</Text></Text>
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled}
                className={`flex-row items-center border rounded-xl p-3 ${disabled ? 'bg-sky-50 border-primary' : 'bg-white border-gray-300'}`}
            >
                {Icon && <Icon size={18} color={colors.primary} style={{ marginRight: 10 }} />}
                <Text className={`flex-1 ${value ? 'text-foreground font-bold' : 'text-foreground'}`}>
                    {value || placeholder}
                </Text>
                {!disabled && <ChevronDown size={18} color={colors.primary} />}
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-5 py-3 flex-row items-center bg-sky-50 border-b border-sky-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <ArrowLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-primary">
                    {isEdit ? "Edit Course" : "Create Course"}
                </Text>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <ScrollView contentContainerStyle={{ padding: 20 }}>

                    {/* Chọn Trung tâm */}
                    <SelectInput
                        label="Center"
                        placeholder="-- Choose a Center --"
                        value={centers.find(c => c.id === formData.centerId)?.name}
                        onPress={() => setShowCenterModal(true)}
                        disabled={!!paramCenterId}
                        icon={Building2}
                        placeholderTextColor={colors.foreground}
                    />

                    {/* Tên khóa học */}
                    <View className="mb-4">
                        <Text className="text-sm font-bold text-primary mb-1 ml-1">Course Name <Text className="text-red-500">*</Text></Text>
                        <TextInput
                            className="bg-white border border-gray-300 rounded-xl p-3 text-foreground"
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
                            <Text className="text-sm font-bold text-primary mb-1 ml-1">Grade <Text className="text-red-500">*</Text></Text>
                            <TextInput
                                className="bg-white border border-gray-300 rounded-xl p-3 text-foreground"
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
                            <Text className="text-sm font-bold text-primary mb-1 ml-1">Start date</Text>
                            <View className="relative">
                                <View className="absolute left-3 top-3.5 z-10"><Calendar size={16} color={colors.primary} /></View>
                                <TextInput
                                    className="bg-white border border-gray-300 rounded-xl py-3 pl-10 pr-3 text-foreground"
                                    placeholder="YYYY-MM-DD"
                                    value={formData.startDate}
                                    onChangeText={t => setFormData({ ...formData, startDate: t })}
                                />
                            </View>
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-primary mb-1 ml-1">End Date</Text>
                            <View className="relative">
                                <View className="absolute left-3 top-3.5 z-10"><Calendar size={16} color={colors.primary} /></View>
                                <TextInput
                                    className="bg-white border border-gray-300 rounded-xl py-3 pl-10 pr-3 text-foreground"
                                    placeholder="YYYY-MM-DD"
                                    value={formData.endDate}
                                    onChangeText={t => setFormData({ ...formData, endDate: t })}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Mô tả */}
                    <View className="mb-6">
                        <Text className="text-sm font-bold text-primary mb-1 ml-1">Description</Text>
                        <TextInput
                            className="bg-white border border-gray-300 rounded-xl p-3 text-foreground h-24"
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
                        className={`py-3.5 rounded-xl flex-row justify-center items-center gap-2 ${loading ? 'bg-primary/70' : 'bg-primary'}`}
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
                    <View className="bg-sky-50 h-[60%] rounded-t-3xl">
                        <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-secondary bg-primary p-6 rounded-t-3xl">
                            <Text className="text-xl font-bold text-white">Choose Course</Text>
                            <TouchableOpacity onPress={() => setShowCenterModal(false)}><X size={24} color="white" /></TouchableOpacity>
                        </View>
                        <FlatList
                            data={centers}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className="p-3 m-2 border-2 border-primary bg-white "
                                    onPress={() => { setFormData({ ...formData, centerId: item.id }); setShowCenterModal(false); }}
                                >
                                    <Text className="text-lg text-primary font-bold">{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Modal Chọn Môn Học */}
            <Modal visible={showSubjectModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-sky-50 h-[50%] rounded-t-3xl">
                        <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-secondary bg-primary p-6 rounded-t-3xl">
                            <Text className="text-xl font-bold text-white">Choose Subject</Text>
                            <TouchableOpacity onPress={() => setShowSubjectModal(false)}><X size={24} color="white" /></TouchableOpacity>
                        </View>
                        <FlatList
                            data={subjects}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className="p-3 m-2 border-2 border-primary bg-white"
                                    onPress={() => { setFormData({ ...formData, subject: item }); setShowSubjectModal(false); }}
                                >
                                    <Text className="text-lg text-primary font-bold">{item}</Text>
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