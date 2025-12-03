import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

// Theme colors
export const Colors = {
  light: {
    primary: '#007AFF',
    secondary: '#5AC8FA',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E0E0E0',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
  },
  dark: {
    primary: '#0A84FF',
    secondary: '#34B7F1',
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    border: '#38383A',
    error: '#FF453A',
    success: '#32D74B',
    warning: '#FF9500',
  },
};

// Spacing scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// Typography (TextStyle)
export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  } as TextStyle,
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  } as TextStyle,
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  } as TextStyle,
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } as TextStyle,
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,
  label: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  } as TextStyle,
};

// View Styles
export const ViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  } as ViewStyle,
  containerCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  } as ViewStyle,
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
  button: {
    borderRadius: 8,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  } as ViewStyle,
  buttonPrimary: {
    backgroundColor: Colors.light.primary,
  } as ViewStyle,
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.primary,
  } as ViewStyle,
  buttonDisabled: {
    opacity: 0.5,
  } as ViewStyle,
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  spaceBetween: {
    justifyContent: 'space-between',
  } as ViewStyle,
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
});

// Text Styles
export const TextStyles = StyleSheet.create({
  title: {
    ...Typography.h2,
    marginBottom: Spacing.md,
  } as TextStyle,
  body: {
    ...Typography.body,
  } as TextStyle,
  bodySmall: {
    ...Typography.bodySmall,
  } as TextStyle,
  label: {
    ...Typography.label,
    marginBottom: Spacing.sm,
  } as TextStyle,
  buttonText: {
    ...Typography.body,
    fontWeight: '600',
  } as TextStyle,
  buttonPrimaryText: {
    color: Colors.light.background,
  } as TextStyle,
  buttonSecondaryText: {
    color: Colors.light.primary,
  } as TextStyle,
});
