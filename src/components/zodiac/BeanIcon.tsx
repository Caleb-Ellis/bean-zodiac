import type { BeanId } from "../../lib/zodiac";

interface Props {
  id: BeanId;
  size: number;
}

export default function BeanIcon({ id, size }: Props) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        flexShrink: 0,
        backgroundColor: `var(--bean-${id})`,
        maskImage: `url('/images/${id}.svg')`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskImage: `url('/images/${id}.svg')`,
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
