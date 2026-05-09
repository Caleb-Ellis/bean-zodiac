import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import Bean from "../../components/zodiac/Bean";
import TraitBadge from "../../components/zodiac/TraitBadge";
import { allZodiacData } from "../../lib/data";
import type { BeanId } from "../../lib/zodiac";

export const Route = createFileRoute("/beans/$id")({
  component: () => {
    const { id } = Route.useParams();
    const bean = allZodiacData.beans[id as BeanId];
    if (!bean) throw notFound();

    return (
      <article className="animate-fade-up rounded-2xl bg-zinc-900 border-2 border-zinc-800 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-80 shrink-0 aspect-square">
            <Bean bean={bean} />
          </div>
          <div className="p-6 md:p-8 flex flex-col gap-4 min-w-0">
            <Link
              to="/beans"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              ← All Beans
            </Link>
            <h1 className={`text-3xl font-bold bean-${id}`}>{bean.name}</h1>
            <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0">
              {bean.traits.map((trait) => (
                <TraitBadge key={trait} trait={trait} />
              ))}
            </ul>
            <p className="text-zinc-300 italic">{bean.tagline}</p>
            <div className="markdown-content">
              <ReactMarkdown>{bean.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </article>
    );
  },
});
