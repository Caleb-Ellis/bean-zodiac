import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import Bean from "../../components/zodiac/Bean";
import BeanBadge from "../../components/zodiac/BeanBadge";
import FlavourBadge from "../../components/zodiac/FlavourBadge";
import FormBadge from "../../components/zodiac/FormBadge";
import TraitBadge from "../../components/zodiac/TraitBadge";
import ZodiacDish from "../../components/zodiac/ZodiacDish";
import ZodiacName from "../../components/zodiac/ZodiacName";
import { allZodiacData } from "../../lib/data";
import { fetchZodiac } from "../../lib/data";
import {
  getPreparationName,
  isValidZodiacId,
  type BeanId,
  type FlavourId,
  type FormId,
} from "../../lib/zodiac";
import { useEffect, useState } from "react";
import type { Zodiac } from "../../lib/zodiac";

export const Route = createFileRoute("/zodiacs/$id")({
  component: () => {
    const { id } = Route.useParams();
    if (!isValidZodiacId(id)) throw notFound();

    const parts = id.split("-");
    // ZodiacId format: {flavourId}-{formId}-{beanId} (flavour and form are single words)
    // But beanId can be multi-part like "butter", "navy", etc. — all single words too.
    // Format is always flavour-form-bean, each single word
    const flavourId = parts[0] as FlavourId;
    const formId = parts[1] as FormId;
    const beanId = parts.slice(2).join("-") as BeanId;

    const bean = allZodiacData.beans[beanId];
    const flavour = allZodiacData.flavours[flavourId];
    const form = allZodiacData.forms[formId];
    if (!bean || !flavour || !form) throw notFound();

    const preparation = getPreparationName(flavourId, formId);

    const [zodiac, setZodiac] = useState<Zodiac | null>(null);
    useEffect(() => {
      fetchZodiac(id as Parameters<typeof fetchZodiac>[0]).then(setZodiac);
    }, [id]);

    return (
      <div className="animate-fade-up relative rounded-2xl p-[1.5px] overflow-hidden shadow-2xl shadow-black/90">
        <div
          className="absolute"
          style={{
            inset: "-200%",
            background: `conic-gradient(from 0deg, var(--flavour-${flavourId}), var(--form-${formId}), var(--bean-${beanId}), var(--flavour-${flavourId}))`,
            animation: "spin 15s linear infinite",
          }}
        />
        <article className="relative rounded-2xl bg-zinc-900 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-80 shrink-0 aspect-square">
              <Bean bean={bean} flavourId={flavourId} formId={formId} />
            </div>
            <div className="p-6 md:p-8 flex flex-col gap-4 min-w-0">
              <Link to="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                ← Home
              </Link>
              <h1 className="text-3xl font-bold">
                <ZodiacName
                  flavourId={flavourId}
                  formId={formId}
                  beanId={beanId}
                  preparation={preparation}
                  beanName={bean.name}
                />
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                <FlavourBadge id={flavourId} name={flavour.name} />
                <span className="text-zinc-600">×</span>
                <FormBadge id={formId} name={form.name} />
                <span className="text-zinc-600">×</span>
                <BeanBadge id={beanId} name={bean.name} />
                {zodiac && (
                  <>
                    <span className="text-zinc-600">=</span>
                    <TraitBadge trait={zodiac.trait} featured />
                  </>
                )}
              </div>
              {zodiac && <p className="text-zinc-300 italic">"{zodiac.quote}"</p>}
              {zodiac && (
                <div className="markdown-content mb-2">
                  <ReactMarkdown>{zodiac.content}</ReactMarkdown>
                </div>
              )}
              {zodiac && <ZodiacDish dish={zodiac.dish} />}
            </div>
          </div>
        </article>
      </div>
    );
  },
});
