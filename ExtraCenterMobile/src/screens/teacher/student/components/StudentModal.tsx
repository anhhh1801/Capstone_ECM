import React, { useState, useEffect } from 'react';
import {
    View, Text, Modal, TextInput, TouchableOpacity,
    ActivityIndicator, Alert, ScrollView, FlatList
} from 'react-native';
import { X, Save, Building2, Trash2, Plus, ChevronDown } from 'lucide-react-native';
import { colors } from '@/theme';
import axiosClient from '@/api/axiosClient';
import { getMyCenters, Center } from '@/api/centerService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    studentToEdit?: any;
    preSelectedCenterId?: number;
}

export default function StudentModal({ isOpen, onClose, onSuccess, studentToEdit, preSelectedCenterId }: Props) {
    const isEdit = !!studentToEdit;
    const [loading, setLoading] = useState(false);

    const [centers, setCenters] = useState<Center[]>([]);

    const [showCenterModal, setShowCenterModal] = useState(false);
    const [showAddCenterModal, setShowAddCenterModal] = useState(false);

    const [currentCenters, setCurrentCenters] = useState<any[]>([]);
    const [isFetchingDetail, setIsFetchingDetail] = useState(false);

    const [form, setForm] = useState({
        firstName: "", lastName: "", phoneNumber: "", dateOfBirth: "", centerId: undefined as number | undefined
    });

    useEffect(() => {
        if (isOpen) {
            const fetchCenters = async () => {
                try {
                    const userStr = await AsyncStorage.getItem("user");
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        const res = await getMyCenters(user.id);
                        setCenters(res);
                    }
                } catch (e) {
                    console.log("Error fetching centers", e);
                }
            };
            fetchCenters();
        }
    }, [isOpen]);

    // 2. FILL DATA & FETCH DETAIL
    useEffect(() => {
        if (isOpen) {
            if (studentToEdit) {
                // A. Fill basic info immediately (to avoid UI flicker)
                setForm({
                    firstName: studentToEdit.firstName,
                    lastName: studentToEdit.lastName,
                    phoneNumber: studentToEdit.phoneNumber || "",
                    dateOfBirth: studentToEdit.dateOfBirth || "",
                    centerId: undefined
                });

                // B. IMPORTANT: Do not trust connectedCenters from props.
                // Call API to get the most accurate center list from DB.
                fetchStudentDetail(studentToEdit.id);
            } else {
                // Create mode
                setForm({
                    firstName: "", lastName: "", phoneNumber: "", dateOfBirth: "",
                    centerId: preSelectedCenterId
                });
                setCurrentCenters([]); // Reset list
            }
        }
    }, [isOpen, studentToEdit, preSelectedCenterId]);

    // Function to get details
    const fetchStudentDetail = async (studentId: number) => {
        setIsFetchingDetail(true);
        try {
            // Backend needs to ensure API /users/{id} DOES NOT have @JsonIgnore on connectedCenters
            // Or you need to write a separate API /users/{id}/centers to get this list
            const res = await axiosClient.get(`/users/${studentId}`);

            if (res.data && res.data.connectedCenters) {
                setCurrentCenters(res.data.connectedCenters);
            }
        } catch (error) {
            console.log("Data sync error:", error);
            // If network error, fallback to old data (if any)
            if (studentToEdit?.connectedCenters) {
                setCurrentCenters(studentToEdit.connectedCenters);
            }
        } finally {
            setIsFetchingDetail(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.firstName || !form.lastName) {
            Alert.alert("Missing Information", "Please enter First and Last Name.");
            return;
        }
        if (!isEdit && !form.centerId) {
            Alert.alert("Missing Information", "Please select a Managing Center.");
            return;
        }

        setLoading(true);
        try {
            if (isEdit) {
                await axiosClient.put(`/users/${studentToEdit.id}`, form);
                Alert.alert("Success", "Information updated!");
            } else {
                const payload = { ...form };
                await axiosClient.post('/users/create-student', payload);
                Alert.alert("Success", "New student created!");
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleAddCenter = async (centerIdToAdd: number) => {
        try {
            await axiosClient.post(`/centers/${centerIdToAdd}/assign-student?studentId=${studentToEdit.id}`);

            const centerToAdd = centers.find(c => c.id === centerIdToAdd);

            if (centerToAdd) {
                setCurrentCenters(prev => [...prev, centerToAdd]);
            }

            Alert.alert("Success", "Added to new center");
            setShowAddCenterModal(false);
            onSuccess();
        } catch (e) {
            Alert.alert("Error", "Cannot add to this center");
        }
    };

    const handleRemoveCenter = (centerIdToRemove: number) => {
        Alert.alert("Confirm", "Remove student from this center?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove", style: "destructive",
                onPress: async () => {
                    try {
                        await axiosClient.delete(`/centers/${centerIdToRemove}/students/${studentToEdit.id}`);

                        setCurrentCenters(prev => prev.filter(c => c.id !== centerIdToRemove));

                        Alert.alert("Removed successfully");
                        onSuccess();
                    } catch (e) { Alert.alert("Error removing center"); }
                }
            }
        ]);
    };

    const availableCenters = centers.filter(c =>
        !currentCenters.some((cc: any) => cc.id === c.id)
    );

    const SelectInput = ({ label, value, placeholder, onPress, disabled = false, icon: Icon }: any) => (
        <View className="mb-4">
            <Text className="text-sm font-bold text-primary mb-1 ml-1">{label} <Text className="text-red-500">*</Text></Text>
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
        <Modal visible={isOpen} animationType="slide" transparent>
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-sky-50 h-[90%] rounded-t-3xl w-full flex-1 mt-20">

                    {/* Header */}
                    <View className="px-5 py-3 flex-row items-center justify-between bg-sky-50 border-b border-sky-100 rounded-t-3xl">
                        <Text className="text-xl font-bold text-primary">
                            {isEdit ? "Edit Profile" : "Add New Student"}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 20 }}>

                        {!isEdit && (
                            <SelectInput
                                label="Belongs to Center"
                                placeholder="-- Select Center --"
                                value={centers.find(c => c.id === form.centerId)?.name}
                                onPress={() => setShowCenterModal(true)}
                                disabled={!!preSelectedCenterId}
                                icon={Building2}
                            />
                        )}

                        <View className="flex-row gap-4 mb-4">
                            <View className="flex-1">
                                <Text className="text-sm font-medium text-primary mb-1">First Name<Text className="text-red-500">*</Text></Text>
                                <TextInput
                                    className="bg-white border border-gray-200 rounded-xl p-3 text-foreground"
                                    value={form.firstName}
                                    onChangeText={t => setForm({ ...form, firstName: t })}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-medium text-primary mb-1">Last Name<Text className="text-red-500">*</Text></Text>
                                <TextInput
                                    className="bg-white border border-gray-200 rounded-xl p-3 text-foreground"
                                    value={form.lastName}
                                    onChangeText={t => setForm({ ...form, lastName: t })}
                                />
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm font-medium text-primary mb-1">Phone Number</Text>
                            <TextInput
                                className="bg-white border border-gray-200 rounded-xl p-3 text-foreground"
                                keyboardType="phone-pad"
                                value={form.phoneNumber}
                                onChangeText={t => setForm({ ...form, phoneNumber: t })}
                            />
                        </View>

                        <View className="mb-6">
                            <Text className="text-sm font-medium text-primary mb-1">Date of Birth (YYYY-MM-DD)</Text>
                            <TextInput
                                className="bg-white border border-gray-200 rounded-xl p-3 text-foreground"
                                placeholder="2005-01-01"
                                value={form.dateOfBirth}
                                onChangeText={t => setForm({ ...form, dateOfBirth: t })}
                            />
                        </View>

                        {/* 3. CENTER MANAGEMENT */}
                        {isEdit && studentToEdit && (
                            <View className="border-t border-gray-200 pt-6 mt-2">
                                <View className="flex-row items-center mb-3 justify-between">
                                    <View className="flex-row items-center">
                                        <Building2 size={18} color={colors.primary} style={{ marginRight: 8 }} />
                                        <Text className="font-bold text-foreground">Connected Centers</Text>
                                    </View>
                                    {/* Show small loading when reloading center list */}
                                    {isFetchingDetail && <ActivityIndicator size="small" color={colors.primary} />}
                                </View>

                                {/* Current Center List (Auto updates when API fetchStudentDetail finishes) */}
                                <View className="gap-2 mb-4">
                                    {currentCenters.map((c: any) => (
                                        <View key={c.id} className="flex-row justify-between items-center bg-sky-100 p-3 rounded-xl border border-sky-100">
                                            <Text className="text-sm font-medium text-primary">{c.name}</Text>
                                            <TouchableOpacity
                                                onPress={() => handleRemoveCenter(c.id)}
                                                className="bg-white p-1 rounded border border-red-100"
                                            >
                                                <Trash2 size={16} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    {currentCenters.length === 0 && !isFetchingDetail && (
                                        <Text className="text-secondary italic text-sm">Not joined any center yet</Text>
                                    )}
                                </View>

                                {/* Add New Center */}
                                {availableCenters.length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => setShowAddCenterModal(true)}
                                        className="flex-row items-center justify-center bg-green-50 p-3 rounded-xl border border-green-200"
                                    >
                                        <Plus size={18} color="#16a34a" style={{ marginRight: 5 }} />
                                        <Text className="text-green-700 font-bold">Add to another center</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        <View className="h-20" />
                    </ScrollView>

                    <View className="p-5 border-t border-sky-100 bg-sky-50 absolute bottom-0 w-full">
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            className={`py-3.5 rounded-xl flex-row justify-center items-center gap-2 ${loading ? 'bg-gray-400' : 'bg-primary'}`}
                        >
                            {loading ? <ActivityIndicator color="white" /> : <Save size={20} color="white" />}
                            <Text className="text-white font-bold text-lg">
                                {isEdit ? "Save Changes" : "Create Student"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* --- MODAL SELECT CENTER --- */}
            <Modal visible={showCenterModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-sky-50 h-[60%] rounded-t-3xl">
                        <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-secondary bg-primary p-6 rounded-t-3xl">
                            <Text className="text-xl font-bold text-white">Select Center</Text>
                            <TouchableOpacity onPress={() => setShowCenterModal(false)}><X size={24} color="#374151" /></TouchableOpacity>
                        </View>
                        <FlatList
                            data={centers}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className="p-3 m-2 border-2 border-primary bg-white "
                                    onPress={() => { setForm({ ...form, centerId: item.id }); setShowCenterModal(false); }}
                                >
                                    <Text className="text-lg text-primary font-bold">{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* --- MODAL ADD CENTER (EDIT) --- */}
            <Modal visible={showAddCenterModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-sky-50 h-[60%] rounded-t-3xl p-5">
                        <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
                            <Text className="text-xl font-bold text-foreground">Add to Center</Text>
                            <TouchableOpacity onPress={() => setShowAddCenterModal(false)}><X size={24} color="#374151" /></TouchableOpacity>
                        </View>
                        <FlatList
                            data={availableCenters}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className="p-4 border-b border-gray-50 active:bg-green-50 flex-row items-center gap-2"
                                    onPress={() => handleAddCenter(item.id)}
                                >
                                    <Plus size={16} color="#16a34a" />
                                    <Text className="text-lg text-foreground">{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text className="text-center text-secondary mt-5">Student has joined all centers.</Text>}
                        />
                    </View>
                </View>
            </Modal>

        </Modal>
    );
}