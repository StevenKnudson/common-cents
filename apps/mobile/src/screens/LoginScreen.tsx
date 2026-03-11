import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { api, setAuthToken, setOrgId } from "../services/api";

interface Props {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuthToken(data.token);
      setOrgId(data.organization?.id);
      onLogin();
    } catch {
      Alert.alert("Error", "Invalid credentials");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Common Cents</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#f9fafb" },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 32 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: { backgroundColor: "#16a34a", borderRadius: 8, padding: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
