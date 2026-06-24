import { http } from "./http";

const pickListeners = [];
const watchedListeners = [];

export function subscribePicks(callback) {
  pickListeners.push(callback);
  return () => {
    const idx = pickListeners.indexOf(callback);
    if (idx > -1) pickListeners.splice(idx, 1);
  };
}

export function subscribeWatched(callback) {
  watchedListeners.push(callback);
  return () => {
    const idx = watchedListeners.indexOf(callback);
    if (idx > -1) watchedListeners.splice(idx, 1);
  };
}

function notifyPickListeners() {
  pickListeners.forEach(cb => cb());
}

function notifyWatchedListeners() {
  watchedListeners.forEach(cb => cb());
}

export async function addPick({ tmdbId, title, posterPath, rating, choice, notify = true }) {
  const payload = {
    tmdb_id: tmdbId,
    title,
    choice,
  };
  if (posterPath) {
    payload.poster_path = posterPath.startsWith("http") ? posterPath : `https://image.tmdb.org/t/p/w500${posterPath}`;
  }
  if (rating != null && typeof rating === "number" && !isNaN(rating)) {
    payload.rating = Math.round(rating * 10) / 10;
  }
  const { data } = await http.post("/api/picks/", payload);
  if (notify) {
    notifyPickListeners();
  }
  return data;
}

export async function getPicks(choice = null) {
  const params = choice ? { choice } : {};
  const { data } = await http.get("/api/picks/", { params });
  return data;
}

export async function deletePick(id, { notify = true } = {}) {
  const { data } = await http.delete(`/api/picks/${id}/`);
  if (notify) {
    notifyPickListeners();
  }
  return data;
}

export async function toggleWatched(id) {
  const { data } = await http.post(`/api/picks/${id}/toggle_watched/`);
  notifyWatchedListeners();
  return data;
}

export async function getWatchedPicks() {
  const { data } = await http.get("/api/picks/watched/");
  return data;
}