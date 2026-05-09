import type { BeanId } from "../../lib/zodiac";
import Badge from "../ui/Badge";
import BeanIcon from "./BeanIcon";

interface Props {
  id: BeanId;
  name: string;
  label?: string;
  small?: boolean;
}

export default function BeanBadge({ id, name, label, small }: Props) {
  const text = label ? `${name} ${label}` : name;
  return (
    <Badge
      href={`/beans/${id}`}
      icon={<BeanIcon id={id} size={small ? 14 : 18} />}
      colorClass={`bean-${id}`}
      small={small}
    >
      {text}
    </Badge>
  );
}
