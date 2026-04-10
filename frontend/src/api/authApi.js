import { http } from "./http";

export async function register({ username, email, password }) {
  const { data } = await http.post("/api/auth/register/", {
    username,
    email,
    password,
  });
  return data;
}

export async function login({ username, password }) {
  const { data } = await http.post("/api/auth/token/", { username, password });
  // DRF SimpleJWT returns: { access, refresh }
  return data;
}

export async function me() {
  const { data } = await http.get("/api/auth/me/");
  return data;
}

