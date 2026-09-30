import type { AuthResponse, LoginPayload, RegisterPayload, User } from "../types/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
const TOKEN_KEY = "medicare_token";
const USER_KEY = "medicare_user";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message ?? "Something went wrong. Please try again.");
  }
  return data as T;
}

function save({ token, user }: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export const authService = {
  async login(payload: LoginPayload) {
    const data = await post<AuthResponse>("/auth/login", payload);
    save(data);
    return data.user;
  },

  async register(payload: RegisterPayload) {
    const data = await post<AuthResponse>("/auth/register", payload);
    save(data);
    return data.user;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  },

  isLoggedIn() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },
};