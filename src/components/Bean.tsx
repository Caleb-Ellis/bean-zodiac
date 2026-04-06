import type { FlavourId } from "../lib/zodiac";
import type { BeanSchema } from "../schemas";
import styles from "./Bean.module.css";

type Props = {
  bean: BeanSchema;
  flavourId?: FlavourId;
};

export default function Bean({ bean, flavourId }: Props) {
  const imageUrl = `/images/${bean.imageFile}`;
  return (
    <div
      className={`${styles.bean}${flavourId ? ` flavour-${flavourId}` : ""}`}
    >
      {flavourId ? (
        <img
          src={imageUrl}
          alt={`${flavourId} ${bean.name}`}
          className={`flavour-filter-${flavourId}`}
        />
      ) : (
        <img src={imageUrl} alt={bean.name} />
      )}
    </div>
  );
}
