/**
 * Mock auth layer
 * ─────────────────
 * Pure client-side stub so the UI can demonstrate the full lifecycle without a backend.
 * REPLACE with Lovable Cloud / Supabase auth when wiring up:
 *   - signUp -> supabase.auth.signUp({ email, password })
 *   - signIn -> supabase.auth.signInWithPassword({ email, password })
 *   - signOut -> supabase.auth.signOut()
 */

export interface BayanUser {
  id: string;
  name: string;
  email: string;
}

const KEY = "bayan.user";

export function getCurrentUser(): BayanUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BayanUser) : null;
  } catch {
    return null;
  }
}

export function signIn(email: string, _password: string): BayanUser {
  const user: BayanUser = {
    id: crypto.randomUUID(),
    name: email.split("@")[0] || "Friend",
    email,
  };
  localStorage.setItem(KEY, JSON.stringify(user));
  try {
    const prefs = JSON.parse(localStorage.getItem("bayan.prefs") || "{}");
    prefs.onboarded = true;
    localStorage.setItem("bayan.prefs", JSON.stringify(prefs));
  } catch {}
  window.dispatchEvent(new Event("bayan:auth"));
  window.dispatchEvent(new Event("bayan:prefs"));
  return user;
}

export function signUp(name: string, email: string, _password: string): BayanUser {
  const user: BayanUser = { id: crypto.randomUUID(), name: name || "Friend", email };
  localStorage.setItem(KEY, JSON.stringify(user));
  // mark fresh signup → needs onboarding
  try {
    const prefs = JSON.parse(localStorage.getItem("bayan.prefs") || "{}");
    delete prefs.onboarded;
    localStorage.setItem("bayan.prefs", JSON.stringify(prefs));
  } catch {}
  window.dispatchEvent(new Event("bayan:auth"));
  window.dispatchEvent(new Event("bayan:prefs"));
  return user;
}

export function signOut() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("bayan:auth"));
}

export function socialSignIn(provider: "google" | "apple"): BayanUser {
  return signIn(`${provider}-user@bayan.app`, "social");
}
