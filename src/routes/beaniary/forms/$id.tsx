import { createFileRoute, notFound } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import BackLink from "../../../components/zodiac/BackLink";
import BeaniaryNav from "../../../components/zodiac/BeaniaryNav";
import PreparationList from "../../../components/zodiac/PreparationList";
import TraitBadge from "../../../components/zodiac/TraitBadge";
import { allZodiacData } from "../../../lib/data";
import { FORM_EMOJI, type FormId } from "../../../lib/zodiac";

export const Route = createFileRoute("/beaniary/forms/$id")({
  component: () => {
    const { id } = Route.useParams();
    const form = allZodiacData.forms[id as FormId];
    if (!form) throw notFound();

    return (
      <article
        className={`animate-fade-up rounded-2xl bg-zinc-900 border-4 border-form-${id} overflow-hidden max-w-2xl mx-auto`}
      >
        <div className="flex flex-col md:flex-row">
          <div className="p-6 md:p-8 flex flex-col gap-4 min-w-0">
            <BackLink />
            <h1
              className={`text-3xl font-bold form-${id} flex items-center gap-3`}
            >
              {form.name}
              <span style={{ fontSize: "0.9em" }}>
                {FORM_EMOJI[id as FormId]}
              </span>
            </h1>
            <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0">
              {form.positiveTraits.map((trait) => (
                <TraitBadge key={trait} trait={trait} />
              ))}
              {form.negativeTraits.map((trait) => (
                <TraitBadge key={trait} trait={trait} shadow />
              ))}
            </ul>
            <p className="text-zinc-300 italic">{form.tagline}</p>
            <div className="markdown-content">
              <ReactMarkdown>{form.content}</ReactMarkdown>
            </div>
            <PreparationList axis="form" id={form.slug} />
            <BeaniaryNav current="form" />
          </div>
        </div>
      </article>
    );
  },
});
