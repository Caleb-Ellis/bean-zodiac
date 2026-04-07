import type { FlavourId, MethodId } from "../lib/zodiac";
import type { BeanSchema } from "../schemas";
import styles from "./Bean.module.css";

type Props = {
  bean: BeanSchema;
  flavourId?: FlavourId;
  methodId?: MethodId;
};

export default function Bean({ bean, flavourId, methodId }: Props) {
  const imageUrl = `/images/${bean.imageFile}`;
  return (
    <div
      className={`${styles.bean}${flavourId ? ` flavour-${flavourId}` : ""}`}
      style={methodId ? { "--glow-color": `var(--method-${methodId})` } as React.CSSProperties : undefined}
    >
      {flavourId ? (
        <img
          src={imageUrl}
          alt={`${flavourId} ${bean.name}`}
          className={[`flavour-filter-${flavourId}`, methodId ? `method-filter-${methodId}` : ""].join(" ").trim()}
        />
      ) : (
        <img src={imageUrl} alt={bean.name} className={methodId ? `method-filter-${methodId}` : undefined} />
      )}
    </div>
  );
}
