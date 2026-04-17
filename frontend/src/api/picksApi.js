import { http } from "./http";

export async function addPick({ tmdbId, title, posterPath, rating, choice }) {
  const { data } = await http.post("/api/picks/", {
    tmdb_id: tmdbId,
    title,
    poster_path: posterPath,
    rating,
    choice,
  });
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