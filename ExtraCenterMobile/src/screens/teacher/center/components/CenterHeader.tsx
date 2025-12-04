import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface Props {
    center: any;
    isManager: boolean;
}

export default function CenterHeader({ center, isManager }: Props) {
    const navigation = useNavigation<any>();
    if (!center) return null;

    return (
        <View>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="flex-row items-center mb-4"
            >
                <ArrowLeft size={20} color="#6b7280" />
                <Text className="text-gray-500 ml-1">Back</Text>
            </TouchableOpacity>
            <View className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-4">

                <View className="flex-row items-center flex-wrap gap-2 mb-2">

                    <Text className="text-2xl font-bold text-gray-800 flex-1">
                        {center.name}
                    </Text>
                    {isManager ? (
                        <View className="bg-blue-100 px-2 py-1 rounded flex-row items-center">
                            <ShieldCheck size={12} color="#1d4ed8" />
                            <Text className="text-blue-700 text-xs font-bold ml-1">MANAGE</Text>
                        </View>
                    ) : (
                        <View className="bg-gray-100 px-2 py-1 rounded">
                            <Text className="text-gray-600 text-xs font-bold">INVITED TEACHER</Text>
                        </View>
                    )}
                </View>
                <Text className="text-gray-500">{center.description}</Text>
            </View>
        </View>
    );
}