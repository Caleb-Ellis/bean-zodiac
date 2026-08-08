import { Link, useLocation } from "@tanstack/react-router";

const links = [
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
  { href: "/wheel", label: "Wheel", emoji: "🛞", match: (p: string) => p === "/wheel" },
  { href: "/me", label: "My Bean", emoji: "👤", match: (p: string) => p.startsWith("/me") },
];

export function Navigation() {
  const { pathname } = useLocation();

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 py-4 border-b-2 border-zinc-800 bg-zinc-950">
      <Link to="/" className="font-bold inline-flex items-center gap-2">
        <img src="/favicon.svg" alt="" className="w-5 h-5" /> The Bean Zodiac
      </Link>
      <ul className="hidden md:flex gap-6 list-none m-0 p-0">
        {links.map(({ href, label, emoji, match }) => (
          <li key={href}>
            <Link
              to={href}
              className={`link text-base inline-flex items-center gap-2${match(pathname) ? " active" : ""}`}
            >
              <span
                style={{
                  filter: "brightness(0) invert(1)",
                  fontSize: 18,
                  lineHeight: 1,
                }}
                aria-hidden="true"
              >
                {emoji}
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
