const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

if (!API_KEY) {
  throw new Error("Missing EXPO_PUBLIC_TMDB_API_KEY in environment");
}

async function tmdbFetch(path, params = {}) {
  const queryString = new URLSearchParams({ api_key: API_KEY, ...params }).toString();
  const url = `${BASE_URL}${path}?${queryString}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TMDB error: ${response.status} ${response.statusText}`);
  }

  return response.json();
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
  return tmdbFetch(`/movie/${movieId}`);
}