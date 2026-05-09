import { FLAVOUR_EMOJI, type FlavourId } from "../../lib/zodiac";
import Badge from "../ui/Badge";

interface Props {
  id: FlavourId;
  name: string;
  label?: string;
  small?: boolean;
}

export default function FlavourBadge({ id, name, label, small }: Props) {
  const text = label ? `${name} ${label}` : name;
  return (
    <Badge
      href={`/flavours/${id}`}
      icon={<span>{FLAVOUR_EMOJI[id]}</span>}
      colorClass={`flavour-${id}`}
      small={small}
    >
      {text}
    </Badge>
  );
}
