import React from "react";
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";


const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export function MovieCard({ movie, onPress, watched = false, showTitle = true }) {
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
          <Text style={[styles.ratingText, { color: (movie.vote_average || 0) >= 8 ? colors.rating : colors.text.primary }]}>{rating}</Text>
          {watched ? (
            <Ionicons name="eye" size={16} color={colors.accent} style={{ marginLeft: 5 }} />
          ) : null}
        </View>
      </View>
      {showTitle && (
        <View style={[styles.overlay, { width: cardWidth, height: 36 }]}>
          <Text style={styles.title} numberOfLines={2}>
            {movie.title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  posterContainer: {
    position: "relative",
  },
  poster: {
    borderRadius: 4,
  },
  posterPlaceholder: {
    borderRadius: 4,
    backgroundColor: colors.bg.elevated,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: colors.text.tertiary,
    fontSize: 12,
  },
  ratingBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: colors.bg.overlay,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700",
  },
  overlay: {
    marginTop: 8,
  },
  title: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
});