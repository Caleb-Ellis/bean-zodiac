import { Link, useLocation } from "@tanstack/react-router";
import { useHideOnScrollDown } from "../../lib/useHideOnScrollDown";

const tabs = [
  {
    href: "/beaniary",
    label: "Beaniary",
    emoji: "🫘",
    match: (p: string) => p.startsWith("/beaniary"),
  },
  {
    href: "/beanstalk",
    label: "Beanstalk",
    emoji: "🪴",
    match: (p: string) => p.startsWith("/beanstalk"),
  },
  {
    href: "/wheel",
    label: "Wheel",
    emoji: "🛞",
    match: (p: string) => p === "/wheel",
  },
  {
    href: "/me",
    label: "My Bean",
    emoji: "👤",
    match: (p: string) => p.startsWith("/me"),
  },
];

export function BottomTabBar() {
  const { pathname } = useLocation();
  const hidden = useHideOnScrollDown();

  return (
    <nav
      className={`fixed bottom-0 inset-x-0 md:hidden z-50 bg-zinc-950 border-t-2 border-zinc-800 transition-transform duration-300 will-change-transform ${hidden ? "translate-y-full" : "translate-y-0"}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="flex list-none m-0 p-0">
        {tabs.map(({ href, label, emoji, match }) => {
          const isActive = match(pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                to={href}
                className={`flex flex-col items-center gap-1 py-3 text-xs transition-colors ${isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                <span
                  style={{
                    filter: "brightness(0) invert(1)",
                    fontSize: 20,
                    lineHeight: 1,
                  }}
                  aria-hidden="true"
                >
                  {emoji}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
