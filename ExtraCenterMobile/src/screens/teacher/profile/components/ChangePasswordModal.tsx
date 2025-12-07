import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { X, Lock } from 'lucide-react-native';
import axiosClient from '@/api/axiosClient';
import { colors } from '@/theme';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
}

export default function ChangePasswordModal({ isOpen, onClose, userId }: Props) {
    const [loading, setLoading] = useState(false);
    const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

    const handleChange = (key: string, value: string) => {
        setPassData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        if (!passData.oldPassword || !passData.newPassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        if (passData.newPassword !== passData.confirmPassword) {
            Alert.alert("Error", "Confirm password does not match.");
            return;
        }
        if (passData.newPassword.length < 6) {
            Alert.alert("Error", "New password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            await axiosClient.put(`/users/${userId}/change-password`, {
                oldPassword: passData.oldPassword,
                newPassword: passData.newPassword
            });
            Alert.alert("Success", "Password changed successfully!");
            onClose();
            setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            Alert.alert("Error", error.response?.data || "Failed to change password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={isOpen} animationType="fade" transparent>
            <View className="flex-1 bg-black/50 justify-center items-center p-6">
                <View className="bg-sky-50 w-full rounded-2xl p-6 shadow-xl">

                    <View className="flex-row justify-between items-center mb-6 border-b border-sky-100 pb-3">
                        <Text className="text-xl font-bold text-foreground">Change Password</Text>
                        <TouchableOpacity onPress={onClose}><X size={24} color={colors.secondary} /></TouchableOpacity>
                    </View>

                    <View className="gap-4">
                        <View>
                            <Text className="text-xs font-bold text-secondary mb-1">Current Password</Text>
                            <TextInput
                                secureTextEntry
                                className="bg-white border border-gray-200 rounded-lg p-3 text-foreground"
                                value={passData.oldPassword}
                                onChangeText={t => handleChange('oldPassword', t)}
                            />
                        </View>
                        <View>
                            <Text className="text-xs font-bold text-secondary mb-1">New Password</Text>
                            <TextInput
                                secureTextEntry
                                className="bg-white border border-gray-200 rounded-lg p-3 text-foreground"
                                value={passData.newPassword}
                                onChangeText={t => handleChange('newPassword', t)}
                            />
                        </View>
                        <View>
                            <Text className="text-xs font-bold text-secondary mb-1">Confirm New Password</Text>
                            <TextInput
                                secureTextEntry
                                className="bg-white border border-gray-200 rounded-lg p-3 text-foreground"
                                value={passData.confirmPassword}
                                onChangeText={t => handleChange('confirmPassword', t)}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            className="bg-primary py-3 rounded-lg flex-row justify-center items-center mt-2"
                        >
                            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Confirm Change</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}