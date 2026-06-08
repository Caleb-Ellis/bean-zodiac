// Generate the Rorschach blot SVGs (the live-filter source). These are NOT used
// as masks directly — at mobile mask sizes the filter collapses the ink-splat to
// a blob. After changing anything here, re-bake the high-res PNG masks the app
// actually consumes: `pnpm blots` runs both steps (build then bake). The bake is
// slow (~13 min, 360 headless-Chrome shots) so it's manual, not in the build.
import { readdirSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const FLAVOUR_EMOJI = {
  bitter: "☕",
  sour: "🍋",
  spicy: "🌶️",
  sweet: "🍭",
  umami: "🍄",
};

const FORM_EMOJI = {
  boiled: "💧",
  dried: "☀️",
  fermented: "🦠",
  fried: "🔥",
  roasted: "♨️",
  smoked: "💨",
};

const h32 = (s) => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
};

const SIZE = 256;
const HALF = SIZE / 2;
// Crop the viewBox tighter than SIZE — elements cluster near HALF, so the
// outer margins of the canvas are mostly empty.
const PAD = 28;
const VIEW = SIZE - PAD * 2;
// Intrinsic raster size, decoupled from the viewBox. The SVG carries a filter
// chain, so the browser rasterizes it to an alpha bitmap at this pixel size
// before scaling into the mask box. Large enough that a ~144px CSS box on a 3×
// DPR phone downscales (sharp) rather than upscales a small buffer (blurry).
const RASTER = 600;

