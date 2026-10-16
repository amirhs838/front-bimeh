import type { SVGProps } from "react";

/**
 * DESKTOP (>=1280) hero decoration — faint city skyline + clouds traced from
 * D1 (hero card is frame x60–1476, y91–363 → this viewBox is hero-local:
 * 1416 x 272, frame x minus 60, y minus 91).
 * Rendered stretched over the whole hero card, behind all content.
 * Stroke #C9D3E3 @ 1.2, very low contrast watermark feel.
 */

const S = "#C9D3E3";

export function HeroDecorDesktop(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1416 272"
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMax meet"
      {...props}
    >
      {/* ===================== LEFT CLUSTER (x25–215) ===================== */}
      <g stroke={S} strokeWidth="1.2" opacity="0.55">
        {/* needle antenna */}
        <path d="M45 213 L45 152 M41 165 L45 160 L49 165" />
        {/* low building */}
        <rect x="60" y="176" width="42" height="96" rx="4" fill="rgba(255,255,255,0.30)" />
        {/* dome building */}
        <path d="M104 272 L104 196 C104 187 109 181 118 181 C127 181 132 187 132 196 L132 272" />
        <path d="M110 196 L110 272 M126 196 L126 272" strokeWidth="0.9" opacity="0.8" />
        {/* tall rounded building with window grid */}
        <rect x="140" y="128" width="44" height="144" rx="18" fill="rgba(255,255,255,0.22)" />
        {/* tree (round canopy) */}
        <circle cx="196" cy="200" r="13" />
        <path d="M196 213 L196 258 M196 224 L189 217 M196 234 L203 227" strokeWidth="1" />
        {/* small tree left */}
        <circle cx="30" cy="234" r="10" />
        <path d="M30 244 L30 272 M30 252 L24 246" strokeWidth="1" />
      </g>
      {/* window dashes (left) */}
      <g stroke={S} strokeWidth="0.9" opacity="0.75">
        <path d="M66 190 L74 190 M80 190 L88 190 M66 202 L74 202 M80 202 L88 202 M66 214 L74 214 M80 214 L88 214 M66 226 L74 226 M80 226 L88 226 M66 238 L74 238 M80 238 L88 238" />
        <path d="M148 148 L154 148 M148 162 L154 162 M148 176 L154 176 M148 190 L154 190 M148 204 L154 204 M164 148 L170 148 M164 162 L170 162 M164 176 L170 176 M164 190 L170 190 M164 204 L170 204 M172 148 L178 148 M172 176 L178 176" />
        <path d="M112 210 L118 210 M112 224 L118 224 M112 238 L118 238" />
      </g>

      {/* ===================== CENTER CLUSTER (x600–915) ===================== */}
      <g stroke={S} strokeWidth="1.2" opacity="0.55">
        {/* tall stepped tower */}
        <path d="M718 88 L718 118 M714 118 L722 118" />
        <rect x="704" y="118" width="28" height="14" rx="2" />
        <rect x="698" y="132" width="40" height="140" fill="rgba(255,255,255,0.24)" />
        <path d="M706 150 L706 260 M716 150 L716 260 M726 150 L726 260" strokeWidth="0.9" opacity="0.8" />
        {/* mid building with round shoulder */}
        <path d="M628 272 L628 190 C628 180 634 173 644 173 C654 173 660 180 660 190 L660 272" fill="rgba(255,255,255,0.20)" />
        {/* wide building */}
        <rect x="664" y="158" width="32" height="114" rx="2" />
        {/* right building */}
        <rect x="742" y="176" width="46" height="96" rx="3" fill="rgba(255,255,255,0.28)" />
        {/* dome small building */}
        <path d="M794 272 L794 206 C794 197 799 191 808 191 C817 191 822 197 822 206 L822 272" />
        {/* slender antenna building */}
        <path d="M836 272 L836 168 L856 168 L856 272 M846 168 L846 158" />
        {/* trees */}
        <circle cx="726" cy="222" r="14" />
        <path d="M726 236 L726 272 M726 246 L718 238 M726 252 L734 244" strokeWidth="1" />
        <circle cx="666" cy="240" r="11" />
        <path d="M666 251 L666 272" strokeWidth="1" />
        <circle cx="878" cy="238" r="12" />
        <path d="M878 250 L878 272 M878 256 L871 249" strokeWidth="1" />
      </g>
      {/* window dashes (center) */}
      <g stroke={S} strokeWidth="0.9" opacity="0.75">
        <path d="M670 172 L688 172 M670 184 L688 184 M670 196 L688 196 M670 208 L688 208 M670 220 L688 220" />
        <path d="M748 190 L760 190 M764 190 L776 190 M748 202 L760 202 M764 202 L776 202 M748 214 L760 214 M764 214 L776 214 M748 226 L760 226 M764 226 L776 226 M748 238 L760 238 M764 238 L776 238" />
        <path d="M800 212 L806 212 M800 226 L806 226 M800 240 L806 240" />
        <path d="M840 180 L852 180 M840 194 L852 194 M840 208 L852 208" />
      </g>

      {/* ===================== RIGHT CLUSTER (x1120–1415) ===================== */}
      <g stroke={S} strokeWidth="1.2" opacity="0.55">
        {/* tall tower with antenna */}
        <path d="M1305 75 L1305 106 M1301 106 L1309 106" />
        <rect x="1288" y="106" width="34" height="166" rx="2" fill="rgba(255,255,255,0.26)" />
        <path d="M1296 122 L1296 258 M1314 122 L1314 258" strokeWidth="0.9" opacity="0.8" />
        {/* left mid building (rounded top) */}
        <rect x="1122" y="146" width="38" height="126" rx="8" fill="rgba(255,255,255,0.22)" />
        {/* dome building */}
        <path d="M1164 272 L1164 190 C1164 179 1171 172 1182 172 C1193 172 1200 179 1200 190 L1200 272" fill="rgba(255,255,255,0.28)" />
        {/* wide building */}
        <rect x="1204" y="182" width="56" height="90" rx="3" />
        {/* antenna needle */}
        <path d="M1345 272 L1345 190 M1341 202 L1345 197 L1349 202" />
        {/* trees */}
        <circle cx="1348" cy="206" r="13" />
        <path d="M1348 219 L1348 260 M1348 230 L1341 223" strokeWidth="1" />
        <circle cx="1382" cy="234" r="11" />
        <path d="M1382 245 L1382 272" strokeWidth="1" />
        <circle cx="1120" cy="238" r="10" />
        <path d="M1120 248 L1120 272" strokeWidth="1" />
      </g>
      {/* window dashes (right) */}
      <g stroke={S} strokeWidth="0.9" opacity="0.75">
        <path d="M1128 162 L1138 162 M1142 162 L1152 162 M1128 176 L1138 176 M1142 176 L1152 176 M1128 190 L1138 190 M1142 190 L1152 190 M1128 204 L1138 204 M1142 204 L1152 204" />
        <path d="M1172 190 L1178 190 M1184 190 L1190 190 M1172 204 L1178 204 M1184 204 L1190 204 M1172 218 L1178 218 M1184 218 L1190 218" />
        <path d="M1212 196 L1226 196 M1230 196 L1244 196 M1212 208 L1226 208 M1230 208 L1244 208 M1212 220 L1226 220 M1230 220 L1244 220" />
        <path d="M1292 130 L1304 130 M1308 130 L1320 130 M1292 144 L1304 144 M1308 144 L1320 144" />
      </g>

      {/* ===================== CLOUDS ===================== */}
      <g stroke={S} strokeWidth="1.2" opacity="0.7" fill="rgba(255,255,255,0.45)">
        <path d="M62 88 C50 88 44 81 44 74 C44 66 51 60 59 61 C61 52 70 46 80 47 C89 47.8 96 53 98 60 C107 59 114 65 114 73 C114 81 108 88 99 88 Z" />
        <path d="M826 80 C816 80 811 74 811 68 C811 61 817 56 824 57 C826 50 833 45 841 46 C848 46.6 854 51 855 57 C862 56 868 61 868 68 C868 74 863 80 856 80 Z" />
      </g>
    </svg>
  );
}
