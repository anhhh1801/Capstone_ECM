import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Lock } from 'lucide-react-native';
import axiosClient from '@/api/axiosClient';

import ProfileInfo from './components/ProfileInfo';
import DangerZone from './components/DangerZone';
import ChangePasswordModal from './components/ChangePasswordModal';
import { deactivateAccount } from '@/api/userService';
import colors from '@/theme';

const Profile = () => {
    const navigation = useNavigation<any>();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isPassModalOpen, setPassModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "", lastName: "", phoneNumber: "", dateOfBirth: ""
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const userStr = await AsyncStorage.getItem("user");
            if (!userStr) {
                navigation.replace("LoginScreen");
                return;
            }
            const parsedUser = JSON.parse(userStr);
            setUser(parsedUser);

            // Init Form
            setFormData({
                firstName: parsedUser.firstName || "",
                lastName: parsedUser.lastName || "",
                phoneNumber: parsedUser.phoneNumber || "",
                dateOfBirth: parsedUser.dateOfBirth || ""
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await axiosClient.put(`/users/${user.id}/profile`, formData);

            // Update local storage & state
            const updatedUser = { ...user, ...res.data };
            await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);

            Alert.alert("Success", "Profile updated successfully!");
        } catch (error) {
            Alert.alert("Error", "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async () => {

        try {
            await deactivateAccount(user.id);

            Alert.alert("Success", "Account deactivated.");

            await AsyncStorage.removeItem("user");
            await AsyncStorage.removeItem("accessToken");

            setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }, 1000);

        } catch (error) {
            console.error("Error deactivate:", error);
            Alert.alert("Error", "Failed to deactivate account.");
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" color="#2563eb" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="flex-row items-center mb-4"
                >
                    <ArrowLeft size={20} color={colors.primary} />
                    <Text className="text-primary ml-1">Back</Text>
                </TouchableOpacity>

                <View className="flex-row justify-between items-end mb-6">

                    <View>
                        <Text className="text-3xl font-bold text-primary">My Profile</Text>
                        <Text className="text-foreground text-sm">Manage your account settings</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setPassModalOpen(true)}
                        className="bg-primary border-2 border-primary px-4 py-2 rounded-lg flex-row items-center gap-2"
                    >
                        <Lock size={14} color="#fff" />
                        <Text className="text-white font-bold text-xs">Change Password</Text>
                    </TouchableOpacity>
                </View>

                <ProfileInfo
                    user={user}
                    formData={formData}
                    onChange={(key, value) => setFormData(prev => ({ ...prev, [key]: value }))}
                    onSave={handleSave}
                    saving={saving}
                />

                <DangerZone onDeactivate={handleDeactivate} />
            </ScrollView>

            <ChangePasswordModal
                isOpen={isPassModalOpen}
                onClose={() => setPassModalOpen(false)}
                userId={user?.id}
            />
        </SafeAreaView>
    );
};

export default Profile;