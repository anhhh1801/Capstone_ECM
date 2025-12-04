import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    TextInput, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Building2, Plus, Phone, ExternalLink, Bell, X, MapPin, Briefcase, Trash2, Edit } from 'lucide-react-native';

// Import Services
import { getMyCenters, createCenter, deleteCenter, Center } from '@/api/centerService'; // Đảm bảo import deleteCenter
import { getInvitations, respondInvitation, Course } from '@/api/courseService';
import axiosClient from '@/api/axiosClient'; // Import để gọi API teaching center thủ công nếu chưa có service

const CenterManagement = () => {
    const navigation = useNavigation<any>();

    // --- STATE ---
    const [managedCenters, setManagedCenters] = useState<Center[]>([]);
    const [teachingCenters, setTeachingCenters] = useState<Center[]>([]);
    const [invitations, setInvitations] = useState<Course[]>([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<"managed" | "teaching">("managed");
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({ name: "", description: "", phoneNumber: "" });

    const fetchData = async () => {
        try {
            const userStr = await AsyncStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            const [resManaged, resTeaching, resInvites] = await Promise.all([
                getMyCenters(user.id),
                axiosClient.get(`/centers/teaching/${user.id}`),
                getInvitations(user.id)
            ]);

            setManagedCenters(resManaged);
            setTeachingCenters(Array.isArray(resTeaching) ? resTeaching : resTeaching.data);
            setInvitations(resInvites);

        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };


    const handleCreate = async () => {
        if (!formData.name || !formData.phoneNumber) {
            Alert.alert("Missing Information", "Please enter Name and Phone Number");
            return;
        }

        setIsSubmitting(true);

        try {
            const userStr = await AsyncStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            const responseData = await createCenter({ ...formData, managerId: user.id });

            if (responseData && responseData.id) {
                const newCenter: Center = {
                    ...responseData,
                    manager: responseData.manager || { id: user.id, firstName: user.firstName, lastName: user.lastName }
                };
                setManagedCenters(prev => [newCenter, ...prev]);
                setShowForm(false);
                setFormData({ name: "", description: "", phoneNumber: "" });
                Alert.alert("Completed", "Create center successfully!");
            } else {
                fetchData();
            }

        } catch (error: any) {
            console.error("Add error:", error);

            let errorMsg = "Can not create center";

            if (error.response) {
                console.log("Backend Message:", error.response.data);
                errorMsg = typeof error.response.data === 'string'
                    ? error.response.data
                    : JSON.stringify(error.response.data);
            }

            Alert.alert("Error", errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            "Delete Center",
            "Are you sure to delete center?",
            [
                { text: "Cencel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteCenter(id);
                            setManagedCenters(prev => prev.filter(c => c.id !== id));
                            Alert.alert("Deleted", "Center deleted.");
                        } catch (error) {
                            Alert.alert("Error", "Can not delete (Maybe some courses are active)");
                        }
                    }
                }
            ]
        );
    };

    const handleRespondInvite = async (courseId: number, status: "ACCEPTED" | "REJECTED") => {
        try {
            await respondInvitation(courseId, status);
            Alert.alert("Completed", status === "ACCEPTED" ? "Accepted!" : "Denied!");
            fetchData();
        } catch (e) {
            Alert.alert("Error", "Process fail");
        }
    };

    // --- RENDER ---
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 20, paddingTop: 0 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            >
                {/* HEADER */}
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center gap-2 py-2">
                        <Building2 color="#2563eb" size={28} />
                        <Text className="text-2xl font-bold text-gray-800">Center</Text>
                    </View>

                    {/* Chỉ hiện nút Thêm ở tab Managed */}
                    {activeTab === "managed" && (
                        <TouchableOpacity
                            onPress={() => setShowForm(!showForm)}
                            className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
                        >
                            {showForm ? <X color="white" size={18} /> : <Plus color="white" size={18} />}
                            <Text className="text-white font-bold ml-1">
                                {showForm ? "Close" : "Add"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* KHU VỰC LỜI MỜI */}
                {invitations.length > 0 && (
                    <View className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                        <View className="flex-row items-center gap-2 mb-3">
                            <Bell color="#c2410c" size={20} />
                            <Text className="text-orange-800 font-bold">
                                {invitations.length} new teaching invitations!
                            </Text>
                        </View>
                        {invitations.map(inv => (
                            <View key={inv.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm mb-2">
                                <View>
                                    <Text className="font-bold text-gray-800">{inv.name} (Grade {inv.grade})</Text>
                                    <Text className="text-xs text-gray-500 mb-2">Center: {inv.center?.name}</Text>
                                </View>
                                <View className="flex-row gap-2 justify-end">
                                    <TouchableOpacity
                                        onPress={() => handleRespondInvite(inv.id, "ACCEPTED")}
                                        className="bg-green-600 px-3 py-1.5 rounded-md"
                                    >
                                        <Text className="text-white text-xs font-bold">ACCEPT</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleRespondInvite(inv.id, "REJECTED")}
                                        className="bg-gray-200 px-3 py-1.5 rounded-md"
                                    >
                                        <Text className="text-gray-700 text-xs font-bold">REJECT</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {showForm && (
                    <View className="bg-blue-50 p-5 rounded-xl border border-blue-100 mb-6">
                        <Text className="font-bold text-gray-800 mb-4 text-lg">New Center Info</Text>

                        <TextInput
                            value={formData.name}
                            onChangeText={t => setFormData({ ...formData, name: t })}
                            className="bg-white border border-gray-300 rounded-lg p-3 mb-3"
                            placeholder="Center Name"
                        />
                        <TextInput
                            value={formData.phoneNumber}
                            onChangeText={t => setFormData({ ...formData, phoneNumber: t })}
                            className="bg-white border border-gray-300 rounded-lg p-3 mb-3"
                            placeholder="Phone Number"
                            keyboardType="phone-pad"
                        />
                        <TextInput
                            value={formData.description}
                            onChangeText={t => setFormData({ ...formData, description: t })}
                            className="bg-white border border-gray-300 rounded-lg p-3 mb-4 h-20"
                            placeholder="Description / Address..."
                            multiline
                            textAlignVertical="top"
                        />
                        <TouchableOpacity
                            onPress={handleCreate}
                            disabled={isSubmitting}
                            className={`py-3 rounded-lg items-center ${isSubmitting ? 'bg-gray-400' : 'bg-green-600'}`}
                        >
                            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Save</Text>}
                        </TouchableOpacity>
                    </View>
                )}

                {/* TABS MENU */}
                <View className="flex-row border-b border-gray-200 mb-6">
                    <TouchableOpacity
                        onPress={() => setActiveTab("managed")}
                        className={`pb-3 mr-6 border-b-2 flex-row items-center gap-2 ${activeTab === "managed" ? "border-blue-600" : "border-transparent"}`}
                    >
                        <Building2 size={16} color={activeTab === "managed" ? "#2563eb" : "#6b7280"} />
                        <Text className={`font-medium ${activeTab === "managed" ? "text-blue-600" : "text-gray-500"}`}>
                            Manage ({managedCenters.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setActiveTab("teaching")}
                        className={`pb-3 border-b-2 flex-row items-center gap-2 ${activeTab === "teaching" ? "border-blue-600" : "border-transparent"}`}
                    >
                        <Briefcase size={16} color={activeTab === "teaching" ? "#2563eb" : "#6b7280"} />
                        <Text className={`font-medium ${activeTab === "teaching" ? "text-blue-600" : "text-gray-500"}`}>
                            Teaching Invitations ({teachingCenters.length})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* DANH SÁCH TRUNG TÂM */}
                {loading ? (
                    <ActivityIndicator size="large" color="#2563eb" />
                ) : (
                    <View className="gap-4">
                        {(activeTab === "managed" ? managedCenters : teachingCenters).map(center => (
                            <View
                                key={center.id}
                                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                            >
                                <View className="flex-row justify-between items-start mb-2">
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate("CenterDetail", { centerId: center.id, centerName: center.name })}
                                        className="flex-1"
                                    >
                                        <Text className="text-lg font-bold text-gray-800">{center.name}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate("CenterDetail", { centerId: center.id, centerName: center.name })}
                                    >
                                        <ExternalLink size={20} color="#9ca3af" />
                                    </TouchableOpacity>
                                </View>

                                {center.description ? (
                                    <View className="flex-row items-center gap-2 mb-2">
                                        <MapPin size={14} color="#6b7280" />
                                        <Text numberOfLines={1} className="text-sm text-gray-500 flex-1">
                                            {center.description}
                                        </Text>
                                    </View>
                                ) : null}

                                <View className="flex-row items-center gap-2">
                                    <Phone size={14} color="#6b7280" />
                                    <Text className="text-xs text-gray-500">{center.phoneNumber}</Text>
                                </View>

                                {/* Footer của Card: Action Buttons */}
                                <View className="mt-4 pt-3 border-t border-gray-50 flex-row justify-between items-center">
                                    {activeTab === "managed" ? (
                                        <View className="flex-row gap-4">
                                            <TouchableOpacity className="flex-row items-center gap-1">
                                                <Edit size={14} color="#2563eb" />
                                                <Text className="text-blue-600 font-bold text-xs">Edit</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => handleDelete(center.id)}
                                                className="flex-row items-center gap-1"
                                            >
                                                <Trash2 size={14} color="#ef4444" />
                                                <Text className="text-red-500 font-bold text-xs">Delete</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View className="bg-gray-100 px-2 py-1 rounded">
                                            <Text className="text-xs text-gray-500">
                                                Manager: {center.manager?.lastName || "Unknown"}
                                            </Text>
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        onPress={() => navigation.navigate("CenterDetail", { centerId: center.id, centerName: center.name })}
                                        className="bg-blue-50 px-3 py-1.5 rounded-md"
                                    >
                                        <Text className="text-blue-600 text-xs font-bold">See Details</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        {(activeTab === "managed" ? managedCenters : teachingCenters).length === 0 && (
                            <Text className="text-center text-gray-400 mt-10">
                                {activeTab === "managed"
                                    ? "You have not created any centers yet."
                                    : "You have not taught at any center yet."}
                            </Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default CenterManagement;