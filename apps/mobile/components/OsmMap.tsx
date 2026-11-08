import { useMemo } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { WebView } from "react-native-webview";

export type OsmMapMarker = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  selected?: boolean;
};

type Props = {
  markers: OsmMapMarker[];
  selectedId?: string | null;
  /** Başlangıç zoom — varsayılan şehir seviyesi */
  zoom?: number;
  onSelect?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * OpenStreetMap + Leaflet — Google API anahtarı gerektirmez.
 * Pin tıklanınca onSelect(id) çağrılır.
 */
export function OsmMap({ markers, selectedId, zoom = 13, onSelect, style }: Props) {
  const html = useMemo(
    () => buildHtml(markers, selectedId ?? null, zoom),
    [markers, selectedId, zoom],
  );

  return (
    <View style={[styles.root, style]}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.web}
        onMessage={(e) => {
          const id = e.nativeEvent.data?.trim();
          if (id && onSelect) onSelect(id);
        }}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        setSupportMultipleWindows={false}
        androidLayerType="hardware"
      />
    </View>
  );
}

function buildHtml(
  markers: OsmMapMarker[],
  selectedId: string | null,
  zoom: number,
): string {
  const payload = JSON.stringify(
    markers.map((m) => ({
      id: m.id,
      lat: m.lat,
      lng: m.lng,
      label: m.label,
      selected: m.id === selectedId || !!m.selected,
    })),
  );

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { margin:0; padding:0; height:100%; width:100%; background:#e8eef2; }
  .leaflet-control-zoom { margin-top: 72px !important; margin-left: 12px !important; }
  .price-pin {
    background:#0C2D29; color:#fff; font:600 11px/1.2 -apple-system,sans-serif;
    padding:5px 9px; border-radius:999px; border:2px solid #fff;
    box-shadow:0 2px 8px rgba(0,0,0,.28); white-space:nowrap;
  }
  .price-pin.on { background:#F36A1C; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var markers = ${payload};
  var zoom = ${zoom};
  var selectedId = ${JSON.stringify(selectedId)};
  var map = L.map('map', { zoomControl: true, attributionControl: true });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  markers.forEach(function (m) {
    var icon = L.divIcon({
      className: '',
      html: '<div class="price-pin' + (m.selected ? ' on' : '') + '">' + m.label + '</div>',
      iconSize: [90, 28],
      iconAnchor: [45, 14]
    });
    var marker = L.marker([m.lat, m.lng], { icon: icon });
    marker.on('click', function () {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(m.id);
      }
    });
    marker.addTo(map);
  });

  var focus = markers.find(function (m) { return m.id === selectedId; }) || markers[0];
  if (focus) {
    map.setView([focus.lat, focus.lng], zoom);
  } else {
    map.setView([36.1911, 44.0093], 12);
  }
</script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden", backgroundColor: "#e8eef2" },
  web: { flex: 1, backgroundColor: "transparent" },
});
