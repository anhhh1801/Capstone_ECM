import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Search } from 'lucide-react-native';

// Components
import AdminOverview from './components/AdminOverview';
import AdminTabs from './components/AdminTabs';
import UserListTab from './components/UserListTab';
import StatsModal from './components/StatsModal';

// API
import { getAllUsers, toggleUserLock, getUserStats } from '@/api/adminService';
import AdminHeader from './components/AdminHeader';

const AdminDashboard = () => {
    // Data State
    const [allUsers, setAllUsers] = useState<any[]>([]); // Toàn bộ user
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]); // List đang hiển thị theo Tab & Search
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // UI State
    const [activeTab, setActiveTab] = useState<"ADMIN" | "TEACHER" | "STUDENT">("TEACHER");
    const [searchText, setSearchText] = useState("");
    const [currentAdminId, setCurrentAdminId] = useState(0);

    // Modal State
    const [statsModalVisible, setStatsModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userStats, setUserStats] = useState<any>(null);
    const [loadingStats, setLoadingStats] = useState(false);

    // Counts for Tabs
    const counts = {
        admin: allUsers.filter(u => u.role.name === 'ADMIN').length,
        teacher: allUsers.filter(u => u.role.name === 'TEACHER').length,
        student: allUsers.filter(u => u.role.name === 'STUDENT').length,
    };

    // Init
    useEffect(() => {
        const init = async () => {
            const userStr = await AsyncStorage.getItem("user");
            if (userStr) setCurrentAdminId(JSON.parse(userStr).id);
            fetchUsers();
        };
        init();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setAllUsers(data);
        } catch (error) {
            Alert.alert("Error", "Failed to load users");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Filter Logic (Chạy mỗi khi users, tab hoặc search đổi)
    useEffect(() => {
        let result = allUsers;

        // 1. Filter by Tab
        result = result.filter(u => u.role.name === activeTab);

        // 2. Filter by Search
        if (searchText) {
            const lower = searchText.toLowerCase();
            result = result.filter(u =>
                u.firstName.toLowerCase().includes(lower) ||
                u.lastName.toLowerCase().includes(lower) ||
                u.email.toLowerCase().includes(lower)
            );
        }

        setFilteredUsers(result);
    }, [allUsers, activeTab, searchText]);

    // Actions
    const handleToggleLock = (user: any) => {
        const action = user.locked ? "UNLOCK" : "LOCK";
        Alert.alert(`Confirm ${action}`, `Are you sure you want to ${action.toLowerCase()} ${user.email}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Confirm",
                style: user.locked ? "default" : "destructive",
                onPress: async () => {
                    try {
                        await toggleUserLock(currentAdminId, user.id);
                        // Local update
                        setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, locked: !u.locked } : u));
                        Alert.alert("Success", `Account ${action.toLowerCase()}ed.`);
                    } catch (error) { Alert.alert("Error", "Action failed."); }
                }
            }
        ]);
    };

    const handleViewStats = async (user: any) => {
        setSelectedUser(user);
        setStatsModalVisible(true);
        setLoadingStats(true);
        setUserStats(null);
        try {
            const stats = await getUserStats(currentAdminId, user.id);
            setUserStats(stats);
        } catch (error) { Alert.alert("Error", "Failed to load stats."); }
        finally { setLoadingStats(false); }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                contentContainerStyle={{ padding: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} />}
            >
                <AdminHeader></AdminHeader>

                <AdminOverview
                    totalTeachers={counts.teacher}
                    totalStudents={counts.student}
                />

                <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} counts={counts} />

                <View className="relative mb-4">
                    <View className="absolute left-3 top-3 z-10"><Search size={20} color="#9ca3af" /></View>
                    <TextInput
                        className="bg-sky-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-foreground"
                        placeholder="Search name, email..."
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>

                {/* List Content */}
                <UserListTab
                    users={filteredUsers}
                    onToggleLock={handleToggleLock}
                    onViewStats={handleViewStats}
                />

            </ScrollView>

            <StatsModal
                visible={statsModalVisible}
                onClose={() => setStatsModalVisible(false)}
                user={selectedUser}
                stats={userStats}
                loading={loadingStats}
            />
        </SafeAreaView>
    );
};

export default AdminDashboard;