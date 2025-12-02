import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet } from "react-native";
import authService from "../../services/auth";
import { useNavigation } from "@react-navigation/native";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const onRegister = async () => {
    setLoading(true);
    try {
      await authService.registerTeacher({ firstName, lastName, personalEmail: email, phoneNumber });
      Alert.alert("Success", "Registration complete. Check email for OTP / instructions.");
      // Navigate to Login
      // @ts-ignore
      navigation.navigate("Login");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="First name" value={firstName} onChangeText={setFirstName} style={styles.input} />
      <TextInput placeholder="Last name" value={lastName} onChangeText={setLastName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Phone" value={phoneNumber} onChangeText={setPhoneNumber} style={styles.input} keyboardType="phone-pad" />
      <TouchableOpacity onPress={onRegister} style={styles.button} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Registering..." : "Register"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, justifyContent:"center" },
  input: { borderWidth:1, borderColor:"#ddd", borderRadius:6, padding:12, marginBottom:12 },
  button: { backgroundColor:"#0066cc", padding:12, borderRadius:6, alignItems:"center" },
  buttonText: { color:"#fff" }
});