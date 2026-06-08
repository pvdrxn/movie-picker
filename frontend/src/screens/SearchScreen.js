import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, ScrollView, useWindowDimensions, Animated } from "react-native";
import { fetchGenres, fetchPopularMovies, searchMovies, discoverMovies } from "../services/tmdb";
import { MovieCard } from "../components/MovieCard";
import { useNavigation } from "@react-navigation/native";
import { getWatchedPicks, subscribeWatched } from "../api/picksApi";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../theme";

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function SearchScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const columnPadding = 8;
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [query, setQuery] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [minRating, setMinRating] = useState("");
  const [movies, setMovies] = useState([]);
  const [watchedIds, setWatchedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const filterAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef({});

  const getScaleAnim = (id) => {
    if (!scaleAnims.current[id]) {
      scaleAnims.current[id] = new Animated.Value(1);
    }
    return scaleAnims.current[id];
  };

  const handleGenreSelect = async (genreId) => {
    const prevId = selectedGenre;
    setSelectedGenre(genreId === prevId ? null : genreId);
    setQuery("");
    if (prevId && scaleAnims.current[prevId]) {
      Animated.spring(scaleAnims.current[prevId], {
        toValue: 1,
        useNativeDriver: true,
        damping: 12,
        stiffness: 150,
      }).start();
    }
    if (genreId !== prevId && genreId) {
      const anim = getScaleAnim(genreId);
      Animated.spring(anim, {
        toValue: 1.05,
        useNativeDriver: true,
        damping: 12,
        stiffness: 150,
      }).start();
    }
  };

  const fetchWatched = async () => {
    try {
      const watched = await getWatchedPicks();
      setWatchedIds(new Set(watched.map(w => Number(w.tmdb_id))));
    } catch (err) {
      console.warn("Failed to fetch watched:", err.message);
    }
  };

  const toggleFilters = () => {
    const toValue = showFilters ? 0 : 1;
    setShowFilters(!showFilters);
    Animated.timing(filterAnim, {
      toValue,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    fetchWatched();
    const unsubscribe = subscribeWatched(() => {
      fetchWatched();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchGenres().then((data) => setGenres(data.genres || [])).catch(console.error);
    fetchPopularMovies().then((data) => setMovies(data.results || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedGenre && !startYear && !endYear && !minRating) {
      fetchPopularMovies().then((data) => setMovies(data.results || [])).catch(console.error);
      return;
    }
    const debounce = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        const results = await discoverMovies({ genreId: selectedGenre, startYear: startYear || undefined, endYear: endYear || undefined, rating: minRating || undefined });
        setMovies(results.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(debounce);
  }, [startYear, endYear, minRating, selectedGenre]);

  useEffect(() => {
    if (!query) {
      fetchPopularMovies().then((data) => setMovies(data.results || [])).catch(console.error);
      return;
    }
    const debounce = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        const results = await searchMovies(query);
        setMovies(results.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search & Filters</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies..."
            placeholderTextColor={colors.text.muted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          <Pressable onPress={toggleFilters} style={styles.filterIconBtn}>
            <Ionicons name="options" size={32} color={colors.accent} />
          </Pressable>
        </View>
      </View>

      <Animated.View style={{ maxHeight: filterAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 300] }), overflow: "hidden" }}>
      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
            {genres.map((genre) => (
              <Animated.View key={genre.id} style={{ transform: [{ scale: getScaleAnim(genre.id) }] }}>
              <Pressable
                style={[styles.genreChip, selectedGenre === genre.id && { backgroundColor: hexToRgba(colors.genre[genre.name] || colors.accent, 0.2), borderColor: colors.genre[genre.name] || colors.accent }]}
                onPress={() => handleGenreSelect(genre.id)}
              >
                <Text style={[styles.genreText, selectedGenre === genre.id && { color: colors.genre[genre.name] || colors.accent, fontWeight: "600" }]}>
                  {genre.name}
                </Text>
              </Pressable>
              </Animated.View>
            ))}
          </ScrollView>

          <View style={styles.yearRow}>
            <TextInput
              style={styles.yearInput}
              placeholder="From"
              placeholderTextColor={colors.text.muted}
              value={startYear}
              onChangeText={setStartYear}
              keyboardType="number-pad"
              maxLength={4}
            />
            <Text style={styles.yearSeparator}>-</Text>
            <TextInput
              style={styles.yearInput}
              placeholder="To"
              placeholderTextColor={colors.text.muted}
              value={endYear}
              onChangeText={setEndYear}
              keyboardType="number-pad"
              maxLength={4}
            />
            <Text style={styles.yearSeparator}>|</Text>
            <TextInput
              style={styles.ratingInput}
              placeholder="Rating"
              placeholderTextColor={colors.text.muted}
              value={minRating}
              onChangeText={setMinRating}
              keyboardType="decimal-pad"
              maxLength={3}
            />
          </View>
      </View>
      </Animated.View>

      {loading ? (
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : hasSearched && movies.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No movies found</Text>
        </View>
      ) : (
        <View style={styles.movieListContainer}>
          <FlatList
            data={movies}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={<View style={{ height: 4 }} />}
            renderItem={({ item }) => (
              <View style={styles.movieItem}>
                <MovieCard movie={item} watched={watchedIds.has(Number(item.id))} onPress={(movie) => navigation.navigate("MovieDetails", { movieId: movie.id })} />
              </View>
            )}
            contentContainerStyle={{ paddingHorizontal: columnPadding, paddingBottom: 24, paddingRight: 8 }}
          />
        </View>
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
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    color: colors.text.primary,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text.primary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  searchIconBtn: {
    width: 44,
    height: 44,
    marginLeft: 8,
    backgroundColor: colors.bg.elevated,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  filterIconBtn: {
    width: 44,
    height: 44,
    marginLeft: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  searchIcon: {
    color: colors.text.primary,
    fontSize: 22,
  },
filtersWrapper: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  genreScroll: {
    flexDirection: "row",
    marginBottom: 12,
    paddingVertical: 1,
    paddingLeft: 2,
  },
  genreChip: {
    backgroundColor: "transparent",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  genreText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  yearInput: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text.primary,
    fontSize: 15,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  ratingInput: {
    width: 80,
    backgroundColor: "transparent",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.text.primary,
    fontSize: 15,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  yearSeparator: {
    color: colors.accent,
    fontSize: 18,
    marginHorizontal: 12,
  },
  movieListContainer: {
    flex: 1,
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
  emptyText: {
    color: colors.text.tertiary,
    fontSize: 16,
  },
  movieItem: {
    flex: 1,
    paddingHorizontal: 4,
    maxWidth: "50%",
  },
});