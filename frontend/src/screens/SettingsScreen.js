import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../auth/AuthContext";
import { me } from "../api/authApi";
import { colors } from "../theme";

export function SettingsScreen() {
  const { signOut } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    me()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.root}>
      <Text style={styles.headerTitle}>Settings</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.text.secondary} />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ACCOUNT</Text>
            <View style={styles.row}>
              <Ionicons name="person-outline" size={20} color={colors.text.secondary} />
              <View style={styles.rowInfo}>
                <Text style={styles.rowValue}>{user?.username || "—"}</Text>
                <Text style={styles.rowLabel}>Username</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Ionicons name="mail-outline" size={20} color={colors.text.secondary} />
              <View style={styles.rowInfo}>
                <Text style={styles.rowValue}>{user?.email || "—"}</Text>
                <Text style={styles.rowLabel}>Email</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Ionicons name="heart-outline" size={20} color={colors.text.secondary} />
              <View style={styles.rowInfo}>
                <Text style={styles.rowValue}>{user?.saved_count ?? 0}</Text>
                <Text style={styles.rowLabel}>Saved picks</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Ionicons name="close-outline" size={20} color={colors.text.secondary} />
              <View style={styles.rowInfo}>
                <Text style={styles.rowValue}>{user?.pass_count ?? 0}</Text>
                <Text style={styles.rowLabel}>Passed picks</Text>
              </View>
            </View>
          </View>

          <Pressable style={styles.signOutRow} onPress={signOut}>
            <Ionicons name="log-out-outline" size={20} color={colors.accent} />
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: "800",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: colors.bg.card,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionLabel: {
    color: colors.text.tertiary,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowInfo: {
    marginLeft: 12,
    flex: 1,
  },
  rowValue: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  rowLabel: {
    color: colors.text.tertiary,
    fontSize: 12,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 16,
  },
  signOutRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  signOutText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  footer: {
    marginTop: "auto",
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    color: colors.text.muted,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
});
