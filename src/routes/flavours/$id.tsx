import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import TraitBadge from "../../components/zodiac/TraitBadge";
import { allZodiacData } from "../../lib/data";
import { FLAVOUR_EMOJI, type FlavourId } from "../../lib/zodiac";

export const Route = createFileRoute("/flavours/$id")({
  component: () => {
    const { id } = Route.useParams();
    const flavour = allZodiacData.flavours[id as FlavourId];
    if (!flavour) throw notFound();

    return (
      <article className="animate-fade-up rounded-2xl bg-zinc-900 border-2 border-zinc-800 overflow-hidden max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row">
          <div
            className={`w-full md:w-8 shrink-0 h-8 md:h-auto bg-flavour-${id}`}
          />
          <div className="p-6 md:p-8 flex flex-col gap-4 min-w-0">
            <Link
              to="/flavours"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              ← All Flavours
            </Link>
            <h1
              className={`text-3xl font-bold flavour-${id} flex items-center gap-3`}
            >
              {flavour.name}
              <span style={{ fontSize: "0.9em" }}>
                {FLAVOUR_EMOJI[id as FlavourId]}
              </span>
            </h1>
            <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0">
              {flavour.traits.map((trait) => (
                <TraitBadge key={trait} trait={trait} />
              ))}
            </ul>
            <p className="text-zinc-300 italic">{flavour.tagline}</p>
            <div className="markdown-content">
              <ReactMarkdown>{flavour.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </article>
    );
  },
});
