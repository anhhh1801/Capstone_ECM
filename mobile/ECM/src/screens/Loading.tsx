import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Loading() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>ECM Loading...</Text>
            <ActivityIndicator size="large" />
        </View>
    );
}