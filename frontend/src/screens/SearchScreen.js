import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, ScrollView } from "react-native";
import { fetchGenres, searchMovies, discoverMovies } from "../services/tmdb";
import { MovieCard } from "../components/MovieCard";
import { useNavigation } from "@react-navigation/native";

export function SearchScreen() {
  const navigation = useNavigation();
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchGenres().then((data) => setGenres(data.genres || [])).catch(console.error);
  }, []);

  const handleSearch = async () => {
    if (!query && !selectedGenre) return;
    setLoading(true);
    setHasSearched(true);
    try {
      let results;
      if (query) {
        results = await searchMovies(query);
      } else {
        results = await discoverMovies({ genreId: selectedGenre });
      }
      setMovies(results.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreSelect = async (genreId) => {
    setSelectedGenre(genreId === selectedGenre ? null : genreId);
    setQuery("");
    setLoading(true);
    setHasSearched(true);
    try {
      const results = await discoverMovies({ genreId: genreId === selectedGenre ? null : genreId });
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
        <TextInput
          style={styles.searchInput}
          placeholder="Search movies..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </Pressable>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Genres</Text>
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
        <FlatList
          data={movies}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.movieItem}>
              <MovieCard movie={item} onPress={(movie) => navigation.navigate("MovieDetails", { movieId: movie.id })} />
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
    backgroundColor: "#0B1220",
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 16,
    marginBottom: 12,
  },
  searchButton: {
    backgroundColor: "#ff6464",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  genreScroll: {
    flexDirection: "row",
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  movieItem: {
    flex: 1,
    padding: 4,
    maxWidth: "50%",
  },
});