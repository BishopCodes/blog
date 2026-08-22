#!/usr/bin/env node
// Generates the easter-egg hex-dump background tiles used by
// src/components/hexdump.astro. The tiles are committed static assets so the
// pages only ship a few bytes of CSS; the browser fetches ONE small SVG
// (picked by viewport size / reduced-motion) and caches it instead of
// re-sending ~20 KB of inlined data URIs with every page.
//
// Run with: pnpm generate:hex  (or: node scripts/generate-hex-tile.mjs)
//
// Output:
//   public/hex-tile.svg              desktop tile, SMIL-animated (14 px)
//   public/hex-tile-still.svg        desktop tile, no animation (reduced motion)
//   public/hex-tile-mobile.svg       compact tile, SMIL-animated (11 px)
//   public/hex-tile-mobile-still.svg compact tile, no animation

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const HEX_ROWS = [
  ["0002AA30", ["20 1A A1 D8", "CB 51 07 24", "3B A0 5E 60", "4A DE A0 1F"]],
  ["0002AA40", ["35 CA 68 1D", "02 A1 2B C3", "CB 8A 09 DE", "28 AD 52 CC"]],
  ["0002AA50", ["7C 7C 30 9D", "9B 6F 59 25", "13 36 87 F0", "AA 98 EF E4"]],
  ["0002AA60", ["DF 97 9C 9F", "6D 7B F0 73", "0B 84 D4 7B", "D3 9A 5F 09"]],
  ["0002AA70", ["36 F0 42 60", "C1 85 17 0D", "33 15 C7 35", "49 94 9E AD"]],
  ["0002AA80", ["BC AC 64 94", "B9 B5 F1 8B", "3D 07 BC 40", "E8 C3 4E A0"]],
  ["0002AA90", ["8D EB F6 F9", "9C 15 44 88", "6D A1 2E 61", "48 6C 00 A0"]],
  ["0002AAA0", ["27 FE DD 65", "68 DB 13 3B", "D9 17 A9 AB", "9C 22 63 0B"]],
  ["0002AAB0", ["44 B8 65 B9", "60 D0 3F D6", "37 35 CC 72", "80 04 62 6A"]],
  ["0002AAC0", ["15 31 B6 E3", "FC ED 85 A3", "75 B4 41 56", "61 8A 2C C4"]],
  ["0002AAD0", ["81 90 E2 77", "31 A0 1C A3", "D6 83 2F C3", "50 ED 9F 11"]],
  ["0002AAE0", ["5C 5D 05 B3", "E7 BC C8 82", "1B F5 AE 58", "FB 47 8E 16"]],
  ["0002AAF0", ["2D 86 5A D4", "EC 78 C4 92", "13 96 05 4D", "AF 12 01 5F"]],
  ["0002AB00", ["82 07 AF E8", "51 07 AA 80", "2D 96 14 00", "79 96 BD 09"]],
  ["0002AB10", ["C5 C3 C0 02", "9A 9B 7A 48", "53 09 2D C0", "85 DB 7A D4"]],
  ["0002AB20", ["4C 20 B0 34", "7C 63 FF A6", "BC 05 09 36", "62 2C 54 E5"]],
  ["0002AB30", ["A7 56 0F 79", "C8 38 14 30", "AF E6 28 9D", "A1 C7 84 7B"]],
  ["0002AB40", ["86 37 20 6D", "D6 AD 4A 92", "A8 38 A6 A9", "72 0A 09 DC"]],
  ["0002AB50", ["9E 10 04 80", "9B E4 E3 58", "4B E7 8C FE", "12 61 FF E8"]],
  ["0002AB60", ["BE 5A A6 9F", "85 9F C8 4B", "99 7D 07 C4", "4C F7 7C 2D"]],
  ["0002AB70", ["0A D8"]],
];

const DURATIONS = [4.1, 4.7, 5.3, 5.8, 6.3];

const BYTES_PER_GROUP = 4; // "XX XX XX XX"
const ADDR_CHARS = 12; // "/.. " + 8-hex address
const GROUP_CHARS = 11; // "XX XX XX XX"
const PAD = 24; // old row padding: 1.5rem

// One tile per breakpoint. Values mirror the original CSS:
//   font-size: clamp(11px, 1.05vw, 14px)
//   .hexrow: width min(100%, 110ch), padding 0 1.5rem
//   line-height: calc(1.15em + 11px)
// Desktop keeps the exact metrics of the previously shipped 924 px tile; the
// compact tile reproduces the same formulas at the clamp() minimum (11 px).
const SIZES = [
  { file: "hex-tile", fontSize: 14, ch: 8.4, line: 27, baseY: 19 },
  { file: "hex-tile-mobile", fontSize: 11, ch: 6.6, line: 22.65, baseY: 15.07 },
];

// Mirrors the old flex `justify-content: space-between` per row: N items
// (address + N groups) leave N gaps, so the gap depends on how many groups
// the row has. Rows with fewer than 4 groups right-align (space-between with
// 2 items) instead of stretching.
const makeGroupX = (w, ch) => {
  return (slots, k) => {
    const gap =
      (w - PAD * 2 - ADDR_CHARS * ch - slots * GROUP_CHARS * ch) / slots;
    return PAD + ADDR_CHARS * ch + gap + k * (GROUP_CHARS * ch + gap);
  };
};

const tile = (size, animated) => {
  const { fontSize, ch, line, baseY } = size;
  const w = 110 * ch; // old `.hexrow` width cap: 110ch
  const groupX = makeGroupX(w, ch);

  const rows = HEX_ROWS.map(([addr, groups], i) => {
    const cells = groups.flatMap((g) => g.split(" "));
    const y = (i * line + baseY).toFixed(2);
    const tspans = [
      `<tspan x="${PAD}" fill="rgba(100,116,139,0.22)">/.. ${addr}</tspan>`,
      ...groups.map(
        (g, k) =>
          `<tspan x="${groupX(groups.length, k).toFixed(2)}">${g}</tspan>`,
      ),
    ].join("");

    let out = `<text y="${y}">${tspans}</text>`;

    // Same staggered "lit byte" recipe as before: one cell in every other row.
    if (animated && i % 2 === 0) {
      const lit = (i * 7) % cells.length;
      const byteX =
        groupX(groups.length, Math.floor(lit / BYTES_PER_GROUP)) +
        (lit % BYTES_PER_GROUP) * 3 * ch;

      out += `<text x="${byteX.toFixed(2)}" y="${y}" opacity="0" fill="rgba(203,213,225,0.9)">${cells[lit]}<animate attributeName="opacity" values="0;1;0" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1" begin="${((i * 0.6) % 4.2).toFixed(1)}s" dur="${DURATIONS[i % DURATIONS.length]}s" repeatCount="indefinite"/></text>`;
    }

    return out;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${(HEX_ROWS.length * line).toFixed(2)}" fill="rgba(148,163,184,0.16)" font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" font-size="${fontSize}">${rows}</svg>`;
};

for (const size of SIZES) {
  const entries = [
    [`${size.file}.svg`, true],
    [`${size.file}-still.svg`, false],
  ];

  for (const [file, animated] of entries) {
    const path = join(root, "public", file);
    writeFileSync(path, tile(size, animated));
    console.log(`wrote public/${file}`);
  }
}
