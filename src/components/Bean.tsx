import type { FlavourId } from "../lib/zodiac";
import type { BeanSchema } from "../schemas";
import styles from "./Bean.module.css";

type Props = {
  bean: BeanSchema;
  flavourId?: FlavourId;
};

export default function Bean({ bean, flavourId }: Props) {
  return (
    <div
      className={`${styles.bean}${flavourId ? ` flavour-${flavourId}` : ""}`}
    >
      <img
        src={`/images/${bean.imageFile}`}
        alt={`${flavourId ? `${flavourId} ` : ""}${bean.name}`}
      />
    </div>
  );
}
