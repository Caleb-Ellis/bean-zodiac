import type { ReactNode } from "react";

interface Props {
  href: string;
  icon: ReactNode;
  colorClass: string;
  small?: boolean;
  children: ReactNode;
}

export default function Badge({ href, icon, colorClass, small, children }: Props) {
  if (small) {
    return (
      <a
        href={href}
        className={`text-xs flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 hover:border-zinc-500 transition-colors no-underline ${colorClass}`}
      >
        {icon}
        {children}
      </a>
    );
  }
  return (
    <a
      href={href}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline"
    >
      {icon}
      <span className={colorClass}>{children}</span>
    </a>
  );
}
