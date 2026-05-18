import { Link, useLocation } from "@tanstack/react-router";

const links = [
  { href: "/beaniary", label: "The Beaniary", match: (p: string) => p.startsWith("/beaniary") },
  { href: "/beanstalk", label: "The Beanstalk", match: (p: string) => p.startsWith("/beanstalk") },
  { href: "/compatibility", label: "Match Beans", match: (p: string) => p.startsWith("/compatibility") },
];

export function Navigation() {
  const { pathname } = useLocation();

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 py-4 border-b-2 border-zinc-800 bg-zinc-950">
      <Link to="/" className="font-bold inline-flex items-center gap-2">
        <span style={{ filter: "brightness(0) invert(1)" }}>🫘</span> The Bean Zodiac
      </Link>
      <ul className="hidden md:flex gap-6 list-none m-0 p-0">
        {links.map(({ href, label, match }) => (
          <li key={href}>
            <Link
              to={href}
              className={`link text-base${match(pathname) ? " active" : ""}`}
            >
              {label}
            </Link>
          </li>
        ))}
        <li>
          <Link to="/wheel" className={`link font-bold${pathname === "/wheel" ? " active" : ""}`}>
            The Wheel of Beans
          </Link>
        </li>
      </ul>
    </nav>
  );
}
