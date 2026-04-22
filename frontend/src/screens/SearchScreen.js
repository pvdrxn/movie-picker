import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { fetchGenres, fetchPopularMovies, searchMovies, discoverMovies } from "../services/tmdb";
import { MovieCard } from "../components/MovieCard";
import { useNavigation } from "@react-navigation/native";

export function SearchScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const columnPadding = 8;
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [query, setQuery] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchGenres().then((data) => setGenres(data.genres || [])).catch(console.error);
    fetchPopularMovies().then((data) => setMovies(data.results || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedGenre && !startYear && !endYear) return;
    const debounce = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        const results = await discoverMovies({ genreId: selectedGenre, startYear: startYear || undefined, endYear: endYear || undefined });
        setMovies(results.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(debounce);
  }, [startYear, endYear]);

  useEffect(() => {
    if (!query) return;
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

  const handleGenreSelect = async (genreId) => {
    setSelectedGenre(genreId === selectedGenre ? null : genreId);
    setQuery("");
    setLoading(true);
    setHasSearched(true);
    try {
      const results = await discoverMovies({ genreId: genreId === selectedGenre ? null : genreId, startYear: startYear || undefined, endYear: endYear || undefined });
      setMovies(results.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search & Filters</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search movies..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
            {genres.map((genre) => (
              <Pressable
                key={genre.id}
                style={[styles.genreChip, selectedGenre === genre.id && styles.genreChipSelected]}
                onPress={() => handleGenreSelect(genre.id)}
              >
                <Text style={[styles.genreText, selectedGenre === genre.id && styles.genreTextSelected]}>
                  {genre.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.yearRow}>
            <TextInput
              style={styles.yearInput}
              placeholder="From"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={startYear}
              onChangeText={setStartYear}
              keyboardType="number-pad"
              maxLength={4}
            />
            <Text style={styles.yearSeparator}>-</Text>
            <TextInput
              style={styles.yearInput}
              placeholder="To"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={endYear}
              onChangeText={setEndYear}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>
      </View>

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
                <MovieCard movie={item} onPress={(movie) => navigation.navigate("MovieDetails", { movieId: movie.id })} />
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
    backgroundColor: "#0B1220",
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    color: "#fff",
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
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 16,
  },
  searchIconBtn: {
    width: 44,
    height: 44,
    marginLeft: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  searchIcon: {
    color: "#fff",
    fontSize: 22,
  },
filtersWrapper: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  genreScroll: {
    flexDirection: "row",
    marginBottom: 12,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  genreScroll: {
    flexDirection: "row",
    marginBottom: 12,
  },
  genreChip: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  genreChipSelected: {
    backgroundColor: "rgba(255,100,100,0.2)",
    borderColor: "#ff6464",
  },
  genreText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  genreTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  yearInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
  },
  yearSeparator: {
    color: "rgba(255,255,255,0.4)",
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
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
  },
  emptyText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
  },
  movieItem: {
    flex: 1,
    paddingHorizontal: 4,
    maxWidth: "50%",
  },
});