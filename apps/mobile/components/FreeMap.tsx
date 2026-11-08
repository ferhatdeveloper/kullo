import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

import { Agent, Coordinates } from "../lib/live-location";
import { colors } from "../lib/theme";

interface Marker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  icon?: "user" | "driver" | "courier" | "delivery" | "destination" | "pickup";
  color?: string;
  rotation?: number;
}

interface RoutePoint {
  latitude: number;
  longitude: number;
}

interface FreeMapProps {
  style?: ViewStyle;
  center?: Coordinates;
  zoom?: number;
  markers?: Marker[];
  agents?: Agent[];
  route?: RoutePoint[];
  routeColor?: string;
  showUserLocation?: boolean;
  userLocation?: Coordinates | null;
  onMapReady?: () => void;
  onMarkerPress?: (markerId: string) => void;
  onMapPress?: (coords: Coordinates) => void;
  interactive?: boolean;
}

const MARKER_ICONS: Record<string, string> = {
  user: `<svg viewBox="0 0 24 24" fill="#2196F3" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>`,
  driver: `<svg viewBox="0 0 24 24" fill="#4CAF50"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`,
  courier: `<svg viewBox="0 0 24 24" fill="#FF9800"><path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.48L19 10.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1z"/><path d="M5 6h5v2H5zm14 7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>`,
  delivery: `<svg viewBox="0 0 24 24" fill="#E91E63"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/></svg>`,
  destination: `<svg viewBox="0 0 24 24" fill="#F44336"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  pickup: `<svg viewBox="0 0 24 24" fill="#4CAF50"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
};

function generateMapHTML(props: {
  center: Coordinates;
  zoom: number;
  markers: Marker[];
  route?: RoutePoint[];
  routeColor: string;
  interactive: boolean;
}): string {
  const { center, zoom, markers, route, routeColor, interactive } = props;

  const markersJS = markers
    .map((m) => {
      const iconSvg = MARKER_ICONS[m.icon || "user"] || MARKER_ICONS.user;
      const color = m.color || "#2196F3";
      const coloredIcon = iconSvg.replace(/fill="[^"]*"/, `fill="${color}"`);
      const encodedIcon = encodeURIComponent(coloredIcon);
      const rotation = m.rotation || 0;

      return `
        var icon${m.id} = L.divIcon({
          html: '<div style="transform: rotate(${rotation}deg); width: 32px; height: 32px;"><img src="data:image/svg+xml,${encodedIcon}" style="width: 100%; height: 100%;"/></div>',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          className: 'custom-marker'
        });
        var marker${m.id} = L.marker([${m.latitude}, ${m.longitude}], { icon: icon${m.id} })
          .addTo(map)
          .bindPopup('${m.title || ""}');
        marker${m.id}.on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerPress', id: '${m.id}' }));
        });
      `;
    })
    .join("\n");

  const routeJS = route
    ? `
      var routeCoords = [${route.map((p) => `[${p.latitude}, ${p.longitude}]`).join(",")}];
      var polyline = L.polyline(routeCoords, { color: '${routeColor}', weight: 4, opacity: 0.8 }).addTo(map);
    `
    : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #map { width: 100%; height: 100%; }
        .custom-marker { background: transparent !important; border: none !important; }
        .leaflet-control-attribution { display: none; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: ${interactive},
          dragging: ${interactive},
          touchZoom: ${interactive},
          scrollWheelZoom: ${interactive},
          doubleClickZoom: ${interactive},
          boxZoom: ${interactive}
        }).setView([${center.latitude}, ${center.longitude}], ${zoom});

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        ${markersJS}
        ${routeJS}

        map.on('click', function(e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapPress',
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
          }));
        });

        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));

        window.updateMarker = function(id, lat, lng, rotation) {
          if (window['marker' + id]) {
            window['marker' + id].setLatLng([lat, lng]);
            if (rotation !== undefined) {
              var icon = window['marker' + id].getIcon();
              var html = icon.options.html.replace(/rotate\\([^)]*\\)/, 'rotate(' + rotation + 'deg)');
              icon.options.html = html;
              window['marker' + id].setIcon(icon);
            }
          }
        };

        window.centerMap = function(lat, lng, zoom) {
          map.setView([lat, lng], zoom || map.getZoom());
        };

        window.fitBounds = function(coords) {
          if (coords.length > 0) {
            map.fitBounds(coords, { padding: [50, 50] });
          }
        };
      </script>
    </body>
    </html>
  `;
}

export function FreeMap({
  style,
  center = { latitude: 36.1901, longitude: 44.0091, timestamp: Date.now() },
  zoom = 14,
  markers = [],
  agents = [],
  route,
  routeColor = colors.flame,
  showUserLocation = true,
  userLocation,
  onMapReady,
  onMarkerPress,
  onMapPress,
  interactive = true,
}: FreeMapProps) {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  const allMarkers: Marker[] = [
    ...markers,
    ...agents.map((agent) => ({
      id: agent.id,
      latitude: agent.location.latitude,
      longitude: agent.location.longitude,
      title: agent.name,
      icon: agent.type as Marker["icon"],
      rotation: agent.location.heading,
    })),
  ];

  if (showUserLocation && userLocation) {
    allMarkers.push({
      id: "user-location",
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      title: "Konumunuz",
      icon: "user",
    });
  }

  const html = generateMapHTML({
    center: userLocation || center,
    zoom,
    markers: allMarkers,
    route,
    routeColor,
    interactive,
  });

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case "mapReady":
          setIsLoading(false);
          onMapReady?.();
          break;
        case "markerPress":
          onMarkerPress?.(data.id);
          break;
        case "mapPress":
          onMapPress?.({
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: Date.now(),
          });
          break;
      }
    } catch (err) {
      console.warn("Map message parse error:", err);
    }
  };

  useEffect(() => {
    if (!webViewRef.current || isLoading) return;

    agents.forEach((agent) => {
      webViewRef.current?.injectJavaScript(`
        if (window.updateMarker) {
          window.updateMarker(
            '${agent.id}',
            ${agent.location.latitude},
            ${agent.location.longitude},
            ${agent.location.heading || 0}
          );
        }
        true;
      `);
    });
  }, [agents, isLoading]);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        onMessage={handleMessage}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
      />
      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.flame} />
        </View>
      )}
    </View>
  );
}

export function centerMapOn(
  webViewRef: React.RefObject<WebView>,
  latitude: number,
  longitude: number,
  zoom?: number
) {
  webViewRef.current?.injectJavaScript(`
    if (window.centerMap) {
      window.centerMap(${latitude}, ${longitude}, ${zoom || "null"});
    }
    true;
  `);
}

export function fitMapBounds(
  webViewRef: React.RefObject<WebView>,
  coords: Array<{ latitude: number; longitude: number }>
) {
  const boundsStr = coords.map((c) => `[${c.latitude}, ${c.longitude}]`).join(",");
  webViewRef.current?.injectJavaScript(`
    if (window.fitBounds) {
      window.fitBounds([${boundsStr}]);
    }
    true;
  `);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: colors.mist,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.mist,
  },
});
