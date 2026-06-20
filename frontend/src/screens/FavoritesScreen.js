import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { MovieCard } from "../components/MovieCard";
import { useNavigation } from "@react-navigation/native";
import { getPicks, subscribePicks, subscribeWatched, getWatchedPicks } from "../api/picksApi";
import { colors } from "../theme";

export function FavoritesScreen() {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    try {
      const [data, watchedData] = await Promise.all([
        getPicks("saved"),
        getWatchedPicks()
      ]);
      const watchedIds = new Set(watchedData.map(w => Number(w.tmdb_id)));
      const favoritesWithWatched = data.map(fav => ({
        ...fav,
        watched: watchedIds.has(Number(fav.tmdb_id))
      }));
      setFavorites(favoritesWithWatched);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useEffect(() => {
    const unsubscribePicks = subscribePicks(() => {
      fetchFavorites();
    });
    const unsubscribeWatched = subscribeWatched(() => {
      fetchFavorites();
    });
    return () => {
      unsubscribePicks();
      unsubscribeWatched();
    };
  }, [fetchFavorites]);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    fetchFavorites();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Favorites</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Favorites</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.count}>{favorites.length} saved</Text>
      </View>
      {favorites.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>Save movies from the Pick tab</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
               tintColor={colors.text.primary}
              colors={["#fff"]}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.movieItem}>
              <MovieCard
                movie={{
                  id: item.tmdb_id,
                  title: item.title,
                  poster_path: item.poster_path,
                  vote_average: item.rating,
                }}
                watched={item.watched}
                onPress={(movie) => navigation.navigate("MovieDetails", { movieId: movie.id, initialMovieData: movie })}
              />
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: "800",
  },
  count: {
    color: colors.text.tertiary,
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.text.tertiary,
    fontSize: 16,
  },
  errorText: {
    color: colors.accentSecondary,
    fontSize: 16,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    color: colors.text.tertiary,
    fontSize: 14,
  },
  movieItem: {
    flex: 1,
    paddingHorizontal: 4,
    maxWidth: "50%",
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
});