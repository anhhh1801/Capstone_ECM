import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, ShieldCheck, ShieldMinus, ShieldMinusIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import colors from '@/theme';

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
                <ArrowLeft size={20} color={colors.primary} />
                <Text className="text-primary ml-1">Back</Text>
            </TouchableOpacity>
            <View className="bg-sky-50 p-5 rounded-xl shadow-sm border border-sky-100 mb-4">

                <View className="flex-row items-center flex-wrap gap-2">
                    <Text className="text-2xl font-bold text-primary flex-1">
                        {center.name}
                    </Text>
                    {isManager ? (
                        <View className="bg-blue-100 px-2 py-1 rounded flex-row items-center">
                            <ShieldCheck size={12} color={colors.primary} />
                            <Text className="text-primary text-xs font-bold ml-1">MANAGE</Text>
                        </View>
                    ) : (
                        <View className="bg-blue-100 px-2 py-1 rounded flex-row items-center">
                            <ShieldMinus size={12} color={colors.accent} />
                            <Text className="text-secondary text-xs font-bold ml-1">INVITED</Text>
                        </View>
                    )}
                </View>
                {center.description ? (
                    <Text className="text-secondary mt-1">{center.description}</Text>
                ) : (
                    <Text className="text-foreground mt-1 italic">No description.</Text>
                )}
            </View>
        </View>
    );
}