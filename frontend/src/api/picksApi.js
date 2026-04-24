import { http } from "./http";

const listeners = [];

export function subscribePicks(callback) {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

function notifyListeners() {
  listeners.forEach(cb => cb());
}

export async function addPick({ tmdbId, title, posterPath, rating, choice }) {
  const payload = {
    tmdb_id: tmdbId,
    title,
    choice,
  };
  if (posterPath) {
    payload.poster_path = posterPath.startsWith("http") ? posterPath : `https://image.tmdb.org/t/p/w500${posterPath}`;
  }
  if (rating != null) {
    payload.rating = parseFloat(rating.toFixed(1));
  }
  const { data } = await http.post("/api/picks/", payload);
  notifyListeners();
  return data;
}

export async function getPicks(choice = null) {
  const params = choice ? { choice } : {};
  const { data } = await http.get("/api/picks/", { params });
  return data;
}

export async function deletePick(id) {
  const { data } = await http.delete(`/api/picks/${id}/`);
  return data;
}