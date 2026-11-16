/**
 * Partner app authentication — SecureStore + JWT.
 */
import * as SecureStore from "expo-secure-store";
import { authClient } from "./clients";

const ACCESS_KEY = "kullo.partner.access_token";
const REFRESH_KEY = "kullo.partner.refresh_token";
const USER_KEY = "kullo.partner.user";

export type PartnerUserRole = "driver" | "merchant" | "courier" | "admin";

export interface PartnerUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: PartnerUserRole;
  displayName: string | null;
  restaurantId?: string | null;
  locale: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: PartnerUser;
}

export const partnerAuth = {
  async saveTokens(tokens: AuthTokens): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken);
    await SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(tokens.user));
  },

  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_KEY);
  },

  async getUser(): Promise<PartnerUser | null> {
    const raw = await SecureStore.getItemAsync(USER_KEY);
    return raw ? (JSON.parse(raw) as PartnerUser) : null;
  },

  async updateUser(patch: Partial<PartnerUser>): Promise<PartnerUser | null> {
    const current = await this.getUser();
    if (!current) return null;
    const next = { ...current, ...patch };
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(next));
    return next;
  },

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync(ACCESS_KEY);
    return !!token;
  },

  async login(
    identifier: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${authClient.url}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.accessToken) {
        return { success: false, error: data.message ?? "Login failed" };
      }
      await this.saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: {
          id: data.user?.id ?? "",
          email: data.user?.email ?? null,
          phone: data.user?.phone ?? null,
          role: data.user?.role ?? "driver",
          displayName: data.user?.display_name ?? null,
          restaurantId: data.user?.restaurant_id ?? null,
          locale: data.user?.locale ?? "tr",
        },
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: "Network error" };
    }
  },

  async refresh(): Promise<string | null> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) return null;
    try {
      const res = await fetch(`${authClient.url}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        await this.clear();
        return null;
      }
      const data = await res.json();
      if (data.accessToken) {
        await SecureStore.setItemAsync(ACCESS_KEY, data.accessToken);
        if (data.refreshToken) {
          await SecureStore.setItemAsync(REFRESH_KEY, data.refreshToken);
        }
        return data.accessToken;
      }
      return null;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    await this.clear();
  },
};
