/**
 * Partner app API — Driver location, rides, food orders, merchant operations.
 */
import { postgrest, orchestrator } from "./clients";
import { partnerAuth } from "./auth";
import {
  DEMO_DRIVER_STATS,
  DEMO_DRIVER_TRIPS,
  type DemoDriverTrip,
} from "./demo-trips";
import {
  DEMO_MERCHANT_ORDERS,
  DEMO_MERCHANT_STATS,
  DEMO_MENU_ITEMS,
  type DemoMerchantOrder,
  type DemoMenuItem,
} from "./partner-demo";

const USE_DEMO_FALLBACK = true;

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = partnerAuth.refresh().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function fetchWithAuth(
  url: string,
  init: RequestInit = {},
  retried = false,
): Promise<Response> {
  const accessToken = await partnerAuth.getAccessToken();
  const headers = new Headers(init.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (!headers.has("Content-Type") && init.body && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 401 && !retried) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return fetchWithAuth(url, init, true);
    }
    await partnerAuth.clear();
  }

  return res;
}

function isApiFailure(payload: unknown, ok: boolean): boolean {
  if (!ok) return true;
  if (payload == null) return true;
  if (typeof payload === "object" && "code" in payload && "message" in payload) {
    return true;
  }
  return false;
}

export type DriverLocation = {
  driverId: string;
  lat: number;
  lng: number;
  online: boolean;
};

export type NearbyDriver = {
  user_id: string;
  gender: string | null;
  geo_lat: number;
  geo_lng: number;
  distance_m: number;
  updated_at: string;
};

export type FoodOrder = {
  id: string;
  code: string;
  restaurant_id: string;
  customer_id: string;
  status: string;
  items: Array<{ name: string; qty: number; price: number }>;
  total_iqd: number;
  delivery_address: string;
  delivery_note?: string;
  created_at: string;
  eta_min?: number;
  courier_name?: string;
};

export type Ride = {
  id: string;
  rider_id: string;
  driver_id: string | null;
  status: string;
  pickup_lat?: number;
  pickup_lng?: number;
  dropoff_lat?: number;
  dropoff_lng?: number;
  fare?: number;
  created_at: string;
};

