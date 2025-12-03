# ECM Mobile App - Setup Guide

## ✅ Project Setup Complete

Your React Native Expo project has been configured with the following features:

### 1. **Authentication Flow**
- ✅ Splash/Loading Screen (`app/screens/utils/Loading.tsx`)
- ✅ Login Screen with form validation (`app/screens/utils/Login.tsx`)
- ✅ Register Screen with form validation (`app/screens/utils/Register.tsx`)
- ✅ Auth Context for state management (`app/src/AuthContext.tsx`)
- ✅ Auth Service with API integration (`app/src/authService.ts`)

### 2. **Main App - 4-Tab Navigation**
- ✅ Home Tab (`app/(tabs)/index.tsx`)
- ✅ Students Tab (`app/(tabs)/student.tsx`)
- ✅ Courses Tab (`app/(tabs)/course.tsx`)
- ✅ Centers Tab (`app/(tabs)/center.tsx`)

### 3. **Centralized Styling**
- ✅ Theme colors (light & dark mode support)
- ✅ Spacing scale
- ✅ Typography system
- ✅ Reusable component styles (`app/styles.ts`)

## 📦 Installation & Running

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web
```

## 🔧 Configuration

### Update API Base URL

Edit `app/src/authService.ts` and replace the base URL:
```typescript
baseURL: 'https://your-api-url.com/api', // Replace with your actual API URL
```

Your API should have these endpoints:
- `POST /auth/login` - Login user
- `POST /auth/register` - Register new user
- `POST /auth/verify` - Verify token (optional)

### Expected API Response

**Login/Register Response:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "token": "jwt-token"
}
```

## 📁 Project Structure

```
app/
├── _layout.tsx              # Root layout with auth flow
├── modal.tsx                # Modal screen
├── styles.ts                # Centralized styles & theme
├── (tabs)/                  # Main app tabs
│   ├── _layout.tsx          # Tab navigation
│   ├── index.tsx            # Home tab
│   ├── student.tsx          # Students tab
│   ├── course.tsx           # Courses tab
│   └── center.tsx           # Centers tab
├── screens/
│   ├── utils/
│   │   ├── Loading.tsx      # Splash/loading screen
│   │   ├── Login.tsx        # Login form
│   │   └── Register.tsx     # Registration form
│   └── ... (other screens)
└── src/
    ├── AuthContext.tsx      # Authentication context
    ├── authService.ts       # API integration
    └── ... (other services)
```

## 🎨 Theming

The app supports light and dark themes automatically. Colors are defined in `styles.ts`:

```typescript
Colors = {
  light: { /* light theme colors */ },
  dark: { /* dark theme colors */ }
}
```

### Using Styles

```typescript
import { Colors, Spacing, Typography, CommonStyles } from '@/app/styles';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function MyComponent() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  return (
    <View style={[CommonStyles.button, { backgroundColor: colors.primary }]}>
      <Text style={[CommonStyles.buttonText, CommonStyles.buttonPrimaryText]}>
        Click me
      </Text>
    </View>
  );
}
```

## 🔐 Authentication Flow

1. **App Start**: AuthProvider checks for stored token in AsyncStorage
2. **Loading**: Shows splash screen while verifying authentication
3. **Not Logged In**: Shows Login/Register screens
4. **Logged In**: Shows main app with 4 tabs

## 📝 Key Features

### Auth Context Methods
- `login(email, password)` - User login
- `register(email, password, name)` - User registration
- `logout()` - User logout
- `clearError()` - Clear error messages

### API Interceptors
- Request interceptor adds Bearer token to headers
- Response interceptor handles 401 errors (invalid token)

## 🚀 Next Steps

1. **Connect to Backend**: Update the API base URL in `authService.ts`
2. **Customize Screens**: Add your content to the tab screens
3. **Add More Services**: Create services similar to `authService.ts` for other features
4. **Styling**: Adjust colors, spacing, and typography in `styles.ts`
5. **Navigation**: Add screen-specific navigation as needed

## 📱 Platform-Specific Notes

- **iOS**: May require additional setup with Xcode
- **Android**: Ensure Android SDK is installed
- **Web**: Works out of the box with Expo Web

## ⚠️ Common Issues

### Token expires on app restart
- Tokens are stored in AsyncStorage and retrieved on app start
- Implement refresh token logic in `authService.ts` if needed

### Styles not applying
- Ensure you import styles from `@/app/styles`
- Use the correct color scheme: `Colors[colorScheme ?? 'light']`

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Axios Documentation](https://axios-http.com)

---

**Happy coding! 🎉**
