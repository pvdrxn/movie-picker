import React, { useContext, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AuthContext } from "../auth/AuthContext";

export function RegisterScreen({ navigation }) {
  const { signUp } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await signUp({ username: username.trim(), email: email.trim(), password });
    } catch (e) {
      setError("Could not create account. Try a different username/email.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    username.trim().length >= 3 &&
    password.length >= 8 &&
    !submitting;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Save your picks and keep your list synced.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="juan"
          style={styles.input}
        />

        <Text style={styles.label}>Email (optional)</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="juan@example.com"
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="At least 8 characters"
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={onSubmit}
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.button,
            !canSubmit && styles.buttonDisabled,
            pressed && canSubmit && styles.buttonPressed,
          ]}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Register</Text>}
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} style={styles.linkButton}>
          <Text style={styles.linkText}>Already have an account? Log in</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#000000",
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 16,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  label: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#fff",
  },
  error: {
    color: "#FF6B6B",
    marginTop: 10,
  },
  button: {
    marginTop: 16,
    backgroundColor: "#4F46E5",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  linkButton: {
    marginTop: 14,
    alignItems: "center",
  },
  linkText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

