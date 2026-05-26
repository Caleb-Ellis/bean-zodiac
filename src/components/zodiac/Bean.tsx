import type { BeanSchema, FlavourId, FormId, QualityId } from "../../lib/zodiac";
import styles from "./Bean.module.css";

const QUALITY_FILTER: Record<QualityId, string> = {
  rotten: "saturate(0) brightness(0) contrast(1)",
  stale: "saturate(0.5) brightness(0.5) contrast(1)",
  garden: "saturate(1) brightness(1) contrast(1)",
  market: "saturate(1.5) brightness(1.125) contrast(1.25)",
  heirloom: "saturate(2) brightness(1.25) contrast(1.5)",
};

type Props = {
  bean: BeanSchema;
  flavourId?: FlavourId;
  formId?: FormId;
  qualityId?: QualityId;
  maxHeight?: React.CSSProperties["maxHeight"];
};

export default function Bean({ bean, flavourId, formId, qualityId, maxHeight }: Props) {
  const imageUrl = `/images/${bean.imageFile}`;
  return (
    <div
      className={`${styles.bean}${flavourId ? ` flavour-${flavourId}` : ""}`}
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
  );
}
