/** Market = ink ağır + flame aksan. MARKER: market-ink-heavy-2026-11-05 */
import { colors as kullo, radius as kulloRadius, shadow as kulloShadow, space as kulloSpace } from "../../lib/theme";
export const colors = {
  red: kullo.flame, redDark: kullo.flameDeep, redDeep: kullo.flameDeep, redSoft: kullo.flameSoft,
  yellow: kullo.flameMid, yellowDark: kullo.flameDeep, yellowSoft: kullo.flameSoft,
  orange: kullo.flame, orangeDark: kullo.flameDeep, orangeSoft: kullo.flameSoft,
  slate: kullo.inkMuted, open: kullo.ink, openBg: kullo.brandSoft, blue: kullo.ink, blueSoft: kullo.mist,
  ink: kullo.ink, muted: kullo.inkFaint, line: kullo.line, bg: kullo.paper, mist: kullo.mist,
  card: kullo.white, busy: kullo.flameDeep, busyBg: kullo.flameSoft, white: kullo.white,
  flame: kullo.flame, flameDeep: kullo.flameDeep, flameSoft: kullo.flameSoft,
};
export const radius = { sm: kulloRadius.sm, md: kulloRadius.md, lg: kulloRadius.lg, xl: kulloRadius.xl, pill: kulloRadius.pill };
export const radiusSm = radius.sm; export const radiusLg = radius.lg; export const radiusPill = radius.pill;
export const space = { xxs: 2, xs: kulloSpace.xs, sm: kulloSpace.sm, md: kulloSpace.md, lg: kulloSpace.lg, xl: kulloSpace.xl, xxl: kulloSpace.xxl, xxxl: 32 };
export const shadow = kulloShadow;
