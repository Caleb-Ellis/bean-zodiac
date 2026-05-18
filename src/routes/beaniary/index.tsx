import { createFileRoute, Link } from "@tanstack/react-router";

const sections = [
  {
    href: "/beaniary/beans",
    label: "The Twelve Beans",
    description: "The Great Beans of the Bean Zodiac",
    emoji: "🫘",
  },
  {
    href: "/beaniary/flavours",
    label: "The Five Flavours",
    description: "The five fundamental phases of flavour",
    emoji: "👅",
  },
  {
    href: "/beaniary/forms",
    label: "The Six Forms",
    description: "The six seasonal forms of preparation",
    emoji: "🥣",
  },
  {
    href: "/beaniary/met",
    label: "Met Beans",
    description: "Beans spotted in the wild",
    emoji: "🔭",
  },
];

export const Route = createFileRoute("/beaniary/")({
  component: () => (
    <div className="animate-fade-up">
      <section className="py-12 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold">The Beaniary</h1>
        <p className="mt-4 text-lg text-zinc-300 max-w-xl mx-auto">
          Everything you need to know about The Bean Zodiac.
        </p>
      </section>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 list-none p-0 m-0 max-w-2xl mx-auto">
        {sections.map(({ href, label, description, emoji }) => (
          <li key={href}>
            <Link
              to={href}
              className="no-underline flex flex-col rounded-2xl border-2 border-zinc-800 bg-zinc-900 hover:border-zinc-600 transition-colors overflow-hidden h-full"
            >
              <div className="flex items-center justify-center h-28 bg-zinc-800/50 select-none">
                <span
                  style={{
                    filter: "brightness(0) invert(1)",
                    fontSize: "3rem",
                    lineHeight: 1,
                  }}
                >
                  {emoji}
                </span>
              </div>
              <div className="p-5 flex flex-col gap-1">
                <h2 className="text-xl font-semibold">{label}</h2>
                <p className="text-zinc-400 text-sm">{description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  ),
});
