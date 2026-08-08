import type { BeanSchema, FlavourId, FormId, QualityId } from "../../lib/zodiac";
import styles from "./Bean.module.css";

const QUALITY_FILTER: Record<QualityId, string> = {
  rotten: "saturate(0.15) brightness(0.75) contrast(0.9)",
  stale: "saturate(0.35) brightness(0.85) contrast(1)",
  garden: "saturate(1) brightness(1) contrast(1)",
  market: "saturate(1.5) brightness(1.125) contrast(1.25)",
  heirloom: "saturate(0.75) brightness(1.5) contrast(0.75)",
};

type Props = {
  bean: BeanSchema;
  flavourId?: FlavourId;
  formId?: FormId;
  qualityId?: QualityId;
  maxHeight?: React.CSSProperties["maxHeight"];
  /**
   * Drift the two glow layers against each other. On by default; pass false in
   * the dense views (Beaniary met grid, Beanstalk timeline), where the movement
   * is too small to read and would run on every mounted cell at once.
   */
  animateGlow?: boolean;
};

export default function Bean({
  bean,
  flavourId,
  formId,
  qualityId,
  maxHeight,
  animateGlow = true,
}: Props) {
  const imageUrl = `/images/${bean.imageFile}`;
  // Baked glow masks are keyed off the image's stem: adzuki.webp -> adzuki-outer.png
  const glowStem = bean.imageFile.replace(/\.[^.]+$/, "");
  return (
    <div
      className={`${styles.bean}${animateGlow ? ` ${styles.animated}` : ""}${flavourId ? ` flavour-${flavourId}` : ""}`}
      style={
        formId || flavourId
          ? ({
              "--glow-color": formId ? `var(--form-${formId})` : "transparent",
              "--glow-center-color": flavourId ? `var(--flavour-${flavourId})` : "transparent",
            } as React.CSSProperties)
          : undefined
      }
    >
      <div
        className={`${styles.glowWrapper}${flavourId && formId ? ` prep-${flavourId}-${formId}` : flavourId ? ` flavour-filter-${flavourId}` : ""}${formId ? ` form-filter-${formId}` : ""}`}
      >
        {formId && (
          <div
            className={`${styles.glowLayer} ${styles.glowOuter}`}
            style={
              { "--glow-src": `url(/images/glow/${glowStem}-outer.png)` } as React.CSSProperties
            }
          />
        )}
        {flavourId && (
          <div
            className={`${styles.glowLayer} ${styles.glowInner}`}
            style={
              { "--glow-src": `url(/images/glow/${glowStem}-inner.png)` } as React.CSSProperties
            }
          />
        )}
        <div
          className={styles.beanImage}
          style={
            qualityId != null
              ? ({
                  "--quality-filter": QUALITY_FILTER[qualityId],
                } as React.CSSProperties)
              : undefined
          }
        >
          <img
            src={imageUrl}
            alt={flavourId ? `${flavourId} ${bean.name}` : bean.name}
            style={maxHeight != null ? { maxHeight } : undefined}
          />
        </div>
      </div>
    </div>
  );
}
