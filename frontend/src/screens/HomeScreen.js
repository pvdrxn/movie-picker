import React, { useContext, useState, useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View, FlatList, ScrollView, RefreshControl } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../auth/AuthContext";
import { MovieCard } from "../components/MovieCard";
import {
  fetchPopularMovies,
  fetchTrendingMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
} from "../services/tmdb";

const CATEGORIES = [
  { key: "popular", title: "Popular", fetchFn: fetchPopularMovies },
  { key: "trending", title: "Trending", fetchFn: fetchTrendingMovies },
  { key: "top_rated", title: "Top Rated", fetchFn: fetchTopRatedMovies },
  { key: "upcoming", title: "Upcoming", fetchFn: fetchUpcomingMovies },
];

export function HomeScreen() {
  const { signOut } = useContext(AuthContext);
  const navigation = useNavigation();
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const rotation = useRef(new Animated.Value(0)).current;

  const fetchAllCategories = async () => {
    try {
      const results = await Promise.all(
        CATEGORIES.map(async (category) => {
          const data = await category.fetchFn();
          return { [category.key]: data.results || [] };
        })
      );

      const merged = Object.assign({}, ...results);
      setCategoryData(merged);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
      rotation.setValue(0);
    }
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setError(null);

    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    fetchAllCategories();
  };

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        <Pressable onPress={signOut} hitSlop={10} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

        {(loading || refreshing) && !error ? (
          <View style={styles.content}>
            <Animated.Text
              style={[styles.loadingText, { transform: [{ rotate: spin }] }]}
            >
              ↻
            </Animated.Text>
            <Text style={styles.statusText}>
              {refreshing ? "Refreshing..." : "Loading..."}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.content}>
            <Text style={styles.error}>Error: {error}</Text>
            <Pressable onPress={handleRefresh} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#fff"
                colors={["#fff"]}
              />
            }
          >
            {CATEGORIES.map((category) => (
              <View key={category.key} style={styles.section}>
                <Text style={styles.sectionTitle}>{category.title}</Text>
                <FlatList
                  data={categoryData[category.key] || []}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <MovieCard movie={item} onPress={(movie) => navigation.navigate("MovieDetails", { movieId: movie.id })} />
                  )}
                  contentContainerStyle={styles.sectionList}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
  },
  signOutButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  signOutText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 32,
    marginBottom: 8,
  },
  statusText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
  },
  error: {
    color: "#ff6b6b",
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    paddingTop: 50,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionList: {
    paddingHorizontal: 20,
  },
});