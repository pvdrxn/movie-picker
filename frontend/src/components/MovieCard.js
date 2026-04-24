import React from "react";
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";


const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export function MovieCard({ movie, onPress }) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 32) / 2 - 20;

  const posterUri = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : null;

  const rating = (movie.vote_average != null)
    ? Number(movie.vote_average).toFixed(1)
    : "N/A";

  return (
    <Pressable onPress={() => onPress?.(movie)} style={styles.container}>
      <View style={[styles.posterContainer, { width: cardWidth }]}>
        {posterUri ? (
          <Image source={{ uri: posterUri }} style={[styles.poster, { width: cardWidth, height: cardWidth * 1.5 }]} />
        ) : (
          <View style={[styles.posterPlaceholder, { width: cardWidth, height: cardWidth * 1.5 }]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      </View>
      <View style={[styles.overlay, { width: cardWidth, height: 36 }]}>
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginBottom: 8,
  },
  posterContainer: {
    position: "relative",
  },
  poster: {
    borderRadius: 12,
  },
  posterPlaceholder: {
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
  },
  ratingBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  overlay: {
    marginTop: 8,
  },
  title: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
});