export const partnerApi = {
  async updateDriverLocation(
    driverId: string,
    lat: number,
    lng: number,
    online: boolean,
  ): Promise<{ ok: boolean }> {
    try {
      const res = await fetchWithAuth(`${orchestrator.url}/drivers/location`, {
        method: "POST",
        body: JSON.stringify({ driverId, lat, lng, online, syncPg: true }),
      });
      const data = await res.json();
      if (isApiFailure(data, res.ok)) {
        return { ok: USE_DEMO_FALLBACK };
      }
      return { ok: true };
    } catch {
      return { ok: USE_DEMO_FALLBACK };
    }
  },

  async getNearbyDrivers(
    lat: number,
    lng: number,
    radiusM = 3000,
    limit = 20,
  ): Promise<NearbyDriver[]> {
    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        radius_m: String(radiusM),
        limit: String(limit),
        source: "redis",
      });
      const res = await fetchWithAuth(
        `${orchestrator.url}/drivers/nearby?${params}`,
      );
      const data = await res.json();
      if (isApiFailure(data, res.ok) || !Array.isArray(data.drivers)) {
        return [];
      }
      return data.drivers;
    } catch {
      return [];
    }
  },

  async dispatchRide(
    rideId: string,
    pickupLat?: number,
    pickupLng?: number,
    radiusM?: number,
  ): Promise<{ ok: boolean; jobId?: string }> {
    try {
      const res = await fetchWithAuth(`${orchestrator.url}/rides/dispatch`, {
        method: "POST",
        body: JSON.stringify({ rideId, pickupLat, pickupLng, radiusM }),
      });
      const data = await res.json();
      if (isApiFailure(data, res.ok)) {
        return { ok: false };
      }
      return { ok: true, jobId: data.jobId };
    } catch {
      return { ok: false };
    }
  },

  async getDriverTrips(): Promise<DemoDriverTrip[]> {
    try {
      const user = await partnerAuth.getUser();
      if (!user) return DEMO_DRIVER_TRIPS;

      const res = await fetchWithAuth(
        `${postgrest.url}/rides?driver_id=eq.${user.id}&order=created_at.desc&limit=50`,
      );
      const data = await res.json();
      if (isApiFailure(data, res.ok) || !Array.isArray(data) || data.length === 0) {
        return DEMO_DRIVER_TRIPS;
      }
      return data.map(
        (r: Record<string, unknown>): DemoDriverTrip => ({
          id: String(r.id),
          kind: "taxi",
          from: "Pickup",
          to: "Dropoff",
          fare: Number(r.fare ?? 25000),
          currency: "IQD",
          status:
            r.status === "requested"
              ? "incoming"
              : r.status === "matched" || r.status === "active"
                ? "active"
                : "done",
          etaMin: 5,
        }),
      );
    } catch {
      return DEMO_DRIVER_TRIPS;
    }
  },

  async getDriverStats(): Promise<typeof DEMO_DRIVER_STATS> {
    return DEMO_DRIVER_STATS;
  },

  async getMerchantOrders(): Promise<DemoMerchantOrder[]> {
    try {
      const user = await partnerAuth.getUser();
      if (!user?.restaurantId) return DEMO_MERCHANT_ORDERS;

      const res = await fetchWithAuth(
        `${postgrest.url}/food_orders?restaurant_id=eq.${user.restaurantId}&order=created_at.desc&limit=50`,
      );
      const data = await res.json();
      if (isApiFailure(data, res.ok) || !Array.isArray(data) || data.length === 0) {
        return DEMO_MERCHANT_ORDERS;
      }

      const itemsRes = await fetchWithAuth(
        `${postgrest.url}/food_order_items?order_id=in.(${data.map((o: { id: string }) => o.id).join(",")})`,
      );
      const itemsData = await itemsRes.json();
      const itemsMap = new Map<string, Array<{ name: string; qty: number }>>();
      if (Array.isArray(itemsData)) {
        for (const item of itemsData) {
          const list = itemsMap.get(item.order_id) ?? [];
          list.push({ name: item.name_snapshot, qty: item.qty });
          itemsMap.set(item.order_id, list);
        }
      }

      return data.map(
        (o: Record<string, unknown>): DemoMerchantOrder => ({
          id: String(o.id),
          code: `#K-${String(o.id).slice(-4)}`,
          customer: "Müşteri",
          items: itemsMap.get(String(o.id)) ?? [],
          total: Number(o.total_iqd ?? 0),
          currency: "IQD",
          status: mapFoodOrderStatus(String(o.status ?? "pending")),
          placedAt: new Date(String(o.created_at)).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          etaMin: Number(o.eta_min ?? 0),
          note: o.delivery_note ? String(o.delivery_note) : undefined,
          courierName: o.courier_id ? "Kurye" : undefined,
        }),
      );
    } catch {
      return DEMO_MERCHANT_ORDERS;
    }
  },

  async updateOrderStatus(
    orderId: string,
    status: string,
  ): Promise<{ ok: boolean }> {
    try {
      const res = await fetchWithAuth(
        `${postgrest.url}/food_orders?id=eq.${orderId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );
      return { ok: res.ok };
    } catch {
      return { ok: false };
    }
  },

  async getMerchantStats(): Promise<typeof DEMO_MERCHANT_STATS> {
    return DEMO_MERCHANT_STATS;
  },

  async getMenuItems(): Promise<DemoMenuItem[]> {
    try {
      const user = await partnerAuth.getUser();
      if (!user?.restaurantId) return DEMO_MENU_ITEMS;

      const res = await fetchWithAuth(
        `${postgrest.url}/menu_items?restaurant_id=eq.${user.restaurantId}&order=sort_order`,
      );
      const data = await res.json();
      if (isApiFailure(data, res.ok) || !Array.isArray(data) || data.length === 0) {
        return DEMO_MENU_ITEMS;
      }
      return data.map(
        (m: Record<string, unknown>): DemoMenuItem => ({
          id: String(m.id),
          name: String(m.name ?? ""),
          price: Number(m.price_iqd ?? 0),
          currency: "IQD",
          available: Boolean(m.is_available),
          category: String(m.category_id ?? "Ana"),
        }),
      );
    } catch {
      return DEMO_MENU_ITEMS;
    }
  },

  async toggleMenuItem(
    itemId: string,
    available: boolean,
  ): Promise<{ ok: boolean }> {
    try {
      const res = await fetchWithAuth(
        `${postgrest.url}/menu_items?id=eq.${itemId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ is_available: available }),
        },
      );
      return { ok: res.ok };
    } catch {
      return { ok: false };
    }
  },

  async setRestaurantOpen(
    restaurantId: string,
    isOpen: boolean,
  ): Promise<{ ok: boolean }> {
    try {
      const res = await fetchWithAuth(
        `${postgrest.url}/restaurants?id=eq.${restaurantId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ is_open: isOpen }),
        },
      );
      return { ok: res.ok };
    } catch {
      return { ok: false };
    }
  },

  async acceptRide(rideId: string): Promise<{ ok: boolean }> {
    try {
      const user = await partnerAuth.getUser();
      if (!user) return { ok: false };

      const res = await fetchWithAuth(`${postgrest.url}/rides?id=eq.${rideId}`, {
        method: "PATCH",
        body: JSON.stringify({ driver_id: user.id, status: "matched" }),
      });
      return { ok: res.ok };
    } catch {
      return { ok: false };
    }
  },

  async completeRide(rideId: string): Promise<{ ok: boolean }> {
    try {
      const res = await fetchWithAuth(`${postgrest.url}/rides?id=eq.${rideId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      });
      return { ok: res.ok };
    } catch {
      return { ok: false };
    }
  },

  async cancelRide(rideId: string): Promise<{ ok: boolean }> {
    try {
      const res = await fetchWithAuth(`${postgrest.url}/rides?id=eq.${rideId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelled" }),
      });
      return { ok: res.ok };
    } catch {
      return { ok: false };
    }
  },
};

function mapFoodOrderStatus(
  status: string,
): DemoMerchantOrder["status"] {
  switch (status) {
    case "pending":
      return "new";
    case "accepted":
      return "accepted";
    case "preparing":
      return "preparing";
    case "ready":
      return "ready";
    case "on_the_way":
    case "delivered":
      return "handed";
    case "cancelled":
    case "rejected":
      return "cancelled";
    default:
      return "new";
  }
}
