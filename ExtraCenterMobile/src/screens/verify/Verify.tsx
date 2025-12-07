import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Mail, CheckCircle, ArrowRight, RefreshCcw } from 'lucide-react-native';
import { colors } from '@/theme';

// Import API
import { verifyOtp, resendOtp } from '@/api/authService';

const Verify = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { email } = route.params || {};

    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [timer, setTimer] = useState(30);

    const inputRefs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Handle Input Change
    const handleChange = (index: number, value: string) => {
        // Chỉ cho phép nhập số
        if (isNaN(Number(value)) && value !== "") return;

        const newOtp = [...otp];
        // Lấy ký tự cuối cùng (trường hợp paste nhiều số hoặc nhập đè)
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Tự động focus sang ô tiếp theo nếu đã nhập
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle Backspace
    const handleKeyPress = (index: number, e: any) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // Xử lý Gửi lại mã
    const handleResend = async () => {
        if (timer > 0) return;

        try {
            await resendOtp(email);
            Alert.alert("Completed", "New OTP sent!");
            setTimer(30);
            setOtp(new Array(6).fill(""));
            inputRefs.current[0]?.focus();
        } catch (error) {
            Alert.alert("Error", "Can not resend OTP.");
        }
    };

    // Xử lý Xác thực
    const handleVerify = async () => {
        const code = otp.join("");
        if (code.length !== 6) {
            Alert.alert("Error", "Please enter 6 numbers.");
            return;
        }

        setLoading(true);
        try {
            await verifyOtp(email, code);
            setSuccess(true);

            setTimeout(() => {
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }, 2000);

        } catch (error: any) {
            const msg = error.response?.data || "OTP is incorrect.";
            Alert.alert("Failed", typeof msg === 'string' ? msg : "Mã sai");
            setLoading(false);
        }
    };

    // --- RENDER THÀNH CÔNG ---
    if (success) {
        return (
            <View className="flex-1 bg-background justify-center items-center p-6">
                <View className="bg-sky-50 w-full p-8 rounded-2xl items-center shadow-sm">
                    <CheckCircle size={64} color={colors.secondary} />
                        <Text className="text-2xl font-bold text-primary mt-4">Verify Successfully!</Text>
                        <Text className="text-foreground mt-2 text-center">Your account is active now.</Text>
                        <Text className="text-primary text-sm mt-4">Redirecting...</Text>
                </View>
            </View>
        );
    }

    // --- RENDER FORM ---
    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <View className="flex-1 justify-center p-6">

                    {/* Header */}
                    <View className="items-center mb-10">
                        <View className="w-16 h-16 bg-sky-100 rounded-full items-center justify-center mb-4">
                            <Mail size={32} color={colors.primary} />
                        </View>
                        <Text className="text-2xl font-bold text-primary">Enter verify code</Text>
                        <Text className="text-accent mt-2 text-center px-4">
                            Code OTP was sent to{"\n"}
                            <Text className="font-bold text-foreground">{email || "your email"}</Text>
                        </Text>
                    </View>

                    {/* OTP Inputs */}
                    <View className="flex-row justify-between mb-8 px-2">
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputRefs.current[index] = ref }}
                                className={`w-12 h-14 border-2 border-primary rounded-xl text-center text-2xl font-bold bg-white text-primary ${digit ? 'border-primary bg-sky-50' : 'border-gray-300'}`}
                                maxLength={1}
                                keyboardType="number-pad"
                                value={digit}
                                onChangeText={(value) => handleChange(index, value)}
                                onKeyPress={(e) => handleKeyPress(index, e)}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    {/* Verify Button */}
                    <TouchableOpacity
                        onPress={handleVerify}
                        disabled={loading || otp.some(d => !d)}
                        className={`w-full py-4 rounded-xl flex-row justify-center items-center space-x-2 ${loading || otp.some(d => !d) ? 'bg-gray-300' : 'bg-primary'
                            }`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Text className="text-white font-bold text-lg mr-2">Verify</Text>
                                <ArrowRight size={20} color="white" />
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Resend Link */}
                    <View className="mt-8 items-center">
                        <Text className="text-foreground mb-2">Have not got OTP yet?</Text>

                        {timer > 0 ? (
                            <Text className="text-accent font-medium">
                                Resend in {timer}s
                            </Text>
                        ) : (
                            <TouchableOpacity
                                onPress={handleResend}
                                className="flex-row items-center space-x-1"
                            >
                                <RefreshCcw size={16} color="#2563eb" style={{ marginRight: 4 }} />
                                <Text className="text-blue-600 font-bold">Resend OTP</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Back to Login */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate("Login")}
                        className="mt-6 items-center"
                    >
                        <Text className="text-primary underline text-sm">Back to login</Text>
                    </TouchableOpacity>

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Verify;