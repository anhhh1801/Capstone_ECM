import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Building2, BookOpen, Users, LogOut, User } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TeacherDashboard from '@/screens/teacher/dashboard/TeacherDashboard';
import CenterManagement from '@/screens/teacher/center/CenterManagement';
import CourseManagement from '@/screens/teacher/course/CourseManagement';
import StudentManagement from '@/screens/teacher/student/StudentManagement';

const PlaceholderScreen = ({ title }: { title: string }) => (
    <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-500">Screen: {title}</Text>
    </View>
);

const Tab = createBottomTabNavigator();

const CustomHeader = () => {
    const navigation = useNavigation<any>();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = async () => {
        setShowMenu(false);
        await AsyncStorage.removeItem("user");
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    const handleProfile = () => {
        setShowMenu(false);
        navigation.navigate('Profile');
    };

    return (
        <View className="bg-white px-5 py-3 mt-10 flex-row justify-between items-center shadow-sm z-50">

            <Text className="text-2xl font-extrabold text-indigo-600 tracking-wider">ECM</Text>

            <TouchableOpacity onPress={() => setShowMenu(true)}>
                <Image
                    source={{ uri: 'https://ui-avatars.com/api/?name=Teacher+Admin&background=random' }}
                    className="w-10 h-10 rounded-full border-2 border-indigo-100"
                />
            </TouchableOpacity>

            <Modal
                visible={showMenu}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowMenu(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
                    <View className="flex-1 bg-black/20">
                        <View className="absolute top-5 right-5 bg-white rounded-xl shadow-lg w-52 overflow-hidden py-2">

                            <TouchableOpacity onPress={handleProfile} className="flex-row items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50">
                                <User size={18} color="#4b5563" style={{ marginRight: 10 }} />
                                <Text className="text-gray-700">Personal Information</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleLogout} className="flex-row items-center px-4 py-3 active:bg-red-50">
                                <LogOut size={18} color="#ef4444" style={{ marginRight: 10 }} />
                                <Text className="text-red-500 font-medium">Logout</Text>
                            </TouchableOpacity>

                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const TeacherTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                header: () => <CustomHeader />,
                tabBarActiveTintColor: '#4f46e5',
                tabBarInactiveTintColor: '#9ca3af',
                tabBarStyle: {
                    height: 80,
                    paddingBottom: 30,
                    paddingTop: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500'
                }
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={TeacherDashboard}
                options={{
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                    tabBarLabel: "Dashboard"
                }}
            />
            <Tab.Screen
                name="Center"
                component={CenterManagement}
                options={{
                    tabBarIcon: ({ color }) => <Building2 size={24} color={color} />,
                    tabBarLabel: "Center"
                }}
            />
            <Tab.Screen
                name="Course"
                component={CourseManagement}
                options={{
                    tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
                    tabBarLabel: "Course"
                }}
            />
            <Tab.Screen
                name="Student"
                component={StudentManagement}
                options={{
                    tabBarIcon: ({ color }) => <Users size={24} color={color} />,
                    tabBarLabel: "Student"
                }}
            />
        </Tab.Navigator>
    );
};

export default TeacherTabs;