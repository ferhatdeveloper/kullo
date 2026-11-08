import { create } from "zustand";

import { Agent, Coordinates, calculateDistance, formatETA } from "./live-location";

export type OrderType = "food" | "market" | "taxi" | "delivery";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "assigned"
  | "picked_up"
  | "en_route"
  | "arriving"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  items?: OrderItem[];
  pickupLocation: Coordinates & { address: string };
  dropoffLocation: Coordinates & { address: string };
  estimatedTime?: number;
  actualTime?: number;
  totalAmount: number;
  currency: string;
  assignedAgent?: Agent;
  createdAt: number;
  updatedAt: number;
  notes?: string;
  rating?: number;
  tip?: number;
}

interface MultiAgentState {
  orders: Order[];
  activeOrder: Order | null;
  availableAgents: Agent[];
  socket: WebSocket | null;
  isConnected: boolean;
  reconnectAttempts: number;
  
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  setActiveOrder: (order: Order | null) => void;
  setAvailableAgents: (agents: Agent[]) => void;
  updateAgentLocation: (agentId: string, location: Coordinates) => void;
  connect: (wsUrl: string) => void;
  disconnect: () => void;
  sendMessage: (type: string, payload: unknown) => void;
}

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

export const useMultiAgentStore = create<MultiAgentState>((set, get) => ({
  orders: [],
  activeOrder: null,
  availableAgents: [],
  socket: null,
  isConnected: false,
  reconnectAttempts: 0,

  setOrders: (orders) => set({ orders }),

  addOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
    })),

  updateOrder: (id, updates) =>
    set((state) => {
      const orders = state.orders.map((o) =>
        o.id === id ? { ...o, ...updates, updatedAt: Date.now() } : o
      );
      const activeOrder =
        state.activeOrder?.id === id
          ? { ...state.activeOrder, ...updates, updatedAt: Date.now() }
          : state.activeOrder;
      return { orders, activeOrder };
    }),

  setActiveOrder: (order) => set({ activeOrder: order }),

  setAvailableAgents: (agents) => set({ availableAgents: agents }),

  updateAgentLocation: (agentId, location) =>
    set((state) => {
      const availableAgents = state.availableAgents.map((a) =>
        a.id === agentId ? { ...a, location } : a
      );

      let activeOrder = state.activeOrder;
      if (activeOrder?.assignedAgent?.id === agentId) {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          activeOrder.dropoffLocation.latitude,
          activeOrder.dropoffLocation.longitude
        );
        const eta = Math.round((distance / 30) * 60);
        activeOrder = {
          ...activeOrder,
          assignedAgent: { ...activeOrder.assignedAgent, location, eta },
          estimatedTime: eta,
        };
      }

      return { availableAgents, activeOrder };
    }),

  connect: (wsUrl) => {
    const state = get();
    if (state.socket?.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      set({ isConnected: true, reconnectAttempts: 0 });
      console.log("[MultiAgent] WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleSocketMessage(data, get, set);
      } catch (err) {
        console.warn("[MultiAgent] Failed to parse message:", err);
      }
    };

    socket.onerror = (error) => {
      console.error("[MultiAgent] WebSocket error:", error);
    };

    socket.onclose = () => {
      set({ isConnected: false, socket: null });
      console.log("[MultiAgent] WebSocket disconnected");

      const { reconnectAttempts } = get();
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          set({ reconnectAttempts: reconnectAttempts + 1 });
          get().connect(wsUrl);
        }, RECONNECT_DELAY * Math.pow(2, reconnectAttempts));
      }
    };

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, isConnected: false });
    }
  },

  sendMessage: (type, payload) => {
    const { socket } = get();
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, payload, timestamp: Date.now() }));
    }
  },
}));

