export function FormFilters() {
  return (
    <svg style={{ display: "none" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="form-roasted-filter" colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            result="baseTinted"
            values="1.04 0 0 0 0.01  0 0.95 0 0 0  0 0 0.78 0 0  0 0 0 1 0"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.08"
            numOctaves={2}
            seed={42}
            result="crackNoise"
          />
          <feGaussianBlur in="crackNoise" stdDeviation={1.5} result="crackNoise" />
          <feColorMatrix in="crackNoise" type="saturate" values="0" result="crackNoise" />
          <feComponentTransfer in="crackNoise" result="crackle">
            <feFuncR type="linear" slope={0.1} intercept={0.9} />
            <feFuncG type="linear" slope={0.1} intercept={0.9} />
            <feFuncB type="linear" slope={0.1} intercept={0.9} />
          </feComponentTransfer>
          <feComposite in="crackle" in2="SourceAlpha" operator="in" result="clippedCrackle" />
          <feBlend in="baseTinted" in2="clippedCrackle" mode="multiply" result="baseTinted" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            result="brownColorized"
            values="0.65 0.20 0.03 0 0  0.15 0.48 0.03 0 0.02  0.02 0.03 0.12 0 0  0 0 0 1 0"
          />
          <feComponentTransfer in="brownColorized" result="brownColorized">
            <feFuncR type="gamma" amplitude={1} exponent={1.3} offset={0} />
            <feFuncG type="gamma" amplitude={1} exponent={1.4} offset={0} />
            <feFuncB type="gamma" amplitude={1} exponent={1.6} offset={0} />
          </feComponentTransfer>
          <feColorMatrix in="brownColorized" type="saturate" values="0.1" result="brownColorized" />
          <feMorphology in="SourceAlpha" operator="erode" radius={10} result="brownEroded" />
          <feComposite in="SourceAlpha" in2="brownEroded" operator="out" result="brownEdgeHard" />
          <feGaussianBlur in="brownEdgeHard" stdDeviation={10} result="brownEdgeMask" />
          <feComposite in="brownColorized" in2="brownEdgeMask" operator="in" result="brownEdge" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            result="blackColorized"
            values="0.22 0.07 0.01 0 0  0.07 0.16 0.01 0 0  0.01 0.02 0.10 0 0  0 0 0 1 0"
          />
          <feMorphology in="SourceAlpha" operator="erode" radius={2} result="blackEroded" />
          <feComposite in="SourceAlpha" in2="blackEroded" operator="out" result="blackEdgeHard" />
          <feGaussianBlur in="blackEdgeHard" stdDeviation={6} result="blackEdgeMask" />
          <feComposite in="blackColorized" in2="blackEdgeMask" operator="in" result="blackEdge" />
          <feComposite in="brownEdge" in2="baseTinted" operator="over" result="withBrown" />
          <feComposite in="blackEdge" in2="withBrown" operator="over" />
        </filter>

        <filter id="form-fried-filter" colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            result="baseTinted"
            values="1.05 0 0 0 0.01  0 0.99 0 0 0  0 0 0.88 0 0  0 0 0 1 0"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.30"
            numOctaves={2}
            seed={8}
            result="sizzleNoise"
          />
          <feGaussianBlur in="sizzleNoise" stdDeviation={1.5} result="sizzleNoise" />
          <feColorMatrix in="sizzleNoise" type="saturate" values="0" result="sizzleNoise" />
          <feComponentTransfer in="sizzleNoise" result="sizzleNoise">
            <feFuncR type="linear" slope={0.14} intercept={0.86} />
            <feFuncG type="linear" slope={0.14} intercept={0.86} />
            <feFuncB type="linear" slope={0.14} intercept={0.86} />
          </feComponentTransfer>
          <feComposite in="sizzleNoise" in2="SourceAlpha" operator="in" result="clippedSizzle" />
          <feBlend in="baseTinted" in2="clippedSizzle" mode="multiply" result="baseTinted" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            result="colorized"
            values="1.12 0.06 0 0 0.02  0.03 0.90 0.02 0 0  0 0 0.55 0 0  0 0 0 1 0"
          />
          <feComponentTransfer in="colorized" result="colorized">
            <feFuncR type="gamma" amplitude={1} exponent={0.9} offset={0} />
            <feFuncG type="gamma" amplitude={1} exponent={1.1} offset={0} />
            <feFuncB type="gamma" amplitude={1} exponent={1.25} offset={0} />
          </feComponentTransfer>
          <feColorMatrix in="colorized" type="saturate" values="0.1" result="colorized" />
          <feMorphology in="SourceAlpha" operator="erode" radius={4} result="eroded" />
          <feComposite in="SourceAlpha" in2="eroded" operator="out" result="edgeHard" />
          <feGaussianBlur in="edgeHard" stdDeviation={4} result="edgeMask" />
          <feComposite in="colorized" in2="edgeMask" operator="in" result="colorizedEdge" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            result="blackColorized"
            values="0.35 0.08 0.01 0 0  0.05 0.12 0.01 0 0  0.01 0.02 0.06 0 0  0 0 0 1 0"
          />
          <feMorphology in="SourceAlpha" operator="erode" radius={1} result="blackEroded" />
          <feComposite in="SourceAlpha" in2="blackEroded" operator="out" result="blackEdgeHard" />
          <feGaussianBlur in="blackEdgeHard" stdDeviation={2} result="blackEdgeMask" />
          <feComposite in="blackColorized" in2="blackEdgeMask" operator="in" result="blackEdge" />
          <feComposite in="colorizedEdge" in2="baseTinted" operator="over" result="withEdge" />
          <feComposite in="blackEdge" in2="withEdge" operator="over" />
        </filter>

        <filter id="form-boiled-filter" colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            result="colorized"
            values="0.70 0.10 0.05 0 0.07  0.05 0.72 0.08 0 0.05  0.05 0.10 0.85 0 0.05  0 0 0 1 0"
          />
          <feComponentTransfer in="colorized" result="colorized">
            <feFuncR type="gamma" amplitude={1} exponent={0.7} offset={0} />
            <feFuncG type="gamma" amplitude={1} exponent={0.7} offset={0} />
            <feFuncB type="gamma" amplitude={1} exponent={0.7} offset={0} />
          </feComponentTransfer>
          <feColorMatrix in="colorized" type="saturate" values="0.1" result="colorized" />
          <feMorphology in="SourceAlpha" operator="erode" radius={10} result="eroded" />
          <feComposite in="SourceAlpha" in2="eroded" operator="out" result="edgeHard" />
          <feGaussianBlur in="edgeHard" stdDeviation={6} result="edgeMask" />
          <feComposite in="colorized" in2="edgeMask" operator="in" result="colorizedEdge" />
          <feComposite in="colorizedEdge" in2="SourceGraphic" operator="over" />
        </filter>

        <filter id="form-fermented-filter" colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            result="baseTinted"
            values="0.99 0 0 0 0  0 1.01 0 0 0  0 0 0.96 0 0  0 0 0 1 0"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.06"
            numOctaves={2}
            seed={23}
            result="cultureMold"
          />
          <feColorMatrix in="cultureMold" type="saturate" values="0" result="cultureMold" />
          <feComponentTransfer in="cultureMold" result="cultureMold">
            <feFuncR type="linear" slope={0.18} intercept={0.82} />
            <feFuncG type="linear" slope={0.18} intercept={0.82} />
            <feFuncB type="linear" slope={0.18} intercept={0.82} />
          </feComponentTransfer>
          <feComposite in="cultureMold" in2="SourceAlpha" operator="in" result="clippedMold" />
          <feBlend in="baseTinted" in2="clippedMold" mode="multiply" result="baseTinted" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            result="greenColorized"
            values="0.65 0.06 0.02 0 0  0.05 0.68 0.05 0 0  0.02 0.04 0.52 0 0  0 0 0 1 0"
          />
          <feComponentTransfer in="greenColorized" result="greenColorized">
            <feFuncR type="gamma" amplitude={1} exponent={1.15} offset={0} />
            <feFuncG type="gamma" amplitude={1} exponent={1.1} offset={0} />
            <feFuncB type="gamma" amplitude={1} exponent={1.2} offset={0} />
          </feComponentTransfer>
          <feColorMatrix in="greenColorized" type="saturate" values="0.1" result="greenColorized" />
          <feMorphology in="SourceAlpha" operator="erode" radius={10} result="greenEroded" />
          <feComposite in="SourceAlpha" in2="greenEroded" operator="out" result="greenEdgeHard" />
          <feGaussianBlur in="greenEdgeHard" stdDeviation={10} result="greenEdgeMask" />
          <feComposite in="greenColorized" in2="greenEdgeMask" operator="in" result="greenEdge" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            result="brownColorized"
            values="0.62 0.08 0.01 0 0  0.05 0.58 0.01 0 0  0.01 0.02 0.38 0 0  0 0 0 1 0"
          />
          <feColorMatrix in="brownColorized" type="saturate" values="0.1" result="brownColorized" />
          <feMorphology in="SourceAlpha" operator="erode" radius={2} result="brownEroded" />
          <feComposite in="SourceAlpha" in2="brownEroded" operator="out" result="brownEdgeHard" />
          <feGaussianBlur in="brownEdgeHard" stdDeviation={6} result="brownEdgeMask" />
          <feComposite in="brownColorized" in2="brownEdgeMask" operator="in" result="brownEdge" />
          <feComposite in="greenEdge" in2="baseTinted" operator="over" result="withGreen" />
          <feComposite in="brownEdge" in2="withGreen" operator="over" />
        </filter>

        <filter id="form-dried-filter" colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            result="baseTinted"
            values="0.92 0.04 0 0 0.04  0.02 0.88 0.02 0 0.01  0 0.02 0.72 0 0  0 0 0 1 0"
          />
          <feColorMatrix in="baseTinted" type="saturate" values="0.70" result="baseTinted" />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.38"
            numOctaves={4}
            seed={12}
            result="grain"
          />
          <feColorMatrix in="grain" type="saturate" values="0" result="grain" />
          <feComponentTransfer in="grain" result="grain">
            <feFuncR type="linear" slope={0.32} intercept={0.68} />
            <feFuncG type="linear" slope={0.32} intercept={0.68} />
            <feFuncB type="linear" slope={0.32} intercept={0.68} />
          </feComponentTransfer>
          <feComposite in="grain" in2="SourceAlpha" operator="in" result="clippedGrain" />
          <feBlend in="baseTinted" in2="clippedGrain" mode="multiply" result="textured" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            result="crustColorized"
            values="0.48 0.16 0.06 0 0.06  0.10 0.44 0.06 0 0.03  0.04 0.06 0.30 0 0.01  0 0 0 1 0"
          />
          <feComponentTransfer in="crustColorized" result="crustColorized">
            <feFuncR type="gamma" amplitude={1} exponent={1.35} offset={0} />
            <feFuncG type="gamma" amplitude={1} exponent={1.5} offset={0} />
            <feFuncB type="gamma" amplitude={1} exponent={1.8} offset={0} />
          </feComponentTransfer>
          <feColorMatrix in="crustColorized" type="saturate" values="0.1" result="crustColorized" />
          <feMorphology in="SourceAlpha" operator="erode" radius={3} result="eroded" />
          <feComposite in="SourceAlpha" in2="eroded" operator="out" result="edgeHard" />
          <feGaussianBlur in="edgeHard" stdDeviation={4} result="edgeMask" />
          <feComposite in="crustColorized" in2="edgeMask" operator="in" result="colorizedEdge" />
          <feComposite in="colorizedEdge" in2="textured" operator="over" />
        </filter>

        <filter id="form-smoked-filter" colorInterpolationFilters="sRGB">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            result="baseTinted"
            values="0.82 0.10 0.08 0 0  0.08 0.80 0.10 0 0  0.06 0.08 0.84 0 0  0 0 0 1 0"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.15"
            numOctaves={3}
            seed={5}
            result="smokeStreaks"
          />
          <feColorMatrix in="smokeStreaks" type="saturate" values="0" result="smokeStreaks" />
          <feComponentTransfer in="smokeStreaks" result="smokeStreaks">
            <feFuncR type="linear" slope={0.18} intercept={0.82} />
            <feFuncG type="linear" slope={0.18} intercept={0.82} />
            <feFuncB type="linear" slope={0.18} intercept={0.82} />
          </feComponentTransfer>
          <feComposite in="smokeStreaks" in2="SourceAlpha" operator="in" result="clippedStreaks" />
          <feBlend in="baseTinted" in2="clippedStreaks" mode="multiply" result="baseTinted" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            result="smokeColorized"
            values="0.22 0.06 0.06 0 0.04  0.06 0.22 0.06 0 0.04  0.06 0.06 0.24 0 0.06  0 0 0 1 0"
          />
          <feComponentTransfer in="smokeColorized" result="smokeColorized">
            <feFuncR type="gamma" amplitude={1} exponent={0.75} offset={0} />
            <feFuncG type="gamma" amplitude={1} exponent={0.75} offset={0} />
            <feFuncB type="gamma" amplitude={1} exponent={0.7} offset={0} />
          </feComponentTransfer>
          <feColorMatrix in="smokeColorized" type="saturate" values="0.1" result="smokeColorized" />
          <feMorphology in="SourceAlpha" operator="erode" radius={12} result="eroded" />
          <feComposite in="SourceAlpha" in2="eroded" operator="out" result="edgeHard" />
          <feGaussianBlur in="edgeHard" stdDeviation={16} result="edgeMask" />
          <feComposite in="smokeColorized" in2="edgeMask" operator="in" result="colorizedEdge" />
          <feComposite in="colorizedEdge" in2="baseTinted" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}
