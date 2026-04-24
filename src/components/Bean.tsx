import type { FlavourId, FormId, QualityId } from "../lib/zodiac";
import type { BeanSchema } from "../schemas";
import styles from "./Bean.module.css";

const QUALITY_SATURATE: Record<QualityId, number> = {
  rotten: 0.25,
  stale: 0.5,
  garden: 1,
  market: 1.5,
  heirloom: 2,
};

type Props = {
  bean: BeanSchema;
  flavourId?: FlavourId;
  formId?: FormId;
  qualityId?: QualityId;
};

export default function Bean({ bean, flavourId, formId, qualityId }: Props) {
  const imageUrl = `/images/${bean.imageFile}`;
  return (
    <div
      className={`${styles.bean}${flavourId ? ` flavour-${flavourId}` : ""}`}
      style={
        formId || flavourId
          ? ({
              "--glow-color": formId ? `var(--form-${formId})` : "transparent",
              "--glow-center-color": flavourId
                ? `var(--flavour-${flavourId})`
                : "transparent",
            } as React.CSSProperties)
          : undefined
      }
    >
      <div
        className={`${styles.glowWrapper}${flavourId && formId ? ` prep-${flavourId}-${formId}` : flavourId ? ` flavour-filter-${flavourId}` : ""}${formId ? ` form-filter-${formId}` : ""}`}
        style={qualityId != null ? { "--quality-saturate": QUALITY_SATURATE[qualityId] } as React.CSSProperties : undefined}
      >
        <img src={imageUrl} alt={flavourId ? `${flavourId} ${bean.name}` : bean.name} />
      </div>
    </div>
  );
}
