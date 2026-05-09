import { Link, useLocation } from "@tanstack/react-router";

const links = [
  { href: "/beans", label: "Meet the Beans" },
  { href: "/flavours", label: "Taste the Flavours" },
  { href: "/forms", label: "Become the Forms" },
  { href: "/compatibility", label: "Match Beans" },
];

export function Navigation() {
  const { pathname } = useLocation();

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 py-4 border-b-2 border-zinc-800 bg-zinc-950">
      <Link to="/" className="link font-bold inline-flex items-center gap-2">
        <span style={{ filter: "brightness(0) invert(1)" }}>🫘</span> The Bean Zodiac
      </Link>
      <ul className="hidden md:flex gap-6 list-none m-0 p-0">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              to={href}
              className={`link text-base${pathname.startsWith(href) ? " active" : ""}`}
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
