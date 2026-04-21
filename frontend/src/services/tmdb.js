const TMDB_BASE_URL = "https://api.themoviedb.org/3";

function getTmdbApiKey() {
  return (
    process.env.EXPO_PUBLIC_TMDB_API_KEY ||
    process.env.EXPO_PUBLIC_API_KEY ||
    process.env.TMDB_API_KEY ||
    process.env.API_KEY
  );
}

function toQueryString(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    sp.set(key, String(value));
  });
  return sp.toString();
}

async function tmdbFetch(path, params = {}) {
  const apiKey = getTmdbApiKey();
  if (!apiKey) {
    throw new Error(
      "TMDB API key missing. Set EXPO_PUBLIC_TMDB_API_KEY in your frontend env."
    );
  }

  const query = toQueryString({
    api_key: apiKey,
    language: "en-US",
    include_adult: false,
    ...params,
  });

  const url = `${TMDB_BASE_URL}${path}?${query}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    let details = "";
    try {
      const body = await res.json();
      details = body?.status_message ? ` (${body.status_message})` : "";
    } catch {
      // ignore JSON parse errors; keep a generic message
    }
    throw new Error(`TMDB request failed: ${res.status} ${res.statusText}${details}`);
  }

  return res.json();
}

export async function fetchPopularMovies({ page = 1 } = {}) {
  return tmdbFetch("/movie/popular", { page });
}

export async function fetchTrendingMovies({ timeWindow = "day", page = 1 } = {}) {
  return tmdbFetch(`/trending/movie/${timeWindow}`, { page });
}

export async function fetchTopRatedMovies({ page = 1 } = {}) {
  return tmdbFetch("/movie/top_rated", { page });
}

export async function fetchUpcomingMovies({ page = 1 } = {}) {
  return tmdbFetch("/movie/upcoming", { page });
}

export async function fetchMovieDetails(movieId) {
  if (!movieId) throw new Error("movieId is required");
  return tmdbFetch(`/movie/${movieId}`);
}

export async function fetchMovieCredits(movieId) {
  if (!movieId) throw new Error("movieId is required");
  return tmdbFetch(`/movie/${movieId}/credits`);
}