function handleSocketMessage(
  data: { type: string; payload: unknown },
  get: () => MultiAgentState,
  set: (partial: Partial<MultiAgentState> | ((state: MultiAgentState) => Partial<MultiAgentState>)) => void
) {
  switch (data.type) {
    case "agent_location_update": {
      const payload = data.payload as { agentId: string; location: Coordinates };
      get().updateAgentLocation(payload.agentId, payload.location);
      break;
    }

    case "order_status_update": {
      const payload = data.payload as { orderId: string; status: OrderStatus };
      get().updateOrder(payload.orderId, { status: payload.status });
      break;
    }

    case "agent_assigned": {
      const payload = data.payload as { orderId: string; agent: Agent };
      get().updateOrder(payload.orderId, {
        assignedAgent: payload.agent,
        status: "assigned",
      });
      break;
    }

    case "agents_nearby": {
      const payload = data.payload as { agents: Agent[] };
      set({ availableAgents: payload.agents });
      break;
    }

    case "order_created": {
      const payload = data.payload as Order;
      get().addOrder(payload);
      break;
    }

    case "eta_update": {
      const payload = data.payload as { orderId: string; eta: number };
      get().updateOrder(payload.orderId, { estimatedTime: payload.eta });
      break;
    }

    default:
      console.log("[MultiAgent] Unknown message type:", data.type);
  }
}

export function getOrderStatusText(status: OrderStatus, type: OrderType): string {
  const statusTexts: Record<OrderType, Record<OrderStatus, string>> = {
    food: {
      pending: "Sipariş bekleniyor",
      confirmed: "Restoran onayladı",
      preparing: "Hazırlanıyor",
      ready: "Hazır",
      assigned: "Kurye atandı",
      picked_up: "Alındı",
      en_route: "Yolda",
      arriving: "Yaklaşıyor",
      delivered: "Teslim edildi",
      cancelled: "İptal edildi",
    },
    market: {
      pending: "Sipariş bekleniyor",
      confirmed: "Market onayladı",
      preparing: "Toplanıyor",
      ready: "Hazır",
      assigned: "Kurye atandı",
      picked_up: "Alındı",
      en_route: "Yolda",
      arriving: "Yaklaşıyor",
      delivered: "Teslim edildi",
      cancelled: "İptal edildi",
    },
    taxi: {
      pending: "Şoför aranıyor",
      confirmed: "Şoför bulundu",
      preparing: "Yola çıkıyor",
      ready: "Hazır",
      assigned: "Şoför atandı",
      picked_up: "Binildi",
      en_route: "Yolculuk başladı",
      arriving: "Yaklaşıyor",
      delivered: "Varıldı",
      cancelled: "İptal edildi",
    },
    delivery: {
      pending: "Kurye bekleniyor",
      confirmed: "Onaylandı",
      preparing: "Hazırlanıyor",
      ready: "Alıma hazır",
      assigned: "Kurye atandı",
      picked_up: "Alındı",
      en_route: "Yolda",
      arriving: "Yaklaşıyor",
      delivered: "Teslim edildi",
      cancelled: "İptal edildi",
    },
  };

  return statusTexts[type]?.[status] || status;
}

export function getOrderStatusColor(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "#9E9E9E";
    case "confirmed":
    case "preparing":
      return "#2196F3";
    case "ready":
    case "assigned":
      return "#FF9800";
    case "picked_up":
    case "en_route":
      return "#4CAF50";
    case "arriving":
      return "#8BC34A";
    case "delivered":
      return "#4CAF50";
    case "cancelled":
      return "#F44336";
    default:
      return "#9E9E9E";
  }
}

export function calculateOrderETA(
  order: Order,
  userLocation: Coordinates | null
): string {
  if (!order.assignedAgent?.location || !userLocation) {
    return order.estimatedTime ? formatETA(order.estimatedTime) : "Hesaplanıyor...";
  }

  const distance = calculateDistance(
    order.assignedAgent.location.latitude,
    order.assignedAgent.location.longitude,
    userLocation.latitude,
    userLocation.longitude
  );

  const avgSpeedKmh = order.type === "taxi" ? 35 : 25;
  const etaMinutes = (distance / avgSpeedKmh) * 60;

  return formatETA(etaMinutes);
}
