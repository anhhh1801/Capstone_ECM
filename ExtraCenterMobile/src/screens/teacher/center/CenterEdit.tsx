import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Save, Building2 } from 'lucide-react-native';
import { colors } from '@/theme';
import { getCenterById, updateCenter } from '@/api/centerService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CenterEdit = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { centerId } = route.params;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        phoneNumber: "",
        description: ""
    });

    // Fetch center data when entering screen
    useEffect(() => {
        const fetchCenterDetails = async () => {
            try {
                const data = await getCenterById(centerId);
                setFormData({
                    name: data.name || "",
                    phoneNumber: data.phoneNumber || "",
                    description: data.description || ""
                });
            } catch (error) {
                console.error("Fetch center detail error:", error);
                Alert.alert("Error", "Could not fetch center details.");
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        if (centerId) {
            fetchCenterDetails();
        }
    }, [centerId]);

    const handleUpdate = async () => {
        if (!formData.name || !formData.phoneNumber) {
            Alert.alert("Missing Information", "Please enter Name and Phone Number.");
            return;
        }

        setSubmitting(true);
        try {
            const userStr = await AsyncStorage.getItem("user");
            if (!userStr) {
                Alert.alert("Error", "User information not found.");
                return;
            }
            const user = JSON.parse(userStr);

            // Send managerId for Backend permission check
            await updateCenter(centerId, {
                ...formData,
                managerId: user.id
            });

            Alert.alert("Success", "Center updated successfully!", [
                {
                    text: "OK",
                    onPress: () => navigation.goBack()
                }
            ]);
        } catch (error: any) {
            console.error("Update error:", error);
            const msg = error.response?.data || "Could not update center.";
            // Backend returns text string directly (e.getMessage()) so taking data is enough
            Alert.alert("Error", typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* HEADER */}
            <View className="flex-row items-center p-4 border-b border-gray-100 bg-white">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <ArrowLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-primary flex-1">Edit Center</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>

                {/* ICON & ID */}
                <View className="items-center mb-8">
                    <View className="bg-sky-100 p-4 rounded-full mb-2">
                        <Building2 size={40} color={colors.primary} />
                    </View>
                    <Text className="text-gray-500 text-sm">Center ID: {centerId}</Text>
                </View>

                {/* FORM */}
                <View className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">

                    <Text className="mb-2 text-sm font-bold text-gray-700">Center Name <Text className="text-red-500">*</Text></Text>
                    <TextInput
                        value={formData.name}
                        onChangeText={t => setFormData({ ...formData, name: t })}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-gray-800"
                        placeholder="Enter center name"
                    />

                    <Text className="mb-2 text-sm font-bold text-gray-700">Phone Number <Text className="text-red-500">*</Text></Text>
                    <TextInput
                        value={formData.phoneNumber}
                        onChangeText={t => setFormData({ ...formData, phoneNumber: t })}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-gray-800"
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                    />

                    <Text className="mb-2 text-sm font-bold text-gray-700">Description</Text>
                    <TextInput
                        value={formData.description}
                        onChangeText={t => setFormData({ ...formData, description: t })}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6 text-gray-800 h-24"
                        placeholder="Enter description..."
                        multiline
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        onPress={handleUpdate}
                        disabled={submitting}
                        className={`flex-row justify-center items-center py-3.5 rounded-xl ${submitting ? 'bg-gray-400' : 'bg-primary'}`}
                    >
                        {submitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Save size={20} color="white" style={{ marginRight: 8 }} />
                                <Text className="text-white font-bold text-lg">Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CenterEdit;