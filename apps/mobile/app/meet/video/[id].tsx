import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  PhoneOff,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  formatCallDuration,
  getCallStatusText,
  useWebRTC,
} from "../../../lib/webrtc-service";
import { colors, fonts, radius, space } from "../../../lib/theme";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function VideoMeetScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    type?: "audio" | "video";
  }>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    currentCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    endCall,
  } = useWebRTC();

  const peerName =
    (Array.isArray(params.name) ? params.name[0] : params.name) ||
    currentCall?.peer.name ||
    "Kullanıcı";

  const callType = params.type || currentCall?.type || "video";
  const [seconds, setSeconds] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [localCameraFront, setLocalCameraFront] = useState(true);
  const pulse = useRef(new Animated.Value(1)).current;
  const localVideoScale = useRef(new Animated.Value(1)).current;

  const isMuted = currentCall?.isMuted ?? false;
  const isVideoEnabled = currentCall?.isVideoEnabled ?? callType === "video";
  const isSpeakerOn = currentCall?.isSpeakerOn ?? false;

  useEffect(() => {
    const connectTimer = setTimeout(() => setIsConnecting(false), 2000);
    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    if (isConnecting) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isConnecting]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    if (isConnecting) loop.start();
    return () => loop.stop();
  }, [pulse, isConnecting]);

  const handleEndCall = () => {
    endCall();
    router.back();
  };

  const flipCamera = () => {
    Animated.sequence([
      Animated.timing(localVideoScale, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(localVideoScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setLocalCameraFront(!localCameraFront);
  };

  const statusText = isConnecting
    ? getCallStatusText(currentCall?.status || "connecting")
    : formatCallDuration(seconds);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {callType === "video" && isVideoEnabled ? (
        <View style={styles.remoteVideo}>
          <View style={styles.videoPlaceholder}>
            <Text style={styles.videoInitial}>{peerName.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.audioBackground}>
          <Animated.View
            style={[styles.audioPulse, { transform: [{ scale: pulse }] }]}
          />
          <View style={styles.audioAvatar}>
            <Text style={styles.audioInitial}>{peerName.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
      )}

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.peerName}>{peerName}</Text>
          <Text style={styles.statusText}>{statusText}</Text>
          {callType === "video" && (
            <View style={styles.callTypeBadge}>
              <Camera size={12} color={colors.white} strokeWidth={2.2} />
              <Text style={styles.callTypeText}>{t("meet.videoCall")}</Text>
            </View>
          )}
        </View>
      </View>

      {callType === "video" && isVideoEnabled && (
        <Animated.View
          style={[
            styles.localVideo,
            {
              bottom: 200 + insets.bottom,
              transform: [{ scale: localVideoScale }],
            },
          ]}
        >
          <View style={styles.localVideoPlaceholder}>
            <Text style={styles.localVideoText}>
              {localCameraFront ? t("meet.frontCamera") : t("meet.backCamera")}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.flipBtn}
            onPress={flipCamera}
            activeOpacity={0.85}
          >
            <RotateCcw size={16} color={colors.white} strokeWidth={2.2} />
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={[styles.controls, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
            onPress={toggleMute}
            activeOpacity={0.85}
          >
            {isMuted ? (
              <MicOff size={22} color={colors.white} strokeWidth={2.2} />
            ) : (
              <Mic size={22} color={colors.ink} strokeWidth={2.2} />
            )}
            <Text style={[styles.controlLabel, isMuted && styles.controlLabelActive]}>
              {isMuted ? t("meet.unmute") : t("meet.mute")}
            </Text>
          </TouchableOpacity>

          {callType === "video" && (
            <TouchableOpacity
              style={[styles.controlBtn, !isVideoEnabled && styles.controlBtnActive]}
              onPress={toggleVideo}
              activeOpacity={0.85}
            >
              {isVideoEnabled ? (
                <Camera size={22} color={colors.ink} strokeWidth={2.2} />
              ) : (
                <CameraOff size={22} color={colors.white} strokeWidth={2.2} />
              )}
              <Text
                style={[
                  styles.controlLabel,
                  !isVideoEnabled && styles.controlLabelActive,
                ]}
              >
                {isVideoEnabled ? t("meet.cameraOn") : t("meet.cameraOff")}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.endCallBtn}
            onPress={handleEndCall}
            activeOpacity={0.9}
          >
            <PhoneOff size={26} color={colors.white} strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, isSpeakerOn && styles.controlBtnActive]}
            onPress={toggleSpeaker}
            activeOpacity={0.85}
          >
            {isSpeakerOn ? (
              <Volume2 size={22} color={colors.white} strokeWidth={2.2} />
            ) : (
              <VolumeX size={22} color={colors.ink} strokeWidth={2.2} />
            )}
            <Text
              style={[styles.controlLabel, isSpeakerOn && styles.controlLabelActive]}
            >
              {isSpeakerOn ? t("meet.speakerOn") : t("meet.speakerOff")}
            </Text>
          </TouchableOpacity>

          {callType === "audio" && <View style={styles.controlBtnPlaceholder} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  remoteVideo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },
  videoPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
  },
  videoInitial: {
    fontFamily: fonts.display,
    fontSize: 64,
    color: colors.white,
  },
  audioBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  audioPulse: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,106,0,0.15)",
  },
  audioAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.flame,
    alignItems: "center",
    justifyContent: "center",
  },
  audioInitial: {
    fontFamily: fonts.display,
    fontSize: 56,
    color: colors.white,
  },
  header: {
    paddingHorizontal: space.lg,
  },
  headerContent: {
    alignItems: "center",
    gap: 4,
  },
  peerName: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.white,
  },
  statusText: {
    fontFamily: fonts.bodyMed,
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 0.5,
  },
  callTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,106,0,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginTop: 8,
  },
  callTypeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: colors.white,
  },
  localVideo: {
    position: "absolute",
    right: 16,
    width: 100,
    height: 140,
    borderRadius: radius.md,
    backgroundColor: "#2a2a2a",
    overflow: "hidden",
  },
  localVideoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  localVideoText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
  },
  flipBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.lg,
  },
  controlBtn: {
    width: 64,
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: 12,
  },
  controlBtnActive: {
    backgroundColor: colors.flameDeep,
  },
  controlBtnPlaceholder: {
    width: 64,
  },
  controlLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 10,
    color: colors.ink,
  },
  controlLabelActive: {
    color: colors.white,
  },
  endCallBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
});
