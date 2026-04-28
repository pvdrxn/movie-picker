import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, Dimensions, Pressable, Animated, PanResponder } from "react-native";
import { fetchPopularMovies } from "../services/tmdb";
import { addPick } from "../api/picksApi";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = 50;

export function PickScreen() {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [passCount, setPassCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const startX = useRef(0);
  const startY = useRef(0);

  const loadMovies = async (reset = false) => {
    try {
      const data = await fetchPopularMovies({ page: reset ? 1 : page });
      if (reset) {
        setMovies(data.results || []);
        setPage(2);
      } else {
        setMovies((prev) => [...prev, ...(data.results || [])]);
        setPage((p) => p + 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies(true);
  }, []);

  const handleSwipeComplete = async (direction, movieToSave) => {
    console.log("=== handleSwipeComplete ===");
    console.log("direction:", direction);
    console.log("movieToSave:", movieToSave?.title, "id:", movieToSave?.id);
    
    if (!movieToSave) {
      setIsAnimating(false);
      return;
    }

    const choice = direction === "right" ? "saved" : "pass";
    console.log("Adding pick:", movieToSave.id, movieToSave.title, choice);

    try {
      await addPick({
        tmdbId: movieToSave.id,
        title: movieToSave.title,
        posterPath: movieToSave.poster_path,
        rating: movieToSave.vote_average,
        choice,
      });
      console.log("Pick added OK");
    } catch (err) {
      console.warn("Failed to save pick:", err.message);
    }

    if (direction === "right") {
      setSavedCount((c) => c + 1);
    } else {
      setPassCount((c) => c + 1);
    }

    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    translateX.setValue(0);
    translateY.setValue(0);
    setIsAnimating(false);

    console.log("=== done ===");
  };

  const animateSwipe = (direction) => {
    const currentMovie = movies[currentIndex];
    if (!currentMovie || isAnimating) return;
    
    setIsAnimating(true);

    const targetX = direction === "right" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    const targetY = direction === "right" ? 50 : -50;

    Animated.parallel([
      Animated.timing(translateX, {
        toValue: targetX,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: targetY,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      handleSwipeComplete(direction, currentMovie);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startX.current = translateX._value;
        startY.current = translateY._value;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(startX.current + gestureState.dx);
        translateY.setValue(startY.current + gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          animateSwipe("right");
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          animateSwipe("left");
        } else {
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
            }),
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const cardRotation = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ["-15deg", "0deg", "15deg"],
    extrapolate: "clamp",
  });

  const opacity = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0.5, 1, 0.5],
    extrapolate: "clamp",
  });

  const scale = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0.9, 1, 0.9],
    extrapolate: "clamp",
  });

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
  const noMoreMovies = !currentMovie;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pick Movies</Text>
      <Text style={styles.subtitle}>
        Swipe right to save · Swipe left to pass
      </Text>

      {noMoreMovies ? (
        <View style={styles.doneContainer}>
          <Text style={styles.doneText}>No more movies!</Text>
          <Text style={styles.pickedCount}>
            Saved: {savedCount} · Pass: {passCount}
          </Text>
          <Pressable
            onPress={() => {
              setCurrentIndex(0);
              setSavedCount(0);
              setPassCount(0);
              setPage(1);
              translateX.setValue(0);
              translateY.setValue(0);
              loadMovies(true);
            }}
            style={styles.resetButton}
          >
            <Text style={styles.resetText}>Start Over</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.cardContainer} {...panResponder.panHandlers}>
          <Animated.View
            style={[
              styles.card,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { rotate: cardRotation },
                  { scale },
                ],
                opacity,
              },
            ]}
          >
            {currentMovie.poster_path ? (
              <Image
                source={{
                  uri: `https://image.tmdb.org/t/p/w500${currentMovie.poster_path}`,
                }}
                style={styles.cardImage}
              />
            ) : (
              <View style={[styles.cardImage, styles.cardPlaceholder]}>
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{currentMovie.title}</Text>
              <Text style={styles.cardRating}>
                ★ {currentMovie.vote_average?.toFixed(1) || "N/A"}
              </Text>
            </View>
          </Animated.View>
        </View>
      )}

      {currentMovie && !isAnimating && (
        <View style={styles.buttons}>
          <Pressable
            onPress={() => animateSwipe("left")}
            style={[styles.button, styles.passButton]}
          >
            <Text style={styles.buttonText}>✕</Text>
          </Pressable>
          <Pressable
            onPress={() => animateSwipe("right")}
            style={[styles.button, styles.wantButton]}
          >
            <Text style={styles.buttonText}>♥</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 0,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    marginBottom: 24,
  },
  loadingText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
  },
  cardContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  card: {
    width: SCREEN_WIDTH - 48,
    height: (SCREEN_WIDTH - 48) * 1.5,
    borderRadius: 16,
    backgroundColor: "#1a1a2e",
  },
  cardImage: {
    width: "100%",
    height: "85%",
    resizeMode: "cover",
    overflow: "hidden",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardPlaceholder: {
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 16,
  },
  cardInfo: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  cardRating: {
    color: "#fbbf24",
    fontSize: 16,
    fontWeight: "600",
  },
  buttons: {
    flexDirection: "row",
    marginBottom: 32,
    gap: 16,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    minWidth: 100,
    alignItems: "center",
  },
  passButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 2,
    borderColor: "rgba(255,100,100,0.5)",
  },
  wantButton: {
    backgroundColor: "rgba(255,100,100,0.2)",
    borderWidth: 2,
    borderColor: "#ff6464",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  doneContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  doneText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  pickedCount: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});