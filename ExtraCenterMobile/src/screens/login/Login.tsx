import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lock, Mail } from 'lucide-react-native';
import { cssInterop } from 'nativewind';

cssInterop(SafeAreaView, { className: 'style' });

import { loginUser } from '@/api/authService';

const Login = () => {
    const navigation = useNavigation<any>();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Missing Information", "Please enter Email and Password");
            return;
        }

        setLoading(true);

        try {
            const loginResponse = await loginUser(email, password);
            const user = loginResponse.user;

            await AsyncStorage.setItem("user", JSON.stringify(user));

            const token = loginResponse.token;

            if (token) {
                await AsyncStorage.setItem("accessToken", token);
                console.log("Saved Token:", token);
            } else {
                console.error("Can not find Token in Login Response!");
            }

            setTimeout(() => {
                if (user.role.name === "TEACHER") {
                    navigation.replace("TeacherDashboard");
                } else if (user.role.name === "STUDENT") {
                    navigation.replace("StudentDashboard");
                } else if (user.role.name === "ADMIN") {
                    navigation.replace("AdminDashboard");
                } else {
                    navigation.replace("Home");
                }
            }, 1000);

        } catch (error: any) {
            console.error("Login Error:", error);

            const msg = error.response?.data || "Login failed! Please check again.";

            if (typeof msg === 'string' && msg.includes("ACCOUNT_DEACTIVATED")) {
                Alert.alert(
                    "Deactivated Account",
                    "New OTP was sent to your email. Please activate your account now.",
                    [
                        {
                            text: "Activate",
                            onPress: () => navigation.navigate("Verify", { email: email })
                        }
                    ]
                );
            }
            else if (typeof msg === 'string' && msg.includes("locked")) {
                Alert.alert("Account was locked", "Your account had been locked by admin");
            }
            else if (typeof msg === 'string' && msg.includes("PENDING_VERIFICATION")) {
                navigation.navigate("Verify", { email: email });
            }
            else {
                Alert.alert("Login Error", typeof msg === 'string' ? msg : "Errors");
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-indigo-100">
            <StatusBar barStyle="dark-content" backgroundColor="#e0e7ff" />

            <View className="flex-1 justify-center px-6">

                <View className="bg-white rounded-3xl p-8 shadow-lg">

                    <View className="items-center mb-8">
                        <View className="w-16 h-16 bg-indigo-100 rounded-full items-center justify-center mb-4">
                            <Lock size={32} color="#4f46e5" />
                        </View>
                        <Text className="text-3xl font-bold text-gray-800">Login</Text>
                        <Text className="text-gray-500 mt-2">Welcome to ECM</Text>
                    </View>

                    <View className="space-y-6">

                        {/* Input Email */}
                        <View>
                            <Text className="mb-2 text-sm font-medium text-gray-700">Email</Text>
                            <View className="relative">
                                <View className="absolute top-3 left-3 z-10">
                                    <Mail size={20} color="#9ca3af" />
                                </View>
                                <TextInput
                                    value={email}
                                    onChangeText={setEmail}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg p-3 pl-10"
                                    placeholder="name@ecm.edu.vn"
                                    placeholderTextColor="#9ca3af"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Input Password */}
                        <View>
                            <Text className="mb-2 text-sm font-medium text-gray-700">Password</Text>
                            <View className="relative">
                                <View className="absolute top-3 left-3 z-10">
                                    <Lock size={20} color="#9ca3af" />
                                </View>
                                <TextInput
                                    value={password}
                                    onChangeText={setPassword}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-base rounded-lg p-3 pl-10"
                                    placeholder="••••••••"
                                    placeholderTextColor="#9ca3af"
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        {/* Button Submit */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            className={`w-full rounded-lg bg-indigo-600 py-3 items-center mt-4 ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white text-base font-bold">Login</Text>
                            )}
                        </TouchableOpacity>

                    </View>

                    {/* Footer Link */}
                    <View className="mt-6 flex-row justify-center">
                        <Text className="text-sm text-gray-500">Do not have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                            <Text className="text-sm font-semibold text-indigo-600">Register Now</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </SafeAreaView>
    );
};

export default Login;