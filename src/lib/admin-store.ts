import { useSyncExternalStore } from "react";

export type BakeryAccount = {
  id: string;
  businessName: string;
  username: string;
  // Stored in plaintext because the Super Admin table displays it.
  password: string;
  passwordHash: string;
  registeredAt: string;
  subscriptionStart: string;
  subscriptionExpiresAt: string;
  lastLogin?: string;
};

export type SubscriptionInfo = {
  status: "Active" | "Expired";
  daysRemaining: number;
  expiresAt: Date;
};

type State = {
  accounts: BakeryAccount[];
  currentBakeryId: string | null;
  superAdminAuthed: boolean;
};

const STORAGE_KEY = "mcphilix-admin-state-v2";

// Hardcoded Super Admin credentials (permanent).
const SUPER_ADMIN_USERNAME = "superadminarza";
const SUPER_ADMIN_PASSWORD = "Mograljim@dxb1";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const SUBSCRIPTION_DAYS = 30;

// Simple synchronous hash (djb2). Not cryptographic — matches the demo scope.
export function hashPassword(pw: string): string {
  let h = 5381;
  for (let i = 0; i < pw.length; i++) h = ((h << 5) + h + pw.charCodeAt(i)) | 0;
  return `h_${(h >>> 0).toString(16)}_${pw.length}`;
}

const initial: State = {
  accounts: [],
  currentBakeryId: null,
  superAdminAuthed: false,
};

let state: State = load();
const listeners = new Set<() => void>();

function load(): State {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      accounts: (parsed.accounts ?? []) as BakeryAccount[],
      currentBakeryId: parsed.currentBakeryId ?? null,
      superAdminAuthed: false, // never persist session
    };
  } catch {
    return initial;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  const { superAdminAuthed: _s, ...toSave } = state;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

function set(updater: (s: State) => State) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useAdmin() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initial,
  );
}

export function subscriptionInfo(acc: BakeryAccount): SubscriptionInfo {
  const expiresAt = new Date(acc.subscriptionExpiresAt);
  const diffMs = expiresAt.getTime() - Date.now();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / MS_PER_DAY));
  return {
    status: diffMs > 0 ? "Active" : "Expired",
    daysRemaining,
    expiresAt,
  };
}

function newExpiryFromNow(): string {
  return new Date(Date.now() + SUBSCRIPTION_DAYS * MS_PER_DAY).toISOString();
}

export const admin = {
  createAccount(input: { businessName: string; username: string; password: string }) {
    if (state.accounts.some((a) => a.username.toLowerCase() === input.username.toLowerCase())) {
      throw new Error("Username already exists");
    }
    const now = new Date();
    const acc: BakeryAccount = {
      id: `b-${Date.now()}`,
      businessName: input.businessName,
      username: input.username,
      password: input.password,
      passwordHash: hashPassword(input.password),
      registeredAt: now.toISOString(),
      subscriptionStart: now.toISOString(),
      subscriptionExpiresAt: newExpiryFromNow(),
    };
    set((s) => ({ ...s, accounts: [acc, ...s.accounts] }));
  },
  renewSubscription(id: string) {
    const now = new Date();
    set((s) => ({
      ...s,
      accounts: s.accounts.map((a) =>
        a.id === id
          ? {
              ...a,
              subscriptionStart: now.toISOString(),
              subscriptionExpiresAt: newExpiryFromNow(),
            }
          : a,
      ),
    }));
  },
  resetPassword(id: string, newPassword: string) {
    set((s) => ({
      ...s,
      accounts: s.accounts.map((a) =>
        a.id === id
          ? { ...a, password: newPassword, passwordHash: hashPassword(newPassword) }
          : a,
      ),
    }));
  },
  updateAccount(
    id: string,
    patch: Partial<Pick<BakeryAccount, "username" | "businessName">>,
  ) {
    if (patch.username) {
      const clash = state.accounts.find(
        (a) => a.id !== id && a.username.toLowerCase() === patch.username!.toLowerCase(),
      );
      if (clash) throw new Error("Username already exists");
    }
    set((s) => ({
      ...s,
      accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  },
  deleteAccount(id: string) {
    set((s) => ({ ...s, accounts: s.accounts.filter((a) => a.id !== id) }));
  },
  /**
   * Bakery login. Returns:
   *   { ok: true, account } on success
   *   { ok: false, reason: "invalid" | "expired" } otherwise
   * Only accounts created by the Super Admin can sign in.
   */
  loginBakery(
    username: string,
    password: string,
  ):
    | { ok: true; account: BakeryAccount }
    | { ok: false; reason: "invalid" | "expired" } {
    const acc = state.accounts.find(
      (a) => a.username.toLowerCase() === username.toLowerCase(),
    );
    if (!acc) return { ok: false, reason: "invalid" };
    if (acc.passwordHash !== hashPassword(password)) return { ok: false, reason: "invalid" };
    const info = subscriptionInfo(acc);
    if (info.status === "Expired") return { ok: false, reason: "expired" };
    set((s) => ({
      ...s,
      currentBakeryId: acc.id,
      accounts: s.accounts.map((a) =>
        a.id === acc.id ? { ...a, lastLogin: new Date().toISOString() } : a,
      ),
    }));
    return { ok: true, account: acc };
  },
  loginSuperAdmin(username: string, password: string): boolean {
    const ok =
      username.trim() === SUPER_ADMIN_USERNAME && password === SUPER_ADMIN_PASSWORD;
    if (ok) set((s) => ({ ...s, superAdminAuthed: true }));
    return ok;
  },
  logoutSuperAdmin() {
    set((s) => ({ ...s, superAdminAuthed: false }));
  },
};

export function generateTempPassword() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
