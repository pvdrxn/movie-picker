import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function TopRatedMoviesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top rated</Text>
      <Text style={styles.subtitle}>This tab will show top rated movies to swipe on.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0B1220",
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 16,
  },
});