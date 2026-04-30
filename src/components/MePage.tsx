import Markdown from "react-markdown";
import { useEffect, useState } from "react";
import {
  BEAN_ORDER,
  FLAVOUR_EMOJI,
  FLAVOUR_ORDER,
  FORM_EMOJI,
  FORM_ORDER,
  getPreparationName,
  type BeanId,
  type FlavourId,
  type FormId,
  type Zodiac,
  type ZodiacId,
} from "../lib/zodiac";
import { fetchZodiac, type AllZodiacData } from "../lib/data";
import { getClaimedBeanSlug } from "../lib/claimedBean";
import { getFortuneHistory } from "../lib/fortuneHistory";
import Bean from "./Bean";
import BeanBadge from "./BeanBadge";
import FlavourBadge from "./FlavourBadge";
import FormBadge from "./FormBadge";
import TraitBadge from "./TraitBadge";
import ZodiacName from "./ZodiacName";
import SpiritBeanRadar from "./SpiritBeanRadar";

interface Props {
  data: AllZodiacData;
}

function computeScores(
  claimedSlug: ZodiacId,
  data: AllZodiacData,
): {
  flavourValues: number[];
  formValues: number[];
  beanValues: number[];
  flavourHighlight: number;
  formHighlight: number;
  beanHighlight: number;
  claimedFlavourIdx: number;
  claimedFormIdx: number;
  claimedBeanIdx: number;
} {
  const [claimedFlavourId, claimedFormId, claimedBeanId] = claimedSlug.split(
    "-",
  ) as [FlavourId, FormId, BeanId];

  const flavourScores = Object.fromEntries(FLAVOUR_ORDER.map((id) => [id, 5]));
  const formScores = Object.fromEntries(FORM_ORDER.map((id) => [id, 5]));
  const beanScores = Object.fromEntries(BEAN_ORDER.map((id) => [id, 5]));

  flavourScores[claimedFlavourId] += 5;
  formScores[claimedFormId] += 5;
  beanScores[claimedBeanId] += 5;

  const history = getFortuneHistory();
  for (const entry of history) {
    const s = entry.score ?? 0;
    if (s === 0) continue;
    const adjustedS =
      entry.qualityId === "stale" || entry.qualityId === "rotten" ? -s : s;
    const [f, frm, b] = entry.zodiacId.split("-") as [
      FlavourId,
      FormId,
      BeanId,
    ];
    flavourScores[f] = (flavourScores[f] ?? 5) + adjustedS;
    formScores[frm] = (formScores[frm] ?? 5) + adjustedS;
    beanScores[b] = (beanScores[b] ?? 5) + adjustedS;
  }

  const flavourValues = FLAVOUR_ORDER.map((id) =>
    Math.max(0, flavourScores[id]),
  );
  const formValues = FORM_ORDER.map((id) => Math.max(0, formScores[id]));
  const beanValues = BEAN_ORDER.map((id) => Math.max(0, beanScores[id]));

  const claimedFlavourIdx = FLAVOUR_ORDER.indexOf(claimedFlavourId);
  const claimedFormIdx = FORM_ORDER.indexOf(claimedFormId);
  const claimedBeanIdx = BEAN_ORDER.indexOf(claimedBeanId);

  const pickHighlight = (values: number[], claimedIdx: number) => {
    const max = Math.max(...values);
    return values[claimedIdx] === max ? claimedIdx : values.indexOf(max);
  };

  return {
    flavourValues,
    formValues,
    beanValues,
    flavourHighlight: pickHighlight(flavourValues, claimedFlavourIdx),
    formHighlight: pickHighlight(formValues, claimedFormIdx),
    beanHighlight: pickHighlight(beanValues, claimedBeanIdx),
    claimedFlavourIdx,
    claimedFormIdx,
    claimedBeanIdx,
  };
}

