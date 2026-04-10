import React, { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AuthContext } from "../auth/AuthContext";

export function HomeScreen() {
  const { signOut } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Movie Picker</Text>
      <Text style={styles.subtitle}>You’re signed in. Next: movie picking features.</Text>

      <Pressable onPress={signOut} style={styles.button}>
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#0B1220",
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
  button: {
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

