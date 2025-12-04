// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import "./global.css";

import Login from '@/screens/login/Login';
import Register from '@/screens/register/Register';
import Verify from '@/screens/verify/Verify';
import TeacherTabs from '@/navigation/TeacherTabs';
import CenterDetail from '@/screens/teacher/center/CenterDetail';
import CreateCourse from '@/screens/teacher/course/CreateCourse';
import CourseDetail from '@/screens/teacher/course/CourseDetail';
import Profile from '@/screens/teacher/profile/Profile';
import AdminDashboard from '@/screens/admin/AdminDashboard';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Verify" component={Verify} />

          <Stack.Screen name="TeacherDashboard" component={TeacherTabs} />
          <Stack.Screen name="CenterDetail" component={CenterDetail} />

          <Stack.Screen name="CreateCourse" component={CreateCourse} />
          <Stack.Screen name="CourseDetail" component={CourseDetail} />

          <Stack.Screen name="Profile" component={Profile} />

          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;