import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    TextInput, ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Building2, Plus, Phone, ExternalLink, Bell, X, MapPin, Briefcase, Trash2, Edit, PencilLineIcon } from 'lucide-react-native';

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

    // Hide the create form whenever the user switches away from the Managed tab
    useEffect(() => {
        if (activeTab !== "managed") {
            setShowForm(false);
        }
    }, [activeTab]);

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
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 20, paddingTop: 0 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            >
                {/* HEADER */}
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center gap-2 py-2">
                        <Building2 color={colors.primary} size={28} />
                        <Text className="text-2xl font-bold text-primary">Center</Text>
                    </View>

                    {/* Chỉ hiện nút Thêm ở tab Managed */}
                    {activeTab === "managed" && (
                        <TouchableOpacity
                            onPress={() => setShowForm(!showForm)}
                            className="bg-primary px-4 py-2 rounded-lg flex-row items-center">
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
                            <Bell color={colors.accent} size={20} />
                            <Text className="text-accent font-bold">
                                {invitations.length} new teaching invitations!
                            </Text>
                        </View>
                        {invitations.map(inv => (
                            <View key={inv.id} className="bg-sky-50 p-3 rounded-lg border border-primary shadow-sm mb-2">
                                <View>
                                    <Text className="font-bold text-primary">{inv.name} <Text className='text-secondary'>({inv.subject} | {inv.grade})</Text></Text>
                                    <Text className="text-foreground">Center: <Text className='font-bold'>{inv.center?.name}</Text></Text>
                                    <Text className="text-foreground mb-2">By :<Text className='font-bold'>{inv.teacher.firstName}</Text></Text>
                                </View>
                                <View className="flex-row gap-2 justify-end">
                                    <TouchableOpacity
                                        onPress={() => handleRespondInvite(inv.id, "ACCEPTED")}
                                        className="bg-primary px-3 py-1.5 rounded-md"
                                    >
                                        <Text className="text-white font-bold">ACCEPT</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleRespondInvite(inv.id, "REJECTED")}
                                        className="bg-white px-3 py-1.5 rounded-md border-2 border-accent"
                                    >
                                        <Text className="text-accent font-bold">REJECT</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {showForm && (
                    <View className="bg-sky-50 p-5 rounded-xl border border-sky-100 mb-6">
                        <Text className="font-bold text-primary mb-4 text-lg">New Center Info</Text>

                        <Text className="mb-2 text-sm font-medium text-foreground">Name</Text>
                        <TextInput
                            value={formData.name}
                            onChangeText={t => setFormData({ ...formData, name: t })}
                            className="bg-white border border-gray-300 rounded-lg p-3 mb-3 text-foreground"
                            placeholder="eg. Northern Center"
                            placeholderTextColor={colors.foreground}

                        />
                        <Text className="mb-2 text-sm font-medium text-foreground">Phone</Text>
                        <TextInput
                            value={formData.phoneNumber}
                            onChangeText={t => setFormData({ ...formData, phoneNumber: t })}
                            className="bg-white border border-gray-300 rounded-lg p-3 mb-3"
                            placeholder="eg. 0987123369"
                            keyboardType="phone-pad"
                            placeholderTextColor={colors.foreground}
                        />
                        <Text className="mb-2 text-sm font-medium text-foreground">Description</Text>
                        <TextInput
                            value={formData.description}
                            onChangeText={t => setFormData({ ...formData, description: t })}
                            className="bg-white border border-gray-300 rounded-lg p-3 mb-4 h-20"
                            placeholder="This is the best center in town..."
                            multiline
                            textAlignVertical="top"
                            placeholderTextColor={colors.foreground}
                        />
                        <TouchableOpacity
                            onPress={handleCreate}
                            disabled={isSubmitting}
                            className={`py-3 rounded-lg items-center ${isSubmitting ? 'bg-gray-400' : 'bg-secondary'}`}
                        >
                            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold">Save</Text>}
                        </TouchableOpacity>
                    </View>
                )}

                {/* TABS MENU */}
                <View className="flex-row border-b border-sky-100 mb-6">
                    <TouchableOpacity
                        onPress={() => setActiveTab("managed")}
                        className={`pb-3 mr-6 border-b-2 flex-row items-center gap-2 ${activeTab === "managed" ? "border-primary" : "border-transparent"}`}
                    >
                        <Building2 size={16} color={activeTab === "managed" ? colors.primary : "#6b7280"} />
                        <Text className={`font-medium ${activeTab === "managed" ? "text-primary" : "text-secondary"}`}>
                            Manage ({managedCenters.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setActiveTab("teaching")}
                        className={`pb-3 border-b-2 flex-row items-center gap-2 ${activeTab === "teaching" ? "border-primary" : "border-transparent"}`}
                    >
                        <Briefcase size={16} color={activeTab === "teaching" ? colors.primary : colors.secondary} />
                        <Text className={`font-medium ${activeTab === "teaching" ? "text-primary" : "text-secondary"}`}>
                            Teaching Invitations ({teachingCenters.length})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* DANH SÁCH TRUNG TÂM */}
                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                    <View className="gap-4">
                        {(activeTab === "managed" ? managedCenters : teachingCenters).map(center => (
                            <View
                                key={center.id}
                                className="bg-sky-50 p-4 rounded-xl border border-primary shadow-sm mb-3"
                            >
                                <View className="flex-row justify-between items-start mb-2">
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate("CenterDetail", { centerId: center.id, centerName: center.name })}
                                        className="flex-1"
                                    >
                                        <Text className="text-lg font-bold text-primary">{center.name}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate("CenterDetail", { centerId: center.id, centerName: center.name })}
                                    >
                                        <ExternalLink size={20} color={colors.primary} />
                                    </TouchableOpacity>
                                </View>

                                <View className="flex-row items-center gap-2 mb-2">
                                    <Phone size={12} color={colors.secondary} />
                                    <Text className="text-foreground font-bold">{center.phoneNumber}</Text>
                                </View>

                                {center.description ? (
                                    <View className="flex-row items-center gap-2 mb-2">
                                        <PencilLineIcon size={14} color={colors.secondary} />
                                        <Text numberOfLines={1} className="text-sm text-foreground italic flex-1">
                                            {center.description}
                                        </Text>
                                    </View>
                                ) : null}

                                {/* Footer của Card: Action Buttons */}
                                <View className="mt-4 pt-3 border-t border-gray-50 flex-row justify-between items-center">
                                    {activeTab === "managed" ? (
                                        <View className="flex-row gap-4">
                                            <TouchableOpacity className="flex-row items-center gap-1">
                                                <Edit size={14} color={colors.primary} />
                                                <Text className="text-primary font-bold text-xs">Edit</Text>
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
                                        <View className="bg-sky-50 px-2 py-1 rounded">
                                            <Text className="text-xs text-foreground">
                                                Manager: <Text className='font-bold text-primary'>{center.manager?.lastName || "Unknown"}</Text>
                                            </Text>
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        onPress={() => navigation.navigate("CenterDetail", { centerId: center.id, centerName: center.name })}
                                        className="bg-sky-100 px-3 py-1.5 rounded-md"
                                    >
                                        <Text className="text-primary text-xs font-bold">View Details</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        {(activeTab === "managed" ? managedCenters : teachingCenters).length === 0 && (
                            <Text className="text-center text-secondary mt-10">
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