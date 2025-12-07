import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { User, Mail, Phone, Calendar, Save } from 'lucide-react-native';
import { colors } from '@/theme';

interface Props {
    user: any;
    formData: any;
    onChange: (key: string, value: string) => void;
    onSave: () => void;
    saving: boolean;
}

export default function ProfileInfo({ user, formData, onChange, onSave, saving }: Props) {
    if (!user) return null;

    return (
        <View className="bg-sky-50 rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            {/* Header Card */}
            <View className="p-4 border-b border-gray-100 bg-sky-50 flex-row justify-between items-center">
                    <View className="flex-row items-center gap-2">
                    <User size={20} color={colors.primary} />
                    <Text className="font-bold text-primary">Basic Information</Text>
                </View>
                <View className="bg-white border-2 border-primary px-3 py-1 rounded-full">
                    <Text className="text-primary font-bold">{user.role?.name}</Text>
                </View>
            </View>

            {/* Form */}
            <View className="p-4 gap-4">
                <View className="flex-row gap-4">
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-primary mb-1">First Name</Text>
                        <TextInput
                            className="bg-white border border-gray-200 rounded-lg p-3 text-foreground"
                            value={formData.firstName}
                            onChangeText={t => onChange('firstName', t)}
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-primary mb-1">Last Name</Text>
                        <TextInput
                            className="bg-white border border-gray-200 rounded-lg p-3 text-foreground"
                            value={formData.lastName}
                            onChangeText={t => onChange('lastName', t)}
                        />
                    </View>
                </View>

                {/* Read-only Emails */}
                <View>
                        <Text className="text-xs font-bold text-primary mb-1">Login Email</Text>
                    <View className="flex-row items-center bg-gray-100 border border-gray-200 rounded-lg p-3">
                        <Mail size={16} color={colors.secondary} style={{ marginRight: 8 }} />
                        <Text className="text-foreground">{user.email}</Text>
                    </View>
                    <Text className="text-[10px] text-accent mt-1 italic">Contact Admin to change email.</Text>
                </View>

                <View>
                    <Text className="text-xs font-bold text-primary mb-1">Personal Email</Text>
                    <View className="flex-row items-center bg-gray-100 border border-gray-200 rounded-lg p-3">
                        <Mail size={16} color={colors.secondary} style={{ marginRight: 8 }} />
                        <Text className="text-foreground">{user.personalEmail || "N/A"}</Text>
                    </View>
                </View>

                {/* Phone & DOB */}
                <View>
                    <Text className="text-xs font-bold text-primary mb-1">Phone Number</Text>
                        <View className="relative">
                        <View className="absolute left-3 top-3.5 z-10"><Phone size={16} color={colors.secondary} /></View>
                        <TextInput
                            className="bg-white border border-gray-200 rounded-lg py-3 pl-10 pr-3 text-foreground"
                            value={formData.phoneNumber}
                            onChangeText={t => onChange('phoneNumber', t)}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                <View>
                    <Text className="text-xs font-bold text-primary mb-1">Date of Birth</Text>
                        <View className="relative">
                        <View className="absolute left-3 top-3.5 z-10"><Calendar size={16} color={colors.secondary} /></View>
                        <TextInput
                            className="bg-white border border-gray-200 rounded-lg py-3 pl-10 pr-3 text-foreground"
                            value={formData.dateOfBirth}
                            onChangeText={t => onChange('dateOfBirth', t)}
                            placeholder="YYYY-MM-DD"
                        />
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    onPress={onSave}
                    disabled={saving}
                    className="bg-primary py-3 rounded-lg flex-row justify-center items-center mt-2 active:bg-primary"
                >
                    {saving ? <ActivityIndicator color="white" /> : (
                        <>
                            <Save size={18} color="white" style={{ marginRight: 8 }} />
                            <Text className="text-white font-bold">Save Changes</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}