import { Link } from "@tanstack/react-router";

const AXES = {
  bean: { to: "/beaniary/beans", back: "← All Beans", label: "The Twelve Beans" },
  flavour: {
    to: "/beaniary/flavours",
    back: "← All Flavours",
    label: "The Five Flavours",
  },
  form: { to: "/beaniary/forms", back: "← All Forms", label: "The Six Forms" },
} as const;

type Axis = keyof typeof AXES;

interface Props {
  /** The page's own axis — it gets the back link, the other two are offered as onward routes. */
  current: Axis;
}

export default function BeaniaryNav({ current }: Props) {
  const others = (Object.keys(AXES) as Axis[]).filter((a) => a !== current);

  return (
    <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-zinc-800 pt-4 text-sm">
      <Link
        to={AXES[current].to}
        className="text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        {AXES[current].back}
      </Link>
      {others.map((axis) => (
        <Link
          key={axis}
          to={AXES[axis].to}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {AXES[axis].label} →
        </Link>
      ))}
    </nav>
  );
}
