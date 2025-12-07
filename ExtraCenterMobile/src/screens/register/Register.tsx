import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { UserPlus, Mail, Phone, User, SquarePenIcon } from 'lucide-react-native';
import { colors } from '@/theme';

// Import API
import { registerTeacher, resendOtp } from '@/api/authService';

const RegisterScreen = () => {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(false);

    // State Form
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        personalEmail: "",
        phoneNumber: ""
    });

    const updateField = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // --- LOGIC 1: XỬ LÝ GỬI LẠI OTP ---
    const handleResendOld = async (email: string) => {
        try {
            setLoading(true);
            // 1. Gọi API gửi lại
            await resendOtp(email);

            // 2. Thông báo thành công -> Bấm OK thì chuyển trang
            Alert.alert(
                "Successful",
                "New OTP was sent to your email.",
                [
                    {
                        text: "Enter code",
                        onPress: () => navigation.navigate("Verify", { email: email })
                    }
                ]
            );
        } catch (e) {
            Alert.alert("Error", "Can not resend new OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC 2: XỬ LÝ ĐĂNG KÝ ---
    const handleRegister = async () => {
        if (!formData.firstName || !formData.lastName || !formData.personalEmail || !formData.phoneNumber) {
            Alert.alert("Missing information", "Please enter full information.");
            return;
        }

        setLoading(true);

        try {
            await registerTeacher(formData);

            Alert.alert(
                "Register Successfully",
                "OTP was sent to your email. Please check and verify.",
                [
                    {
                        text: "Enter OTP",
                        onPress: () => navigation.navigate("Verify", { email: formData.personalEmail })
                    }
                ]
            );

        } catch (error: any) {
            console.error("Register Error:", error);

            const msg = error.response?.data || "Register Fail.";

            if (typeof msg === 'string' && msg.includes("PENDING_VERIFICATION")) {
                Alert.alert(
                    "Account has not verified yet",
                    "Email was signed up but has not verify. What do you want?",
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Enter OTP",
                            onPress: () => navigation.navigate("Verify", { email: formData.personalEmail })
                        },
                        {
                            text: "Resend OTP",
                            onPress: () => handleResendOld(formData.personalEmail)
                        }
                    ]
                );
            } else {
                const displayMsg = typeof msg === 'string' ? msg : JSON.stringify(msg);
                Alert.alert("Register Fail", displayMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>

                    <View className="items-center mb-8">
                        <View className="w-20 h-20 bg-sky-100 rounded-full items-center justify-center mb-4">
                            <UserPlus size={40} color={colors.primary} />
                        </View>
                        <Text className="text-3xl font-bold text-primary text-center">
                            Teacher Registration
                        </Text>
                        <Text className="text-foreground text-center mt-2">
                            Create new account to manage your center
                        </Text>
                    </View>

                    <View className="bg-sky-50 p-6 rounded-2xl shadow-sm space-y-4 mb-4">
                        <Text className="mb-2 mt-2 text-sm font-medium text-foreground">First Name <Text className="text-red-500">*</Text></Text>
                        <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-white">
                            <SquarePenIcon size={18} color={colors.secondary} />
                            <TextInput
                                className="flex-1 p-3 text-foreground ml-1"
                                placeholder="John"
                                value={formData.firstName}
                                onChangeText={(t) => updateField('firstName', t)}
                            />
                        </View>
                        <Text className="mb-2 mt-2 text-sm font-medium text-foreground">Last Name <Text className="text-red-500">*</Text></Text>
                        <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-white">
                            <SquarePenIcon size={18} color={colors.secondary} />
                            <TextInput
                                className="flex-1 p-3 text-foreground"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChangeText={(t) => updateField('lastName', t)}
                            />
                        </View>

                        <Text className="mb-2 mt-2 text-sm font-medium text-foreground">Personal Email <Text className="text-red-500">*</Text></Text>
                        <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-white">
                            <Mail size={18} color="#9ca3af" />
                            <TextInput
                                className="flex-1 p-3 text-foreground ml-2"
                                placeholder="example123@gmail.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.personalEmail}
                                onChangeText={(t) => updateField('personalEmail', t)}
                            />
                        </View>
                        <Text className="mb-2 mt-2 text-sm font-medium text-foreground">Phone <Text className="text-red-500">*</Text></Text>

                        <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-white">
                            <Phone size={18} color="#9ca3af" />
                            <TextInput
                                className="flex-1 p-3 text-foreground ml-2"
                                placeholder="0987 123 369"
                                keyboardType="phone-pad"
                                value={formData.phoneNumber}
                                onChangeText={(t) => updateField('phoneNumber', t)}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleRegister}
                            disabled={loading}
                            className={`w-full rounded-lg bg-primary py-3 items-center mt-4 ${loading ? 'opacity-70' : ''}`}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Sign Up</Text>
                            )}
                        </TouchableOpacity>

                    </View>

                    <View className="flex-row justify-center mt-6">
                        <Text className="text-foreground">Have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                            <Text className="font-bold text-accent">Go to Login</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView >
    );
};

export default RegisterScreen;