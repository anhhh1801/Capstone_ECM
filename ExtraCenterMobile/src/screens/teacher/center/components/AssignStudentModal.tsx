import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { X, Search, UserPlus } from 'lucide-react-native';
import axiosClient from '@/api/axiosClient';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    centerId: number;
    onSuccess: () => void;
}

export default function AssignStudentModal({ isOpen, onClose, centerId, onSuccess }: Props) {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    const handleSearch = async () => {
        if (!searchTerm) return;
        setSearching(true);
        try {
            // Logic tìm kiếm giống Web: Gọi API search
            const res = await axiosClient.get(`/users/search?keyword=${searchTerm}`);
            setResults(res.data);
        } catch (e) {
            Alert.alert("Announcement", "Can not find student");
            setResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleAssign = async (studentId: number) => {
        try {
            await axiosClient.post(`/centers/${centerId}/assign-student?studentId=${studentId}`);
            Alert.alert("Successful", "Student was added to center!");
            onSuccess();
            onClose();
        } catch (error) {
            Alert.alert("Error", "Student was already in center!");
        }
    };

    return (
        <Modal visible={isOpen} animationType="slide" transparent>
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl h-[80%] p-5">
                    <View className="flex-row justify-between items-center mb-4 border-b border-gray-100 pb-2">
                        <Text className="text-xl font-bold text-gray-800">Search Student</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row gap-2 mb-4">
                        <TextInput
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3"
                            placeholder="Email or Phone..."
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={handleSearch} className="bg-blue-600 p-3 rounded-lg justify-center">
                            {searching ? <ActivityIndicator color="white" /> : <Search size={20} color="white" />}
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={() => (
                            !searching && <Text className="text-center text-gray-400 mt-10">Enter student email.</Text>
                        )}
                        renderItem={({ item }) => (
                            <View className="flex-row justify-between items-center p-3 border-b border-gray-100">
                                <View>
                                    <Text className="font-bold text-gray-800">{item.firstName} {item.lastName}</Text>
                                    <Text className="text-xs text-gray-500">{item.email}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleAssign(item.id)}
                                    className="bg-green-50 p-2 rounded-full"
                                >
                                    <UserPlus size={20} color="#16a34a" />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}