function buildSvg(slug, bean, flavour, form) {
  const seed = h32(slug);
  const baseFreq = (0.022 + (seed % 100) / 3500).toFixed(4);
  const scale = 32 + ((seed >>> 7) % 20);
  const blur = (0.6 + ((seed >>> 13) % 12) / 20).toFixed(2);
  const turbSeed = seed % 9999;
  // Edge bleed: a small extra displacement just for the ragged capillary wisps.
  const edgeScale = 6 + ((seed >>> 20) % 6);

  const fEm = FLAVOUR_EMOJI[flavour];
  const formEm = FORM_EMOJI[form];

  // Asymmetric placement (relative to right half of the blot).
  // Each tweak is seeded so different slugs cluster differently.
  // Six layout archetypes — different vertical orderings + horizontal offsets
  // for the three elements (bean, flavour emoji, form emoji). The half is the
  // right side of the blot; x is measured leftward from HALF (smaller x =
  // closer to the mirror seam).
  //
  // Each slot: [xOffsetFromHalf, yFromHalf, sizeBase]
  const phase = (seed >>> 21) % 6;
  const SLOTS = [
    // [bean, flavour, form] for each phase
    [[-14, -8, 1.25], [4, -38, 80], [-2, 36, 72]],  // bean middle, flavour top, form bottom
    [[-10, 24, 1.30], [2, -30, 78], [-8, -2, 68]],  // bean low, flavour high, form mid
    [[-18, -2, 1.40], [-4, 42, 76], [6, -40, 78]],  // bean center, form top, flavour bottom
    [[-6, 30, 1.20], [-14, -34, 84], [10, 2, 64]],  // bean low-near, flavour high-far, form mid-near
    [[-22, 4, 1.35], [8, 38, 74], [-4, -36, 82]],   // bean center-far, form top, flavour low
    [[-2, -16, 1.30], [-16, 28, 80], [12, -2, 70]], // bean upper-near, flavour low-far, form mid-near
  ];
  const [[bx, by, bs], [fx, fy, fs], [mx, my, ms]] = SLOTS[phase];

  // Pull the three elements closer together on average by contracting their
  // offsets (and the seeded jitter) toward the blot centre. 1.0 = original
  // spread; lower = tighter clustering.
  const TIGHTEN = 0.9;
  const jx = (j) => Math.round(j * TIGHTEN);

  const beanRot = ((seed >>> 3) % 80) - 40;
  const beanCx = HALF + bx * TIGHTEN + jx((seed >>> 5) % 14);
  const beanCy = HALF + by * TIGHTEN + jx((seed >>> 9) % 18);
  const beanScale = (bs + ((seed >>> 11) % 25) / 100).toFixed(2);

  const fCx = HALF + fx * TIGHTEN + jx((seed >>> 6) % 18);
  const fCy = HALF + fy * TIGHTEN + jx((seed >>> 10) % 16);
  const fRot = ((seed >>> 12) % 60) - 30;
  const fSize = fs + ((seed >>> 14) % 20);

  const formCx = HALF + mx * TIGHTEN + jx((seed >>> 8) % 20);
  const formCy = HALF + my * TIGHTEN + jx((seed >>> 15) % 16);
  const formRot = ((seed >>> 17) % 90) - 45;
  const formSize = ms + ((seed >>> 19) % 18);

  // The right half — bean image + two emojis — composed then mirrored.
  // Bean image refs the webp from public/images/ at runtime via xlink href.
  const beanHref = `/images/${bean}.svg`;
  const beanImgSize = SIZE * Number(beanScale);
  const beanX = beanCx - beanImgSize / 2;
  const beanY = beanCy - beanImgSize / 2;

  const halfGroup = `
    <g>
      <image href="${beanHref}" x="${beanX.toFixed(2)}" y="${beanY.toFixed(2)}" width="${beanImgSize.toFixed(2)}" height="${beanImgSize.toFixed(2)}" transform="rotate(${beanRot} ${beanCx} ${beanCy})" />
      <text x="${fCx}" y="${fCy}" font-size="${fSize}" text-anchor="middle" dominant-baseline="central" transform="rotate(${fRot} ${fCx} ${fCy})">${fEm}</text>
      <text x="${formCx}" y="${formCy}" font-size="${formSize}" text-anchor="middle" dominant-baseline="central" transform="rotate(${formRot} ${formCx} ${formCy})">${formEm}</text>
    </g>`;

  // Two independent 50/50 transforms, seeded so each slug is stable across
  // rebuilds. The vertical flip is applied to the fully composed blot and
  // turns the whole composition upside down. The 90° rotation is applied
  // *inside* the filter, before the displacement distortion, so the noise
  // warps the rotated composition rather than rotating an already-warped blot.
  const flipV = ((seed >>> 24) & 1) === 1;
  const rot90 = ((seed >>> 23) & 1) === 1;
  const sy = flipV ? -1 : 1;
  const ty = flipV ? SIZE : 0;
  // rotate(90) about the canvas centre, expressed as a matrix so it's a single
  // pre-distortion transform on the filtered group.
  const rotTransform = rot90 ? ` transform="rotate(90 ${HALF} ${HALF})"` : "";

  // Filter chain: warp the silhouette by the noise (the swirl), blur, ink it a
  // flat near-black, then a higher-frequency displacement throws thin capillary
  // wisps off the outline (ragged bleed edges). A steep linear alpha ramp at the
  // end maps the blurred-alpha falloff to a hard cliff — crisp ink edge while
  // keeping the ragged silhouette — so it stays sharp when scaled on mobile.
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${PAD} ${PAD} ${VIEW} ${VIEW}" width="${RASTER}" height="${RASTER}">
  <defs>
    <filter id="blot" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
      <feTurbulence type="turbulence" baseFrequency="${baseFreq}" numOctaves="2" seed="${turbSeed}" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="warped" />
      <feGaussianBlur in="warped" stdDeviation="${blur}" result="blurred" />
      <feColorMatrix in="blurred" type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 0 0.06  0 0 0 1 0" result="inked" />
      <feDisplacementMap in="inked" in2="noise" scale="${edgeScale}" xChannelSelector="G" yChannelSelector="R" result="ragged" />
      <feGaussianBlur in="ragged" stdDeviation="0.6" result="raggedBlur" />
      <feComponentTransfer in="raggedBlur">
        <feFuncA type="linear" slope="6" intercept="-2.0" />
      </feComponentTransfer>
    </filter>
  </defs>
  <g transform="translate(0 ${ty}) scale(1 ${sy})">
    <g filter="url(#blot)">
      <g${rotTransform}>
        ${halfGroup}
        <g transform="translate(${SIZE} 0) scale(-1 1)">
          ${halfGroup}
        </g>
      </g>
    </g>
  </g>
</svg>
`;
}

function readZodiacSlugs() {
  const dir = resolve(root, "src/content/zodiacs");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !/^[A-Z]/.test(f))
    .map((f) => {
      const { data } = matter(readFileSync(resolve(dir, f), "utf8"));
      return { slug: data.slug, bean: data.bean, flavour: data.flavour, form: data.form };
    });
}

const outDir = resolve(root, "public/images/rorschach");
mkdirSync(outDir, { recursive: true });

const zodiacs = readZodiacSlugs();
for (const { slug, bean, flavour, form } of zodiacs) {
  const svg = buildSvg(slug, bean, flavour, form);
  writeFileSync(resolve(outDir, `${slug}.svg`), svg);
}

console.log(`Built ${zodiacs.length} Rorschach blots`);
