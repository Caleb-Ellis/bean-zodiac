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
        formId
          ? ({
              "--glow-color": `var(--form-${formId})`,
            } as React.CSSProperties)
          : undefined
      }
    >
      {flavourId ? (
        <img
          src={imageUrl}
          alt={`${flavourId} ${bean.name}`}
          className={[
            `flavour-filter-${flavourId}`,
            formId ? `form-filter-${formId}` : "",
          ]
            .join(" ")
            .trim()}
        />
      ) : (
        <img
          src={imageUrl}
          alt={bean.name}
          className={formId ? `form-filter-${formId}` : undefined}
        />
      )}
    </div>
  );
}
