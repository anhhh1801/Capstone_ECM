import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import authService from "../../services/auth";
import { saveToken } from "../../services/storage";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert("Validation", "Please enter email and password");
      return;
    }
    try {
      setLoading(true);
      const response = await authService.loginUser(email, password);
      /*
        IMPORTANT:
        - If backend returns token in response body, e.g. { token: '...', user: {...} }
          then save with saveToken(response.token)
        - If backend returns token in headers, read it accordingly.
        - In current authService implementation it returns a User; you must ensure
          your backend returns token or extend authService to return token as well.
      */
      const token = (response as any).token ?? (response as any).accessToken;
      if (token) {
        await saveToken(token);
      } else if ((response as any).authorization) {
        await saveToken((response as any).authorization);
      } else {
        // if backend only returns user and sets cookie/session, skip saving
      }

      // Navigate to Home
      // For react-navigation stack
      // @ts-ignore
      navigation.navigate("Home");
    } catch (error: any) {
      console.error(error);
      Alert.alert("Login failed", error?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={onLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Signing in..." : "Sign In"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Register" as never)}>
        <Text style={styles.link}>Create an account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, justifyContent:"center" },
  title: { fontSize:22, marginBottom:12 },
  input: { borderWidth:1, borderColor:"#ddd", borderRadius:6, padding:12, marginBottom:12 },
  button: { backgroundColor:"#0066cc", padding:12, borderRadius:6, alignItems:"center" },
  buttonText: { color:"#fff", fontWeight:"600" },
  link: { marginTop:12, color:"#0066cc", textAlign:"center" }
});