import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, Dimensions, Pressable } from "react-native";
import Swiper from "react-native-deck-swiper";
import { fetchPopularMovies } from "../services/tmdb";
import { addPick } from "../api/picksApi";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function PickScreen() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [passCount, setPassCount] = useState(0);
  const [page, setPage] = useState(1);
  const [cardIndex, setCardIndex] = useState(0);
  const swiperRef = useRef(null);

  const loadMovies = async (reset = false) => {
    try {
      const data = await fetchPopularMovies({ page: reset ? 1 : page });
      if (reset) {
        setMovies(data.results || []);
        setPage(2);
        setCardIndex(0);
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

  const handleSwiped = async (direction, cardIndex) => {
    const movie = movies[cardIndex];
    if (!movie) return;

    const choice = direction === "right" ? "saved" : "pass";

    try {
      await addPick({
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        rating: movie.vote_average,
        choice,
      });
    } catch (err) {
      console.warn("Failed to save pick:", err);
    }

    if (direction === "right") {
      setSavedCount((c) => c + 1);
    } else {
      setPassCount((c) => c + 1);
    }
  };

  const handleSwipedAll = () => {
    console.log("All cards swiped");
  };

  const renderCard = (movie) => {
    if (!movie) return null;

    return (
      <View style={styles.card}>
        {movie.poster_path ? (
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            }}
            style={styles.cardImage}
          />
        ) : (
          <View style={[styles.cardImage, styles.cardPlaceholder]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{movie.title}</Text>
          <Text style={styles.cardRating}>
            ★ {movie.vote_average?.toFixed(1) || "N/A"}
          </Text>
        </View>
      </View>
    );
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

  const noMoreMovies = cardIndex >= movies.length;

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
              setCardIndex(0);
              setSavedCount(0);
              setPassCount(0);
              setPage(1);
              loadMovies(true);
            }}
            style={styles.resetButton}
          >
            <Text style={styles.resetText}>Start Over</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.swiperContainer}>
          <Swiper
            ref={swiperRef}
            cards={movies}
            renderCard={renderCard}
            keyExtractor={(item) => item.id.toString()}
            onSwipedLeft={(index, movie) => {
              setCardIndex(index + 1);
              handleSwiped("left", index);
            }}
            onSwipedRight={(index, movie) => {
              setCardIndex(index + 1);
              handleSwiped("right", index);
            }}
            onSwipedAll={handleSwipedAll}
            cardIndex={cardIndex}
            infinite={false}
            horizontalSwipe={true}
            verticalSwipe={false}
            showSecondCard={true}
            stackSize={1}
            stackScale={5}
            stackSeparation={10}
            swipeThreshold={30}
            backgroundColor="transparent"
            cardStyle={{
              width: SCREEN_WIDTH - 48,
              height: (SCREEN_WIDTH - 48) * 1.5,
            }}
            containerStyle={styles.swiperInner}
          />
        </View>
      )}

      {movies.length > 0 && cardIndex < movies.length && (
        <View style={styles.buttons}>
          <Pressable
            onPress={() => swiperRef.current?.swipeLeft()}
            style={[styles.button, styles.passButton]}
          >
            <Text style={styles.buttonText}>✕</Text>
          </Pressable>
          <Pressable
            onPress={() => swiperRef.current?.swipeRight()}
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
  swiperContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    alignItems: "center",
  },
  swiperInner: {
    alignItems: "center",
    justifyContent: "center",
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