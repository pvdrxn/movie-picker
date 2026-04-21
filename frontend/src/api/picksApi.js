import { http } from "./http";

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
  console.log("POST payload:", JSON.stringify(payload));
  const { data } = await http.post("/api/picks/", payload);
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