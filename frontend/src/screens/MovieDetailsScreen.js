import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, Pressable, Dimensions } from "react-native";
import { fetchMovieDetails, fetchMovieCredits } from "../services/tmdb";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function MovieDetailsScreen({ route, navigation }) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([fetchMovieDetails(movieId), fetchMovieCredits(movieId)])
      .then(([details, creditsData]) => {
        setMovie(details);
        setCredits(creditsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [movieId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const director = credits?.crew?.find((person) => person.job === "Director");
  const cast = credits?.cast?.slice(0, 10) || [];
  const genres = movie.genres?.map((g) => g.name).join(" · ") || "";

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Image
            source={{
              uri: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "https://via.placeholder.com/500x750",
            }}
            style={styles.poster}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.rating}>★ {movie.vote_average?.toFixed(1) || "N/A"}</Text>
            <Text style={styles.meta}>
              {movie.release_date?.split("-")[0] || "N/A"} · {movie.runtime} min
            </Text>
            <Text style={styles.genres}>{genres}</Text>
          </View>
        </View>

        {director && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Director</Text>
            <Text style={styles.directorText}>{director.name}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <Text style={styles.synopsis}>
            {movie.overview || "No synopsis available."}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castScroll}>
            {cast.map((actor) => (
              <View key={actor.id} style={styles.castItem}>
                <Image
                  source={
                    actor.profile_path
                      ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                      : "https://via.placeholder.com/185x278"
                  }
                  style={styles.castImage}
                />
                <Text style={styles.castName} numberOfLines={2}>
                  {actor.name}
                </Text>
                <Text style={styles.castCharacter} numberOfLines={1}>
                  {actor.character}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <Pressable style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>✕ Close</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
    textAlign: "center",
    marginTop: 100,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
    marginTop: 100,
  },
  header: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 50,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  rating: {
    color: "#fbbf24",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  meta: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginBottom: 8,
  },
  genres: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  directorText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
  },
  synopsis: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    lineHeight: 22,
  },
  castScroll: {
    flexDirection: "row",
  },
  castItem: {
    width: 90,
    marginRight: 12,
  },
  castImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  castName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },
  castCharacter: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});