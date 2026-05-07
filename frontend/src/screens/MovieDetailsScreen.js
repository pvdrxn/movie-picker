import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Image, StyleSheet, ScrollView, Pressable, Dimensions, RefreshControl } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { fetchMovieDetails, fetchMovieCredits, fetchMovieWatchProviders, fetchMovieTrailer, fetchMovieReleaseDates } from "../services/tmdb";
import { addPick, getPicks, subscribePicks, subscribeWatched, getWatchedPicks, toggleWatched } from "../api/picksApi";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function MovieDetailsScreen({ route, navigation }) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [watchProviders, setWatchProviders] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [releaseDates, setReleaseDates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [isWatched, setIsWatched] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchMovieDetails(movieId),
      fetchMovieCredits(movieId),
      fetchMovieWatchProviders(movieId),
      fetchMovieTrailer(movieId),
      fetchMovieReleaseDates(movieId),
    ])
      .then(([details, creditsData, providersData, trailerData, releaseData]) => {
        setMovie(details);
        setCredits(creditsData);
        setWatchProviders(providersData);
        setTrailer(trailerData);
        setReleaseDates(releaseData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [movieId]);

  const checkFavorite = useCallback(async () => {
    try {
      const picks = await getPicks("saved");
      const found = picks.find(p => p.tmdb_id === movieId);
      if (found) {
        setIsFavorite(true);
        setFavoriteId(found.id);
      } else {
        setIsFavorite(false);
        setFavoriteId(null);
      }
    } catch (err) {
      console.warn("Failed to check favorite:", err.message);
    }
  }, [movieId]);

  const checkWatched = useCallback(async () => {
    try {
      const watched = await getWatchedPicks();
      const found = watched.find(p => Number(p.tmdb_id) === Number(movieId));
      setIsWatched(!!found);
    } catch (err) {
      console.warn("Failed to check watched:", err.message);
    }
  }, [movieId]);

  useEffect(() => {
    checkFavorite();
    checkWatched();
  }, [checkFavorite, checkWatched]);

  useEffect(() => {
    const unsubscribePicks = subscribePicks(() => {
      checkFavorite();
    });
    return unsubscribePicks;
  }, [checkFavorite]);

  useEffect(() => {
    const unsubscribeWatched = subscribeWatched(() => {
      checkWatched();
    });
    return unsubscribeWatched;
  }, [checkWatched]);

  const handlePlayTrailer = async () => {
    if (trailer?.key) {
      await WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${trailer.key}`);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      fetchMovieDetails(movieId),
      fetchMovieCredits(movieId),
      fetchMovieWatchProviders(movieId),
      fetchMovieTrailer(movieId),
      fetchMovieReleaseDates(movieId),
    ])
      .then(([details, creditsData, providersData, trailerData, releaseData]) => {
        setMovie(details);
        setCredits(creditsData);
        setWatchProviders(providersData);
        setTrailer(trailerData);
        setReleaseDates(releaseData);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setRefreshing(false));
  }, [movieId]);

  const handleToggleFavorite = async () => {
    if (!movie) return;
    const previousState = isFavorite;
    const previousId = favoriteId;
    setIsFavorite(!isFavorite);
    try {
      if (isFavorite) {
        await addPick({
          tmdbId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
          rating: movie.vote_average,
          choice: "pass",
        });
      } else {
        await addPick({
          tmdbId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
          rating: movie.vote_average,
          choice: "saved",
        });
      }
      checkFavorite();
    } catch (err) {
      setIsFavorite(previousState);
      setFavoriteId(previousId);
      console.warn("Failed to toggle favorite:", err.message);
    }
  };

  const handleToggleWatched = async () => {
    const previousState = isWatched;
    setIsWatched(!isWatched);
    try {
      if (!favoriteId && movie) {
        await addPick({
          tmdbId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path,
          rating: movie.vote_average,
          choice: "saved",
          notify: false,
        });
        const picks = await getPicks("saved");
        const saved = picks.find(p => Number(p.tmdb_id) === Number(movieId));
        if (saved) {
          await toggleWatched(saved.id);
        }
        checkWatched();
        return;
      }
      if (favoriteId) {
        await toggleWatched(favoriteId);
        checkWatched();
      }
    } catch (err) {
      setIsWatched(previousState);
      console.warn("Failed to toggle watched:", err.message);
    }
  };

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

  const getAdditionalRatings = () => {
    if (!releaseDates?.results) return null;
    const usRelease = releaseDates.results.find(r => r.iso_3166_1 === "US");
    if (!usRelease?.release_dates?.length) return null;
    const certification = usRelease.release_dates.find(d => d.certification);
    if (!certification?.certification) return null;
    return certification.certification;
  };

  const getRatings = () => {
    if (!releaseDates?.results) return [];
    const ratings = [];
    const seen = new Set();
    const usRelease = releaseDates.results.find(r => r.iso_3166_1 === "US");
    if (usRelease?.release_dates) {
      usRelease.release_dates.forEach(date => {
        if (date.certification && !seen.has(date.certification)) {
          seen.add(date.certification);
          ratings.push({ source: "US", value: date.certification });
        }
      });
    }
    return ratings;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
            colors={["#fff"]}
          />
        }
      >
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.header}>
          {movie.poster_path ? (
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
              style={styles.poster}
            />
          ) : (
            <View style={[styles.poster, styles.posterPlaceholder]}>
              <Text style={styles.posterInitials}>
                {movie.title.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.title}>{movie.title}</Text>
            <Text style={styles.rating}>★ {movie.vote_average?.toFixed(1) || "N/A"}</Text>
            {(() => {
              const ratings = getRatings();
              if (ratings.length === 0) return null;
              return (
                <View style={styles.ratingsContainer}>
                  {ratings.map((r, i) => (
                    <View key={i} style={styles.ratingBadge}>
                      <Text style={styles.ratingBadgeText}>{r.source} {r.value}</Text>
                    </View>
                  ))}
                </View>
              );
            })()}
            <View style={styles.actionButtons}>
              <Pressable onPress={handleToggleFavorite} style={styles.favoriteButton}>
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={24}
                  color={isFavorite ? "#ff6464" : "rgba(255,255,255,0.6)"}
                />
              </Pressable>
              <Pressable onPress={handleToggleWatched} style={styles.watchedButton}>
                <Ionicons
                  name="eye"
                  size={24}
                  color={isWatched ? "#4ade80" : "rgba(255,255,255,0.6)"}
                />
              </Pressable>
            </View>
            <Text style={styles.meta}>
              {movie.release_date?.split("-")[0] || "N/A"} · {movie.runtime} min
            </Text>
            <Text style={styles.genres}>{genres}</Text>
          </View>
        </View>

        {director && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Director</Text>
            <View style={styles.directorRow}>
              {director.profile_path ? (
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w185${director.profile_path}` }}
                  style={styles.directorImage}
                />
              ) : (
                <View style={[styles.directorImage, styles.castPlaceholder]}>
                  <Text style={styles.castInitials}>
                    {director.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </Text>
                </View>
              )}
              <Text style={styles.directorText}>{director.name}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <Text style={styles.synopsis}>
            {movie.overview || "No synopsis available."}
          </Text>
        </View>

        {trailer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trailer</Text>
            <Pressable
              style={styles.trailerButton}
              onPress={handlePlayTrailer}
            >
              <Ionicons name="play-circle" size={40} color="#fff" />
            </Pressable>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castScroll}>
            {cast.map((actor) => (
              <View key={actor.id} style={styles.castItem}>
                {actor.profile_path ? (
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w185${actor.profile_path}` }}
                    style={styles.castImage}
                  />
                ) : (
                  <View style={[styles.castImage, styles.castPlaceholder]}>
                    <Text style={styles.castInitials}>
                      {actor.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </Text>
                  </View>
                )}
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

        {watchProviders?.results && Object.keys(watchProviders.results).length > 0 && (() => {
            const region = Object.keys(watchProviders.results)[0];
            const providerData = watchProviders.results[region];
            const providers = providerData?.flatrate || providerData?.rent || providerData?.buy || [];
            if (providers.length === 0) return null;
            return (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Where to Watch</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.providerScroll}>
                  {providers.map((provider) => (
                    <View key={provider.provider_id} style={styles.providerItem}>
                      {provider.logo_path && (
                        <Image
                          source={{ uri: `https://image.tmdb.org/t/p/w92${provider.logo_path}` }}
                          style={styles.providerLogo}
                        />
                      )}
                      <Text style={styles.providerName}>{provider.provider_name}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            );
          })()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
scrollView: {
    flex: 1,
  },
  topBar: {
    padding: 10,
    paddingTop: 25,
    paddingLeft: 3
  },
backButton: {
    width: 45,
    height: 45,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 0,
    marginTop: 0,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  posterPlaceholder: {
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  posterInitials: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 32,
    fontWeight: "700",
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
  favoriteButton: {
    marginTop: 4,
  },
  watchedButton: {
    marginTop: 4,
    marginLeft: 12,
  },
  actionButtons: {
    flexDirection: "row",
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
  ratingsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    marginBottom: 4,
  },
  ratingBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
    marginTop: 4,
  },
  ratingBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
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
  directorRow: {
    alignItems: "flex-start",
  },
  directorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  directorText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
    width: 80,
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
    alignItems: "center",
  },
  castImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  castPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  castInitials: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 24,
    fontWeight: "600",
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
  providerScroll: {
    flexDirection: "row",
  },
  providerItem: {
    alignItems: "center",
    marginRight: 16,
    width: 70,
  },
  providerLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  providerName: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    textAlign: "center",
    marginTop: 4,
  },
  trailerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e50914",
    justifyContent: "center",
    alignItems: "center",
  },
  noProvidersText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 14,
    fontStyle: "italic",
  },
});