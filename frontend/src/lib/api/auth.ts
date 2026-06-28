import { apiFetch } from "./client";
import type { Session } from "@/types";

export async function login(username: string, password: string): Promise<Session> {
  return apiFetch<Session>("/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function logout(): Promise<void> {
  return apiFetch<void>("/logout", { method: "POST" });
}

export async function getSession(): Promise<Session> {
  return apiFetch<Session>("/session");
}
