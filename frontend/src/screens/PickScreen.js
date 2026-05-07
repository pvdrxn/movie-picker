import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, Image, StyleSheet, Dimensions, Pressable, ScrollView, RefreshControl, Animated } from "react-native";
import { GestureHandlerRootView, PanGestureHandler, State } from "react-native-gesture-handler";
import { fetchPopularMovies } from "../services/tmdb";
import { addPick, getPicks } from "../api/picksApi";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.4;

function SwipeableCard({ movie, onSwipe, styles, nextMovie, swipeX }) {
  const translateX = swipeX;
  const scale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const x = event.nativeEvent.translationX;
      
      if (x > SWIPE_THRESHOLD) {
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH * 1.5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onSwipe("saved");
          translateX.setValue(0);
          scale.setValue(1);
        });
      } else if (x < -SWIPE_THRESHOLD) {
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH * 1.5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onSwipe("pass");
          translateX.setValue(0);
          scale.setValue(1);
        });
      } else {
        Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
      }
    }
  };

  const rotate = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ["-15deg", "0deg", "15deg"],
  });

  const leftOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const rightOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const animatedStyle = {
    transform: [
      { translateX },
      { rotate },
      { scale },
    ],
  };

  const nextCardAnimatedStyle = {
    opacity: translateX.interpolate({
      inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      outputRange: [0.6, 0.3, 0.6],
      extrapolate: 'clamp',
    }),
    transform: [{
      scale: translateX.interpolate({
        inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
        outputRange: [1, 0.8, 1],
        extrapolate: 'clamp',
      }),
    }],
  };

  const containerStyle = {
    opacity: fadeAnim,
  };

  return (
    <Animated.View style={[styles.cardContainer, containerStyle]}>
      {nextMovie && (
        <Animated.View style={[styles.card, styles.nextCard, { backgroundColor: "#1a1a1a", borderColor: "#333" }, nextCardAnimatedStyle]}>
          {nextMovie.poster_path ? (
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/w500${nextMovie.poster_path}`,
              }}
              style={styles.cardImage}
            />
          ) : (
            <View style={[styles.cardImage, styles.cardPlaceholder]}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </Animated.View>
      )}
      <Animated.View style={[styles.indicatorLeft, { opacity: leftOpacity }]}>
        <Text style={styles.indicatorText}>PASS</Text>
      </Animated.View>
      <Animated.View style={[styles.indicatorRight, { opacity: rightOpacity }]}>
        <Text style={styles.indicatorText}>SAVE</Text>
      </Animated.View>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View style={[styles.card, animatedStyle, { backgroundColor: "#1a1a1a", borderColor: "#333" }]}>
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
            <Text style={styles.cardTitle} numberOfLines={2}>
              {movie.title}
            </Text>
            <Text style={styles.cardRating}>
              ★ {movie.vote_average?.toFixed(1) || "N/A"}
            </Text>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
}

export function PickScreen() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedCount, setSavedCount] = useState(0);
  const [passCount, setPassCount] = useState(0);
  const [page, setPage] = useState(1);
  const [cardIndex, setCardIndex] = useState(0);
  const [pickedIds, setPickedIds] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [key, setKey] = useState(0);
  const [swipeX] = useState(new Animated.Value(0));
  const pickedIdsRef = useRef(new Set());

  const backgroundColor = swipeX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ["rgb(255,68,68)", "rgb(0,0,0)", "rgb(167,237,16)"],
    extrapolate: "clamp",
  });

  const loadMovies = async (reset = false) => {
    try {
      const data = await fetchPopularMovies({ page: reset ? 1 : page });
      const newMovies = (data.results || []).filter(m => !pickedIdsRef.current.has(m.id));
      if (reset) {
        setMovies(newMovies);
        setPage(2);
        setCardIndex(0);
      } else {
        setMovies((prev) => [...prev, ...newMovies]);
        setPage((p) => p + 1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadPickedIds() {
      try {
        const picks = await getPicks();
        const ids = new Set(picks.map(p => p.tmdb_id));
        setPickedIds(ids);
        pickedIdsRef.current = ids;
        loadMovies(true);
      } catch (err) {
        loadMovies(true);
      }
    }
    loadPickedIds();
  }, []);

  useEffect(() => {
    if (cardIndex >= movies.length - 5 && !loading) {
      loadMovies();
    }
  }, [cardIndex, movies.length, loading]);

  const handleChoice = async (choice, movie) => {
    if (!movie) return;

    try {
      await addPick({
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        rating: movie.vote_average,
        choice,
      });
    } catch (err) {
      // silently fail
    }

    if (choice === "saved") {
      setSavedCount((c) => c + 1);
    } else {
      setPassCount((c) => c + 1);
    }
    setCardIndex((c) => c + 1);
    setPickedIds(prev => {
      const newSet = new Set([...prev, movie.id]);
      pickedIdsRef.current = newSet;
      return newSet;
    });
    setKey(k => k + 1);
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setCardIndex(0);
    setSavedCount(0);
    setPassCount(0);
    setPage(1);
    loadMovies(true).finally(() => setRefreshing(false));
  }, []);

  const currentMovie = movies[cardIndex];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      alignItems: "center",
      paddingTop: 60,
      paddingHorizontal: 0,
      paddingBottom: 24,
    },
    title: {
      color: "#B5B5B5",
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 4,
    },
    subtitle: {
      color: "#B5B5B5",
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
      width: SCREEN_WIDTH - 48,
      alignItems: "center",
    },
    card: {
      width: SCREEN_WIDTH - 48,
      height: (SCREEN_WIDTH - 48) * 1.4,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 2,
    },
    nextCard: {
      position: "absolute",
      top: 0,
      zIndex: -1,
    },
    cardImage: {
      width: "100%",
      height: "80%",
      resizeMode: "cover",
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
      color: "#B5B5B5",
      fontSize: 18,
      fontWeight: "700",
    },
    cardRating: {
      color: "#B5B5B5",
      fontSize: 16,
      fontWeight: "600",
    },
    buttonRow: {
      flexDirection: "row",
      marginTop: 24,
      gap: 16,
    },
    button: {
      width: 120,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
    },
    passButton: {
      backgroundColor: "#333",
    },
    saveButton: {
      backgroundColor: "#0095f6",
    },
    buttonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "700",
    },
    progressText: {
      color: "rgba(255,255,255,0.5)",
      fontSize: 14,
      marginTop: 16,
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
    indicatorLeft: {
      position: "absolute",
      top: 20,
      left: 10,
      zIndex: 10,
      backgroundColor: "#ff4444",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    indicatorRight: {
      position: "absolute",
      top: 20,
      right: 10,
      zIndex: 10,
      backgroundColor: "#A7ED10",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    indicatorText: {
      color: "#000",
      fontSize: 18,
      fontWeight: "800",
    },
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
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={[styles.errorText, { marginBottom: 20 }]}>Error: {error}</Text>
        <Pressable style={styles.resetButton} onPress={() => { setError(null); loadMovies(true); }}>
          <Text style={styles.resetText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const noMoreMovies = cardIndex >= movies.length;

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor }]} />
      <GestureHandlerRootView style={{ flex: 1 }}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#fff"
          colors={["#fff"]}
        />
      }
    >
      <Text style={styles.title}>Pick Movies</Text>
      <Text style={styles.subtitle}>
        left to <Text style={{ color: "#ff4444" }}>Pass</Text> - right to <Text style={{ color: "#A7ED10" }}>Save</Text>
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
              setKey(k => k + 1);
              loadMovies(true);
            }}
            style={styles.resetButton}
          >
            <Text style={styles.resetText}>Start Over</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <SwipeableCard
            key={key}
            movie={currentMovie}
            nextMovie={movies[cardIndex + 1]}
            onSwipe={(choice) => handleChoice(choice, currentMovie)}
            styles={styles}
            swipeX={swipeX}
          />
        </>
      )}
    </ScrollView>
    </GestureHandlerRootView>
    </View>
  );
}