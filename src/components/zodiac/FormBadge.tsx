import { FORM_EMOJI, type FormId } from "../../lib/zodiac";
import Badge from "../ui/Badge";

interface Props {
  id: FormId;
  name: string;
  label?: string;
  small?: boolean;
}

export default function FormBadge({ id, name, label, small }: Props) {
  const text = label ? `${name} ${label}` : name;
  return (
    <Badge
      href={`/forms/${id}`}
      icon={<span>{FORM_EMOJI[id]}</span>}
      colorClass={`form-${id}`}
      small={small}
    >
      {text}
    </Badge>
  );
}
