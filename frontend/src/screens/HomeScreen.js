import React, { useContext, useState, useEffect, useCallback } from "react";
import { Pressable, StyleSheet, Text, View, FlatList, ActivityIndicator } from "react-native";
import { AuthContext } from "../auth/AuthContext";
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
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].key);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError(null);

    const category = CATEGORIES.find((c) => c.key === activeCategory);
    if (!category) {
      setLoading(false);
      return;
    }

    try {
      const data = await category.fetchFn();
      setMovies(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Movies</Text>
        <Pressable onPress={signOut} hitSlop={10}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {CATEGORIES.map((category) => (
          <Pressable
            key={category.key}
            onPress={() => setActiveCategory(category.key)}
            style={[
              styles.tab,
              activeCategory === category.key && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeCategory === category.key && styles.tabTextActive,
              ]}
            >
              {category.title}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : error ? (
        <View style={styles.content}>
          <Text style={styles.error}>Error: {error}</Text>
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Text style={styles.movieTitle}>{item.title}</Text>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },
  signOutText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 2,
  },
  tabActive: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  tabText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingHorizontal: 20,
  },
  movieTitle: {
    color: "#fff",
    fontSize: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  error: {
    color: "#ff6b6b",
    fontSize: 16,
  },
});