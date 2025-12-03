import { useAuth } from '@/app/src/AuthContext';
import { Colors, Spacing, TextStyles, ViewStyles } from '@/app/styles';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function LoginScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { login, loading, error, clearError } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    const validateForm = () => {
        const errors: typeof validationErrors = {};

        if (!email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email';
        }

        if (!password.trim()) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogin = async () => {
        clearError();
        if (!validateForm()) return;

        try {
            await login(email, password);
        } catch {
            Alert.alert('Login Failed', error || 'An error occurred during login');
        }
    };

    return (
        <ScrollView
            style={[ViewStyles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: Spacing.lg }}
        >
            {/* Header */}
            <View style={{ marginBottom: Spacing.xxl }}>
                <Text style={[TextStyles.title, { color: colors.text }]}>Welcome Back</Text>
                <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
                    Sign in to your account
                </Text>
            </View>

            {/* Error Banner */}
            {error && (
                <View style={{ borderRadius: 8, padding: Spacing.md, marginBottom: Spacing.md, backgroundColor: colors.error + '20' }}>
                    <Text style={[TextStyles.bodySmall, { fontWeight: '500', color: colors.error }]}>
                        {error}
                    </Text>
                </View>
            )}

            {/* Form */}
            <View style={{ marginBottom: Spacing.lg }}>
                {/* Email Input */}
                <View style={{ marginBottom: Spacing.md }}>
                    <Text style={[TextStyles.label, { color: colors.text }]}>Email</Text>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderRadius: 8,
                            paddingHorizontal: Spacing.md,
                            paddingVertical: Spacing.md,
                            fontSize: 16,
                            minHeight: 48,
                            backgroundColor: colors.surface,
                            color: colors.text,
                            borderColor: validationErrors.email ? colors.error : colors.border,
                        }}
                        placeholder="you@example.com"
                        placeholderTextColor={colors.textSecondary}
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (validationErrors.email) setValidationErrors({ ...validationErrors, email: undefined });
                        }}
                        editable={!loading}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    {validationErrors.email && (
                        <Text style={[TextStyles.bodySmall, { color: colors.error, marginTop: Spacing.xs }]}>
                            {validationErrors.email}
                        </Text>
                    )}
                </View>

                {/* Password Input */}
                <View style={{ marginBottom: Spacing.md }}>
                    <Text style={[TextStyles.label, { color: colors.text }]}>Password</Text>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderRadius: 8,
                            paddingHorizontal: Spacing.md,
                            paddingVertical: Spacing.md,
                            fontSize: 16,
                            minHeight: 48,
                            backgroundColor: colors.surface,
                            color: colors.text,
                            borderColor: validationErrors.password ? colors.error : colors.border,
                        }}
                        placeholder="Enter your password"
                        placeholderTextColor={colors.textSecondary}
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (validationErrors.password) setValidationErrors({ ...validationErrors, password: undefined });
                        }}
                        editable={!loading}
                        secureTextEntry
                    />
                    {validationErrors.password && (
                        <Text style={[TextStyles.bodySmall, { color: colors.error, marginTop: Spacing.xs }]}>
                            {validationErrors.password}
                        </Text>
                    )}
                </View>

                {/* Login Button */}
                <TouchableOpacity
                    style={{
                        ...ViewStyles.button,
                        ...ViewStyles.buttonPrimary,
                        backgroundColor: colors.primary,
                        opacity: loading ? 0.5 : 1,
                    }}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={[TextStyles.buttonText, TextStyles.buttonPrimaryText]}>Sign In</Text>
                    )}
                </TouchableOpacity>

                {/* Register Link */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.md }}>
                    <Text style={[TextStyles.bodySmall, { color: colors.textSecondary }]}>
                        Don't have an account?{' '}
                    </Text>
                    <TouchableOpacity onPress={() => router.push('./Register')}>
                        <Text style={[TextStyles.bodySmall, { color: colors.primary, fontWeight: '600' }]}>
                            Register here
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
