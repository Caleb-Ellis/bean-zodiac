import { createFileRoute, Link } from "@tanstack/react-router";
import { allZodiacData } from "../../../lib/data";
import { FLAVOUR_EMOJI, type FlavourId } from "../../../lib/zodiac";

export const Route = createFileRoute("/beaniary/flavours/")({
  component: () => {
    const flavours = Object.entries(allZodiacData.flavours);
    return (
      <div className="animate-fade-up">
        <section className="py-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">
            The Five Phases of Flavour
          </h1>
          <p className="mt-3 text-lg text-zinc-300 max-w-xl mx-auto">
            Each Bean is enhanced by one of five fundamental flavours.
          </p>
        </section>
        <ul className="flex flex-col gap-3 list-none p-0 m-0 max-w-lg mx-auto w-full">
          {flavours.map(([id, flavour]) => (
            <li
              key={id}
              className="rounded-xl border-2 border-zinc-800 bg-zinc-900 overflow-hidden hover:border-zinc-600 transition-colors"
            >
              <Link
                to="/beaniary/flavours/$id"
                params={{ id }}
                className="flex no-underline"
              >
                <div
                  className={`w-14 shrink-0 bg-flavour-${id} flex items-center justify-center`}
                >
                  <span
                    style={{
                      filter: "brightness(0)",
                      fontSize: "1.5rem",
                      lineHeight: 1,
                    }}
                  >
                    {FLAVOUR_EMOJI[id as FlavourId]}
                  </span>
                </div>
                <div className="p-4">
                  <h2 className={`text-lg font-semibold flavour-${id}`}>
                    {flavour.name}
                  </h2>
                  <p className="text-sm text-zinc-300 mt-0.5">
                    {flavour.tagline}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  },
});
