import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, Dimensions, Pressable, Animated, PanResponder } from "react-native";
import { fetchPopularMovies } from "../services/tmdb";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function PickScreen() {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [passCount, setPassCount] = useState(0);

  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchPopularMovies()
      .then((data) => {
        setMovies(data.results || []);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSwipe = (direction) => {
    const targetX = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;
    
    Animated.timing(translateX, {
      toValue: targetX,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (direction === "right") {
        setSavedCount(c => c + 1);
      } else {
        setPassCount(c => c + 1);
      }
      setCurrentIndex(c => c + 1);
      translateX.setValue(0);
    });
  };

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50) {
          handleSwipe("right");
        } else if (gestureState.dx < -50) {
          handleSwipe("left");
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const opacity = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  const scale = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0.85, 1, 0.85],
    extrapolate: 'clamp',
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
              { transform: [{ translateX }, { scale }], opacity },
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

      {currentMovie && (
        <View style={styles.buttons}>
          <Pressable
            onPress={() => handleSwipe("left")}
            style={[styles.button, styles.passButton]}
          >
            <Text style={styles.buttonText}>✕ Pass</Text>
          </Pressable>
          <Pressable
            onPress={() => handleSwipe("right")}
            style={[styles.button, styles.wantButton]}
          >
            <Text style={styles.buttonText}>♥ Save</Text>
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