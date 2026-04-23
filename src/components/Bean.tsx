import type { FlavourId, FormId } from "../lib/zodiac";
import type { BeanSchema } from "../schemas";
import styles from "./Bean.module.css";

type Props = {
  bean: BeanSchema;
  flavourId?: FlavourId;
  formId?: FormId;
};

export default function Bean({ bean, flavourId, formId }: Props) {
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
      <div className={`${styles.glowWrapper}${flavourId ? ` flavour-filter-${flavourId}` : ""}`}>
        <img src={imageUrl} alt={flavourId ? `${flavourId} ${bean.name}` : bean.name} />
      </div>
    </div>
  );
}
