import { useAuth } from '@/app/src/AuthContext';
import { Colors, Spacing, TextStyles, ViewStyles } from '@/app/styles';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TextStyle,
    TouchableOpacity,
    View,
} from 'react-native';

// Define a shared TextInput style
const inputBase: TextStyle = {
  borderWidth: 1,
  borderRadius: 8,
  paddingHorizontal: Spacing.md,
  paddingVertical: Spacing.md,
  fontSize: 16,
  minHeight: 48,
};

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { register, loading, error, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const errors: typeof validationErrors = {};

    if (!name.trim()) errors.name = 'Name is required';
    else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email';

    if (!password.trim()) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';

    if (!confirmPassword.trim()) errors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    clearError();
    if (!validateForm()) return;

    try {
      await register(email, password, name);
      router.push('./login');
    } catch {
      Alert.alert('Registration Failed', error || 'An error occurred during registration');
    }
  };

  return (
    <ScrollView
      style={[ViewStyles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[TextStyles.title, { color: colors.text }]}>Create Account</Text>
        <Text style={[TextStyles.body, { color: colors.textSecondary }]}>
          Sign up to get started
        </Text>
      </View>

      {/* Error Banner */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: colors.error + '20' }]}>
          <Text style={[TextStyles.bodySmall, { color: colors.error }]}>{error}</Text>
        </View>
      )}

      {/* Form */}
      <View style={styles.formContainer}>
        {/* Name Input */}
        <View style={{ marginBottom: Spacing.md }}>
          <Text style={[TextStyles.label, { color: colors.text }]}>Full Name</Text>
          <TextInput
            style={[
              inputBase,
              {
                backgroundColor: colors.surface,
                borderColor: validationErrors.name ? colors.error : colors.border,
                color: colors.text,
              },
            ]}
            placeholder="John Doe"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (validationErrors.name) setValidationErrors({ ...validationErrors, name: undefined });
            }}
            editable={!loading}
          />
          {validationErrors.name && (
            <Text style={[TextStyles.bodySmall, { color: colors.error, marginTop: Spacing.xs }]}>
              {validationErrors.name}
            </Text>
          )}
        </View>

        {/* Email Input */}
        <View style={{ marginBottom: Spacing.md }}>
          <Text style={[TextStyles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[
              inputBase,
              {
                backgroundColor: colors.surface,
                borderColor: validationErrors.email ? colors.error : colors.border,
                color: colors.text,
              },
            ]}
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
            style={[
              inputBase,
              {
                backgroundColor: colors.surface,
                borderColor: validationErrors.password ? colors.error : colors.border,
                color: colors.text,
              },
            ]}
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

        {/* Confirm Password Input */}
        <View style={{ marginBottom: Spacing.md }}>
          <Text style={[TextStyles.label, { color: colors.text }]}>Confirm Password</Text>
          <TextInput
            style={[
              inputBase,
              {
                backgroundColor: colors.surface,
                borderColor: validationErrors.confirmPassword ? colors.error : colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Confirm your password"
            placeholderTextColor={colors.textSecondary}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (validationErrors.confirmPassword)
                setValidationErrors({ ...validationErrors, confirmPassword: undefined });
            }}
            editable={!loading}
            secureTextEntry
          />
          {validationErrors.confirmPassword && (
            <Text style={[TextStyles.bodySmall, { color: colors.error, marginTop: Spacing.xs }]}>
              {validationErrors.confirmPassword}
            </Text>
          )}
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[
            ViewStyles.button,
            ViewStyles.buttonPrimary,
            { backgroundColor: colors.primary },
            loading && ViewStyles.buttonDisabled,
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={[TextStyles.buttonText, TextStyles.buttonPrimaryText]}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={[TextStyles.bodySmall, { color: colors.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('./Login')}>
            <Text style={[TextStyles.bodySmall, { color: colors.primary, fontWeight: '600' }]}>
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xxl,
  },
  formContainer: {
    marginBottom: Spacing.lg,
  },
  errorBanner: {
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
});