export default function MePage({ data }: Props) {
  const [claimedSlug, setClaimedSlug] = useState<ZodiacId | null>(null);
  const [zodiac, setZodiac] = useState<Zodiac | null>(null);
  const [scores, setScores] = useState<ReturnType<typeof computeScores> | null>(
    null,
  );

  useEffect(() => {
    const slug = getClaimedBeanSlug();
    setClaimedSlug(slug);
    if (!slug) return;
    fetchZodiac(slug).then((z) => setZodiac(z));
    setScores(computeScores(slug, data));
  }, []);

  useEffect(() => {
    if (zodiac && window.location.hash === "#spirit-bean") {
      setTimeout(() => {
        document
          .getElementById("spirit-bean")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [zodiac]);

  if (claimedSlug === null) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center animate-fade-up">
        <p className="text-zinc-400">
          You haven't claimed a Bean yet.{" "}
          <a href="/" className="link">
            Discover yours on the home page.
          </a>
        </p>
      </div>
    );
  }

  const [flavourId, formId, beanId] = (claimedSlug?.split("-") ?? []) as [
    FlavourId,
    FormId,
    BeanId,
  ];
  const bean = data.beans[beanId];
  const flavour = data.flavours[flavourId];
  const form = data.forms[formId];
  const preparation = bean ? getPreparationName(flavourId, formId) : "";

  const flavourLabels = FLAVOUR_ORDER.map(
    (id) => `${FLAVOUR_EMOJI[id]} ${data.flavours[id]?.name ?? id}${id === flavourId ? " 👤" : ""}`,
  );
  const flavourColors = FLAVOUR_ORDER.map((id) => `var(--flavour-${id})`);
  const flavourHrefs = FLAVOUR_ORDER.map((id) => `/flavours/${id}`);
  const formLabels = FORM_ORDER.map(
    (id) => `${FORM_EMOJI[id]} ${data.forms[id]?.name ?? id}${id === formId ? " 👤" : ""}`,
  );
  const formColors = FORM_ORDER.map((id) => `var(--form-${id})`);
  const formHrefs = FORM_ORDER.map((id) => `/forms/${id}`);
  const beanLabels = BEAN_ORDER.map((id) =>
    `${(data.beans[id]?.name ?? id).replace(/ Bean$/, "")}${id === beanId ? " 👤" : ""}`,
  );
  const beanColors = BEAN_ORDER.map((id) => `var(--bean-${id})`);
  const beanHrefs = BEAN_ORDER.map((id) => `/beans/${id}`);
  const alignedCount = scores
    ? [
        scores.flavourValues[scores.claimedFlavourIdx] >=
          Math.max(...scores.flavourValues),
        scores.beanValues[scores.claimedBeanIdx] >=
          Math.max(...scores.beanValues),
        scores.formValues[scores.claimedFormIdx] >=
          Math.max(...scores.formValues),
      ].filter(Boolean).length
    : 0;

  const alignmentText =
    alignedCount === 3
      ? "Your body and spirit align."
      : alignedCount === 2
        ? "Your spirit stirs — body and spirit are nearly one."
        : alignedCount === 1
          ? "One thread holds — body and spirit drift apart."
          : "Your body and spirit walk their own paths.";

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-80 shrink-0 aspect-square">
          {bean && <Bean bean={bean} flavourId={flavourId} formId={formId} />}
        </div>
        <div className="flex flex-col gap-4 min-w-0 flex-1">
          <a
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Home
          </a>
          <h1 className="text-3xl font-bold">
            {bean && (
              <ZodiacName
                flavourId={flavourId}
                formId={formId}
                beanId={beanId}
                preparation={preparation}
                beanName={bean.name}
              />
            )}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
            {flavour && <FlavourBadge id={flavourId} name={flavour.name} />}
            <span className="text-zinc-600">×</span>
            {form && <FormBadge id={formId} name={form.name} />}
            <span className="text-zinc-600">×</span>
            {bean && <BeanBadge id={beanId} name={bean.name} />}
            {zodiac && (
              <>
                <span className="text-zinc-600">=</span>
                <TraitBadge trait={zodiac.trait} featured />
              </>
            )}
          </div>
          {zodiac && <p className="text-zinc-300 italic">"{zodiac.quote}"</p>}
          {zodiac?.content && (
            <div className="markdown-content mb-2">
              <Markdown>{zodiac.content}</Markdown>
            </div>
          )}
        </div>
      </div>

      {/* Spirit Bean */}
      <section id="spirit-bean" className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 border-t border-zinc-700" />
          <span className="text-zinc-500 text-xs">✦</span>
          <div className="flex-1 border-t border-zinc-700" />
        </div>
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Spirit Bean</h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            Your affinity with each element of the Bean Zodiac.
          </p>
        </div>
        {scores && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 w-full">
              <SpiritBeanRadar
                title="Flavour"
                labels={flavourLabels}
                labelColors={flavourColors}
                labelHrefs={flavourHrefs}
                values={scores.flavourValues}
                highlightIndex={scores.flavourHighlight}
                colorVar={`var(--flavour-${FLAVOUR_ORDER[scores.flavourHighlight]})`}
              />
              <SpiritBeanRadar
                title="Form"
                labels={formLabels}
                labelColors={formColors}
                labelHrefs={formHrefs}
                values={scores.formValues}
                highlightIndex={scores.formHighlight}
                colorVar={`var(--form-${FORM_ORDER[scores.formHighlight]})`}
              />
              <SpiritBeanRadar
                title="Bean"
                labels={beanLabels}
                labelColors={beanColors}
                labelHrefs={beanHrefs}
                values={scores.beanValues}
                highlightIndex={scores.beanHighlight}
                colorVar={`var(--bean-${BEAN_ORDER[scores.beanHighlight]})`}
              />
            </div>
            <p className="text-2xl font-semibold text-center text-zinc-200">
              {alignmentText}
            </p>
          </>
        )}
      </section>
    </div>
  );
}
