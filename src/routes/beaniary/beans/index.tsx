import { createFileRoute, Link } from "@tanstack/react-router";
import Bean from "../../../components/zodiac/Bean";
import TraitBadge from "../../../components/zodiac/TraitBadge";
import { allZodiacData } from "../../../lib/data";

export const Route = createFileRoute("/beaniary/beans/")({
  component: () => {
    const beans = Object.entries(allZodiacData.beans);
    return (
      <div className="animate-fade-up">
        <section className="py-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">The Twelve Beans</h1>
          <p className="mt-4 text-lg text-zinc-300 max-w-xl mx-auto">
            Each Bean carries its own character, wisdom, and fortune.
          </p>
        </section>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
          {beans.map(([id, bean]) => (
            <li
              key={id}
              className="rounded-2xl border-2 border-zinc-800 bg-zinc-900 overflow-hidden hover:border-zinc-600 transition-colors"
            >
              <Link
                to="/beaniary/beans/$id"
                params={{ id }}
                className="block aspect-square w-full"
              >
                <Bean bean={bean} />
              </Link>
              <div className="p-4">
                <h2 className={`text-lg font-semibold bean-${id}`}>
                  <Link
                    className="link"
                    to="/beaniary/beans/$id"
                    params={{ id }}
                  >
                    {bean.name}
                  </Link>
                </h2>
                <p className="text-sm text-zinc-300 mt-1">{bean.tagline}</p>
                <ul className="flex flex-wrap gap-1.5 mt-3 list-none p-0 m-0">
                  {bean.traits.map((trait) => (
                    <TraitBadge key={trait} trait={trait} />
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  },
});
