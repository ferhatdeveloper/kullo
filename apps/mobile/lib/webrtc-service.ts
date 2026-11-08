import { create } from "zustand";

export type CallType = "audio" | "video";
export type CallStatus =
  | "idle"
  | "calling"
  | "ringing"
  | "connecting"
  | "connected"
  | "ended"
  | "failed"
  | "busy";

export interface Peer {
  id: string;
  name: string;
  avatar?: string;
}

export interface CallSession {
  id: string;
  type: CallType;
  peer: Peer;
  status: CallStatus;
  startedAt?: number;
  endedAt?: number;
  duration?: number;
  isInitiator: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerOn: boolean;
}

interface WebRTCState {
  currentCall: CallSession | null;
  callHistory: CallSession[];
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  socket: WebSocket | null;
  isConnected: boolean;

  startCall: (peer: Peer, type: CallType) => Promise<void>;
  acceptCall: (callId: string) => Promise<void>;
  rejectCall: (callId: string) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleSpeaker: () => void;
  connect: (wsUrl: string) => void;
  disconnect: () => void;
}

const SIGNALING_URL = "wss://kullo-signaling.example.com";

export const useWebRTC = create<WebRTCState>((set, get) => ({
  currentCall: null,
  callHistory: [],
  localStream: null,
  remoteStream: null,
  socket: null,
  isConnected: false,

  startCall: async (peer, type) => {
    const callId = `call-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const call: CallSession = {
      id: callId,
      type,
      peer,
      status: "calling",
      isInitiator: true,
      isMuted: false,
      isVideoEnabled: type === "video",
      isSpeakerOn: false,
    };

    set({ currentCall: call });

    try {
      setTimeout(() => {
        set((state) => ({
          currentCall: state.currentCall
            ? { ...state.currentCall, status: "connecting" }
            : null,
        }));

        setTimeout(() => {
          set((state) => ({
            currentCall: state.currentCall
              ? {
                  ...state.currentCall,
                  status: "connected",
                  startedAt: Date.now(),
                }
              : null,
          }));
        }, 1500);
      }, 2000);
    } catch (error) {
      set((state) => ({
        currentCall: state.currentCall
          ? { ...state.currentCall, status: "failed" }
          : null,
      }));
    }
  },

  acceptCall: async (callId) => {
    set((state) => ({
      currentCall: state.currentCall
        ? { ...state.currentCall, status: "connecting" }
        : null,
    }));

    setTimeout(() => {
      set((state) => ({
        currentCall: state.currentCall
          ? {
              ...state.currentCall,
              status: "connected",
              startedAt: Date.now(),
            }
          : null,
      }));
    }, 1000);
  },

  rejectCall: (callId) => {
    const { currentCall } = get();
    if (currentCall?.id === callId) {
      set((state) => ({
        currentCall: null,
        callHistory: [
          ...state.callHistory,
          { ...currentCall, status: "ended", endedAt: Date.now() },
        ],
      }));
    }
  },

  endCall: () => {
    const { currentCall, localStream, remoteStream } = get();
    
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }

    if (currentCall) {
      const duration = currentCall.startedAt
        ? Math.floor((Date.now() - currentCall.startedAt) / 1000)
        : 0;

      set((state) => ({
        currentCall: null,
        localStream: null,
        remoteStream: null,
        callHistory: [
          ...state.callHistory,
          {
            ...currentCall,
            status: "ended",
            endedAt: Date.now(),
            duration,
          },
        ],
      }));
    }
  },

  toggleMute: () => {
    set((state) => ({
      currentCall: state.currentCall
        ? { ...state.currentCall, isMuted: !state.currentCall.isMuted }
        : null,
    }));
  },

  toggleVideo: () => {
    set((state) => ({
      currentCall: state.currentCall
        ? {
            ...state.currentCall,
            isVideoEnabled: !state.currentCall.isVideoEnabled,
          }
        : null,
    }));
  },

  toggleSpeaker: () => {
    set((state) => ({
      currentCall: state.currentCall
        ? { ...state.currentCall, isSpeakerOn: !state.currentCall.isSpeakerOn }
        : null,
    }));
  },

  connect: (wsUrl) => {
    const { socket } = get();
    if (socket?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      set({ isConnected: true });
      console.log("[WebRTC] Signaling connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleSignalingMessage(data, get, set);
      } catch (err) {
        console.warn("[WebRTC] Failed to parse signaling message:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("[WebRTC] Signaling error:", error);
    };

    ws.onclose = () => {
      set({ isConnected: false, socket: null });
      console.log("[WebRTC] Signaling disconnected");
    };

    set({ socket: ws });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, isConnected: false });
    }
  },
}));

function handleSignalingMessage(
  data: { type: string; payload: unknown },
  get: () => WebRTCState,
  set: (partial: Partial<WebRTCState> | ((state: WebRTCState) => Partial<WebRTCState>)) => void
) {
  switch (data.type) {
    case "incoming_call": {
      const payload = data.payload as {
        callId: string;
        peer: Peer;
        type: CallType;
      };

      const call: CallSession = {
        id: payload.callId,
        type: payload.type,
        peer: payload.peer,
        status: "ringing",
        isInitiator: false,
        isMuted: false,
        isVideoEnabled: payload.type === "video",
        isSpeakerOn: false,
      };

      set({ currentCall: call });
      break;
    }

    case "call_accepted": {
      set((state) => ({
        currentCall: state.currentCall
          ? { ...state.currentCall, status: "connecting" }
          : null,
      }));
      break;
    }

    case "call_rejected":
    case "call_ended": {
      get().endCall();
      break;
    }

    case "offer":
    case "answer":
    case "ice_candidate": {
      console.log("[WebRTC] Received:", data.type);
      break;
    }

    default:
      console.log("[WebRTC] Unknown signaling message:", data.type);
  }
}

export function formatCallDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function getCallStatusText(status: CallStatus): string {
  switch (status) {
    case "idle":
      return "";
    case "calling":
      return "Aranıyor...";
    case "ringing":
      return "Çalıyor...";
    case "connecting":
      return "Bağlanıyor...";
    case "connected":
      return "Bağlandı";
    case "ended":
      return "Sonlandırıldı";
    case "failed":
      return "Başarısız";
    case "busy":
      return "Meşgul";
    default:
      return "";
  }
}
