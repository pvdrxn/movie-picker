import React, { useState, useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View, Dimensions } from "react-native";
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  fetchPopularMovies,
  fetchTrendingMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
} from "../services/tmdb";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export function SwipeScreen() {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [picked, setPicked] = useState({ want: [], pass: [] });

  const position = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function fetchSwipeMovies() {
      setLoading(true);
      setError(null);

      try {
        const results = await Promise.all([
          fetchPopularMovies(),
          fetchTrendingMovies(),
          fetchTopRatedMovies(),
          fetchUpcomingMovies(),
        ]);

        const allMovies = [
          ...results[0].results,
          ...results[1].results,
          ...results[2].results,
          ...results[3].results,
        ];

        const unique = allMovies.filter(
          (movie, index, self) => index === self.findIndex((m) => m.id === movie.id)
        );

        setMovies(unique.slice(0, 20));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSwipeMovies();
  }, []);

  const handleSwipe = (direction) => {
    if (currentIndex >= movies.length || loading || error) return;

    const movie = movies[currentIndex];

    if (direction === "right") {
      setPicked((prev) => ({ ...prev, want: [...prev.want, movie] }));
    } else {
      setPicked((prev) => ({ ...prev, pass: [...prev.pass, movie] }));
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      position.setValue(event.translationX);
    })
    .onEnd((event) => {
      if (event.translationX > SWIPE_THRESHOLD) {
        handleSwipe("right");
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        handleSwipe("left");
      }
      Animated.spring(position, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    });

  const animatedStyle = {
    transform: [{ translateX: position }],
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading movies...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const currentMovie = movies[currentIndex];

  if (!currentMovie) {
    return (
      <View style={styles.container}>
        <Text style={styles.doneText}>All done!</Text>
        <Text style={styles.pickedCount}>
          Want to watch: {picked.want.length} | Pass: {picked.pass.length}
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>Swipe Movies</Text>
        <Text style={styles.hint}>← Pass | Want →</Text>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.card, animatedStyle]}>
            <View style={styles.poster}>
              {currentMovie.poster_path ? (
                <Animated.Image
                  source={{
                    uri: `https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`,
                  }}
                  style={styles.posterImage}
                />
              ) : (
                <View style={styles.posterPlaceholder}>
                  <Text style={styles.placeholderText}>No Image</Text>
                </View>
              )}
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.movieTitle}>{currentMovie.title}</Text>
              <Text style={styles.movieRating}>
                ★ {currentMovie.vote_average?.toFixed(1) || "N/A"}
              </Text>
            </View>
          </Animated.View>
        </GestureDetector>

        <View style={styles.actions}>
          <Pressable
            onPress={() => handleSwipe("left")}
            style={[styles.actionButton, styles.passButton]}
          >
            <Text style={styles.actionText}>✕ Pass</Text>
          </Pressable>
          <Pressable
            onPress={() => handleSwipe("right")}
            style={[styles.actionButton, styles.wantButton]}
          >
            <Text style={styles.actionText}>♥ Want</Text>
          </Pressable>
        </View>

        <Text style={styles.progress}>
          {currentIndex + 1} / {movies.length}
        </Text>
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
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    position: "absolute",
    top: 20,
  },
  hint: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    position: "absolute",
    top: 58,
  },
  card: {
    width: SCREEN_WIDTH - 48,
    marginTop: 40,
  },
  poster: {
    height: 400,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  posterImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  posterPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
  },
  cardInfo: {
    marginTop: 16,
    alignItems: "center",
  },
  movieTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  movieRating: {
    color: "#FFD700",
    fontSize: 16,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    marginTop: 32,
    gap: 32,
  },
  actionButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    minWidth: 100,
    alignItems: "center",
  },
  passButton: {
    backgroundColor: "rgba(255,100,100,0.2)",
    borderWidth: 2,
    borderColor: "#ff6464",
  },
  wantButton: {
    backgroundColor: "rgba(100,255,150,0.2)",
    borderWidth: 2,
    borderColor: "#64ff96",
  },
  actionText: {
    fontSize: 16,
    fontWeight: "700",
  },
  progress: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    position: "absolute",
    bottom: 20,
  },
  loadingText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
  },
  doneText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  pickedCount: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    marginTop: 8,
  },
});