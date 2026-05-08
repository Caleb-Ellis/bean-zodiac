import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  getPreparationName,
  getZodiacMetadataForDate,
  type BeanId,
  type FlavourId,
  type FormId,
  type Zodiac,
  type ZodiacId,
} from "../lib/zodiac";
import { getDailyFortuneIds, getFortuneText } from "../lib/fortune";
import { fetchZodiac, type AllZodiacData } from "../lib/data";
import {
  computeSpiritBeanScores,
  getRingAdjustment,
  getSpiritZodiacId,
} from "../lib/spiritBean";
import {
  addFortuneToHistory,
  clearFortuneHistory,
  getFortuneHistory,
  updateFortuneScore,
} from "../lib/fortuneHistory";
import { addMetBean, clearMetBeans } from "../lib/metBeans";
import Bean from "./Bean";
import BeanBadge from "./BeanBadge";
import FlavourBadge from "./FlavourBadge";
import FormBadge from "./FormBadge";
import ZodiacName from "./ZodiacName";

const FORTUNE_SEEN_KEY = "bean-zodiac-fortune-seen";

interface Props {
  data: AllZodiacData;
  date: Date;
  claimedSlug: ZodiacId;
  onRelinquish: () => void;
}

export default function ClaimedBeanResult({
  data,
  date,
  claimedSlug,
  onRelinquish,
}: Props) {
  const [flavourId, formId, beanId] = claimedSlug.split("-") as [
    FlavourId,
    FormId,
    BeanId,
  ];

  const bean = data.beans[beanId];
  const flavour = data.flavours[flavourId];
  const form = data.forms[formId];
  if (!bean || !flavour || !form) return null;

  const preparation = getPreparationName(flavourId, formId);
  const seasonalMeta = getZodiacMetadataForDate(date);
  const seasonalBean = data.beans[seasonalMeta.beanId];
  const seasonalFlavour = data.flavours[seasonalMeta.flavourId];
  const seasonalForm = data.forms[seasonalMeta.formId];
  const seasonalPreparation = getPreparationName(
    seasonalMeta.flavourId,
    seasonalMeta.formId,
  );
  const daysLeft = Math.ceil(
    (seasonalMeta.endDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
  const spiritScores = computeSpiritBeanScores(claimedSlug, yesterdayStr);
  const spiritSlug = getSpiritZodiacId(spiritScores);
  const { zodiacId: fortuneZodiacId, qualityId } = getDailyFortuneIds(
    date,
    spiritSlug,
  );
  const [fortuneFlavourId, fortuneFormId, fortuneBeanId] =
    fortuneZodiacId.split("-") as [FlavourId, FormId, BeanId];
  const fortuneBean = data.beans[fortuneBeanId];
  const fortunePreparation = getPreparationName(
    fortuneFlavourId,
    fortuneFormId,
  );

  const localDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const [seasonalZodiac, setSeasonalZodiac] = useState<Zodiac | null>(null);
  const [fortuneZodiac, setFortuneZodiac] = useState<Zodiac | null>(null);

  const [score, setScore] = useState(() => {
    const existing = getFortuneHistory().find((e) => e.date === localDateStr);
    return existing?.score ?? 0;
  });

  const [scored, setScored] = useState(() => {
    const existing = getFortuneHistory().find((e) => e.date === localDateStr);
    return (existing?.score ?? 0) !== 0;
  });

  const [dialogOpen, setDialogOpen] = useState(() => {
    const existing = getFortuneHistory().find((e) => e.date === localDateStr);
    if ((existing?.score ?? 0) !== 0) return false;
    const seenDate = localStorage.getItem(FORTUNE_SEEN_KEY);
    return seenDate !== localDateStr;
  });

  const [revealed, setRevealed] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [scoringOut, setScoringOut] = useState(false);
  const [showQuality, setShowQuality] = useState(() => {
    const existing = getFortuneHistory().find((e) => e.date === localDateStr);
    return (existing?.score ?? 0) !== 0;
  });
  const [qualityFading, setQualityFading] = useState(false);
  const [scoredText, setScoredText] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchZodiac(seasonalMeta.zodiacId),
      fetchZodiac(fortuneZodiacId),
    ]).then(([seasonal, fortune]) => {
      setSeasonalZodiac(seasonal);
      setFortuneZodiac(fortune);
      if (scored) setScoredText(buildScoredText(fortune.trait, score));
      addFortuneToHistory({
        date: localDateStr,
        zodiacId: fortuneZodiacId,
        qualityId,
        text: getFortuneText(fortune, qualityId),
        score: 0,
      });
      addMetBean(claimedSlug);
      addMetBean(seasonalMeta.zodiacId);
      addMetBean(fortuneZodiacId);
    });
  }, []);

  useEffect(() => {
    document.body.style.overflow = dialogOpen ? "hidden" : "";
    const layoutContent = document.getElementById("layout-content");
    if (layoutContent) {
      layoutContent.style.visibility = dialogOpen ? "hidden" : "";
    }
    return () => {
      document.body.style.overflow = "";
      if (layoutContent) layoutContent.style.visibility = "";
    };
  }, [dialogOpen]);

  const markSeen = () => {
    localStorage.setItem(FORTUNE_SEEN_KEY, localDateStr);
  };

  const buildScoredText = (trait: string, currentScore: number) => {
    const a = /^[aeiou]/i.test(trait) ? "an" : "a";
    const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    const adj = getRingAdjustment(currentScore, qualityId).chosen;
    if (currentScore === 0) {
      return pick([
        `You don't seem to be ${a} ${trait} bean...`,
        `You don't exhibit ${trait} bean qualities...`,
        `The ${trait} bean doesn't quite fit you...`,
        `You and the ${trait} bean are strangers...`,
      ]);
    }
    return adj >= 2
      ? pick([
          `You seem to be quite ${a} ${trait} bean...`,
          `The ${trait} bean runs deep in you...`,
          `You carry strong ${trait} bean energy...`,
          `You are unmistakably ${a} ${trait} bean...`,
        ])
      : adj === 1
        ? pick([
            `You may be a bit of ${a} ${trait} bean...`,
            `There's a hint of the ${trait} bean in you...`,
            `You show signs of the ${trait} bean...`,
            `The ${trait} bean flickers within you...`,
          ])
        : pick([
            `You're not a very ${trait} bean...`,
            `The ${trait} bean eludes you today...`,
            `You resist the pull of the ${trait} bean...`,
            `The ${trait} bean finds little in common with you...`,
          ]);
  };

  const applyQuality = () => {
    if (qualityId === "garden") {
      setShowQuality(true);
      return;
    }
    setQualityFading(true);
    setTimeout(() => {
      setShowQuality(true);
      setQualityFading(false);
    }, 400);
  };

  const handleScore = (v: number) => {
    setScoringOut(true);
    setTimeout(() => {
      const newScore = score === v ? 0 : v;
      updateFortuneScore(localDateStr, newScore);
      setScore(newScore);
      setScored(true);
      if (fortuneZodiac)
        setScoredText(buildScoredText(fortuneZodiac.trait, newScore));
      markSeen();
      applyQuality();
    }, 350);
  };

  const handleIgnore = () => {
    setScoringOut(true);
    setTimeout(() => {
      setScored(true);
      if (fortuneZodiac) setScoredText(buildScoredText(fortuneZodiac.trait, 0));
      markSeen();
      applyQuality();
    }, 350);
  };

  const handleClose = () => {
    if (revealed) markSeen();
    setDialogOpen(false);
  };

  const fortuneText = fortuneZodiac
    ? getFortuneText(fortuneZodiac, qualityId)
    : null;

  return (
    <>
      {dialogOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 p-4 flex items-center justify-center">
            <div className="max-w-lg w-full flex flex-col items-center gap-4">
              <div
                className="flex flex-col items-center gap-4"
                style={{
                  opacity: qualityFading ? 0 : 1,
                  transition: "opacity 0.4s",
                }}
              >
                <h2
                  className="mb-2 flex flex-col items-center font-bold text-center animate-fade-up"
                  style={{ animationDelay: "0ms" }}
                >
                  <span className="block text-md sm:text-xl mb-2 sm:mb-4">
                    The
                  </span>
                  <span className="block text-2xl sm:text-5xl mb-3 sm:mb-7">
                    <ZodiacName
                      flavourId={fortuneFlavourId}
                      formId={fortuneFormId}
                      beanId={fortuneBeanId}
                      preparation={fortunePreparation}
                      beanName={fortuneBean.name}
                      zodiacId={fortuneZodiacId}
                      qualityId={showQuality ? qualityId : undefined}
                      asLink={false}
                    />
                  </span>
                </h2>
                <div
                  className="mb-8 sm:mb-12 animate-fade-up max-w-36 sm:max-w-none"
                  style={{ animationDelay: "100ms" }}
                >
                  <Bean
                    bean={fortuneBean}
                    flavourId={fortuneFlavourId}
                    formId={fortuneFormId}
                    qualityId={showQuality ? qualityId : undefined}
                    maxHeight="8rem"
                  />
                </div>
              </div>

              <div
                className="relative w-full rounded-2xl p-[1.5px] overflow-hidden animate-fade-up shadow-2xl shadow-black/90"
                style={{ animationDelay: "200ms" }}
              >
                <div
                  className="absolute"
                  style={{
                    inset: "-200%",
                    background: `conic-gradient(from 0deg, var(--flavour-${fortuneZodiac?.flavour.id}), var(--form-${fortuneZodiac?.form.id}), var(--bean-${fortuneZodiac?.bean.id}), var(--flavour-${fortuneZodiac?.flavour.id}))`,
                    animation: "spin 10s linear infinite",
                  }}
                />
                <div className="relative w-full rounded-[calc(1rem-1.5px)] bg-zinc-900 p-4 flex flex-col items-center gap-4">
                  <p className="text-xs uppercase tracking-widest text-zinc-400">
                    Give us this day our daily bean
                  </p>
                  <button
                    onClick={handleClose}
                    aria-label="Close"
                    className="absolute top-3.5 right-3 text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer bg-transparent border-none text-base leading-none"
                  >
                    ✕
                  </button>

                  {fortuneZodiac ? (
                    <p className="text-zinc-300 text-sm sm:text-base text-center">
                      {fortuneZodiac.dish}
                    </p>
                  ) : (
                    <div className="h-4 w-48 bg-zinc-800 rounded-full animate-pulse" />
                  )}

                  {!revealed ? (
                    <button
                      onClick={() => {
                        setRevealing(true);
                        setTimeout(() => setRevealed(true), 350);
                      }}
                      disabled={!fortuneZodiac || revealing}
                      className="mt-2 px-4 py-2 rounded-full border border-white text-sm text-zinc-300 hover:text-zinc-100 transition-[colors,opacity] duration-350 cursor-pointer bg-transparent disabled:opacity-40 disabled:cursor-not-allowed font-semibold tracking-widest animate-pulse-gentle"
                      style={{ opacity: revealing ? 0 : 1 }}
                    >
                      RECEIVE THE BEAN'S WISDOM
                    </button>
                  ) : (
                    <>
                      {fortuneText ? (
                        <p className="italic text-zinc-200 text-center sm:text-base animate-fade-up mb-2">
                          "{fortuneText}"
                        </p>
                      ) : (
                        <div className="h-5 w-56 bg-zinc-800 rounded-full animate-pulse" />
                      )}

                      {!scored ? (
                        <div
                          className="flex flex-wrap justify-center gap-3 text-sm animate-fade-up transition-opacity duration-350"
                          style={{
                            opacity: scoringOut ? 0 : 1,
                            pointerEvents: scoringOut ? "none" : "auto",
                          }}
                        >
                          <button
                            onClick={() => handleScore(1)}
                            className="flex items-center gap-2 px-3 py-1 rounded-full border border-green-900 text-green-700 hover:border-green-700 hover:text-green-300 transition-colors cursor-pointer bg-transparent"
                          >
                            <span>🌱</span>
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleScore(-1)}
                            className="flex items-center gap-2 px-3 py-1 rounded-full border border-amber-900 text-amber-700 hover:border-amber-700 hover:text-amber-300 transition-colors cursor-pointer bg-transparent"
                          >
                            <span>🍂</span>
                            <span>Resist</span>
                          </button>
                          <button
                            onClick={handleIgnore}
                            className="flex items-center gap-2 px-3 py-1 rounded-full border border-blue-700 text-blue-500 hover:border-blue-500 hover:text-blue-300 transition-colors cursor-pointer bg-transparent"
                          >
                            <span>💤</span>
                            <span>Ignore</span>
                          </button>
                        </div>
                      ) : (
                        <div
                          key={scoredText}
                          className="flex flex-col items-center gap-4 animate-fade-up"
                        >
                          {scoredText && (
                            <p className="text-sm text-zinc-400 italic text-center mb-2">
                              {scoredText}
                            </p>
                          )}
                          <div className="flex items-center gap-6">
                            <a
                              href="/beanstalk"
                              className="text-sm text-zinc-400 hover:text-zinc-200 underline transition-colors"
                            >
                              The Beanstalk grows →
                            </a>
                            <button
                              onClick={handleClose}
                              aria-label="Close"
                              className="flex align-center text-zinc-500 hover:text-zinc-400 transition-colors cursor-pointer bg-transparent border-none text-sm leading-none"
                            >
                              Close ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <div className="flex flex-col items-center text-center gap-6 animate-fade-up">
        <section className="mb-8 sm:mb-12 max-w-2xl w-full flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 border-t border-zinc-600" />
            <span className="text-zinc-500 text-xs">✦</span>
            <div className="flex-1 border-t border-zinc-600" />
          </div>
          <p className="text-xs uppercase tracking-widest text-zinc-200 mb-2">
            You have received the Bean's Wisdom
          </p>
          <div className="flex flex-col gap-6 w-full">
            <div className="flex items-center gap-4 sm:gap-6 w-full">
              <a
                href={`/zodiacs/${fortuneZodiacId}`}
                className="shrink-0 block no-underline"
                style={{ width: "6rem" }}
              >
                <Bean
                  bean={fortuneBean}
                  flavourId={fortuneFlavourId}
                  formId={fortuneFormId}
                  qualityId={qualityId}
                />
              </a>
              <div className="relative flex flex-col items-start gap-2 min-w-0 overflow-hidden">
                <p className="text-sm sm:text-base font-bold uppercase tracking-widest text-zinc-200 text-left mb-2">
                  <ZodiacName
                    flavourId={fortuneFlavourId}
                    formId={fortuneFormId}
                    beanId={fortuneBeanId}
                    preparation={fortunePreparation}
                    beanName={fortuneBean.name}
                    zodiacId={fortuneZodiacId}
                    qualityId={qualityId}
                  />
                </p>
                {fortuneText ? (
                  <p className="italic text-zinc-200 sm:text-lg text-left mb-1 sm:mb-2">
                    "{fortuneText}"
                  </p>
                ) : (
                  <div className="h-5 w-56 bg-zinc-800 rounded-full animate-pulse mb-1 sm:mb-2" />
                )}
                {!dialogOpen && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm ${
                      score === 1
                        ? "border-green-800 text-green-200"
                        : score === -1
                          ? "border-amber-800 text-amber-200"
                          : "border-blue-700 text-blue-500"
                    }`}
                  >
                    <span>
                      {score === 1 ? "🌱" : score === -1 ? "🍂" : "💤"}
                    </span>
                    <span>
                      {score === 1
                        ? "Accepted"
                        : score === -1
                          ? "Resisted"
                          : "Ignored"}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 border-t border-zinc-600" />
            <span className="text-zinc-500 text-xs">✦</span>
            <div className="flex-1 border-t border-zinc-600" />
          </div>
        </section>
        <section className="flex flex-col items-center gap-2">
          <h2 className="mb-2 flex flex-col items-center font-bold">
            <span className="block text-md sm:text-xl mb-2 sm:mb-4">
              You are the
            </span>
            <span className="block text-4xl sm:text-7xl mb-3 sm:mb-7">
              <ZodiacName
                flavourId={flavourId}
                formId={formId}
                beanId={beanId}
                preparation={preparation}
                beanName={bean.name}
              />
            </span>
          </h2>
          <div className="mb-6 sm:mb-8">
            <Bean bean={bean} flavourId={flavour.slug} formId={form.slug} />
          </div>
          <div className="flex flex-row flex-wrap justify-center items-center gap-2 text-sm text-zinc-400 mb-4 sm:mb-6">
            <a
              href="/beaniary"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline text-zinc-300"
            >
              🫘&nbsp; The Beaniary
            </a>
            <a
              href="/beanstalk"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline text-zinc-300"
            >
              🪴&nbsp; The Beanstalk
            </a>
            <a
              href={`/zodiacs/${claimedSlug}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border-2 border-zinc-700 hover:border-zinc-500 transition-colors no-underline text-zinc-300"
            >
              👤&nbsp; About Me
            </a>
          </div>
          <section className="mt-6 sm:mt-8 max-w-3xl w-full flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 border-t border-zinc-600" />
              <span className="text-zinc-500 text-xs">✦</span>
              <div className="flex-1 border-t border-zinc-600" />
            </div>
            <p className="text-xs uppercase tracking-widest text-zinc-200">
              {seasonalZodiac ? (
                `We are in the ${seasonalZodiac.trait} Season of the`
              ) : (
                <span className="inline-block h-4 w-48 bg-zinc-800 rounded-full animate-pulse" />
              )}
            </p>
            <p className="text-sm sm:text-lg font-bold uppercase tracking-widest text-zinc-200 text-left mb-2">
              <ZodiacName
                flavourId={seasonalMeta.flavourId}
                formId={seasonalMeta.formId}
                beanId={seasonalMeta.beanId}
                preparation={seasonalPreparation}
                beanName={seasonalBean?.name ?? ""}
                zodiacId={seasonalMeta.zodiacId}
              />
            </p>
            {seasonalBean && (
              <div className="my-2 sm:my-4" style={{ width: "7rem" }}>
                <Bean
                  bean={seasonalBean}
                  flavourId={seasonalMeta.flavourId}
                  formId={seasonalMeta.formId}
                />
              </div>
            )}
            {seasonalZodiac ? (
              <p className="italic text-zinc-200 sm:text-lg text-center px-4">
                "{seasonalZodiac.seasonalFortune}"
              </p>
            ) : (
              <div className="h-5 w-64 bg-zinc-800 rounded-full animate-pulse" />
            )}
            <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-zinc-400 my-2 sm:my-4">
              <FlavourBadge
                id={seasonalMeta.flavourId}
                name={seasonalFlavour?.name ?? seasonalMeta.flavourId}
                label="Phase"
              />
              <span className="text-zinc-600">×</span>
              <FormBadge
                id={seasonalMeta.formId}
                name={seasonalForm?.name ?? seasonalMeta.formId}
                label="Season"
              />
              <span className="text-zinc-600">×</span>
              <BeanBadge
                id={seasonalMeta.beanId}
                name={seasonalBean?.name ?? seasonalMeta.beanId}
                label="Year"
              />
            </div>
            <p className="text-sm text-zinc-400">
              Ends in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 border-t border-zinc-600" />
              <span className="text-zinc-500 text-xs">✦</span>
              <div className="flex-1 border-t border-zinc-600" />
            </div>
          </section>
          <div className="mt-8">
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to relinquish your Bean? Your Beaniary, Legunomicon and Spirit Bean will be reset.",
                  )
                ) {
                  clearFortuneHistory();
                  clearMetBeans();
                  localStorage.removeItem(FORTUNE_SEEN_KEY);
                  onRelinquish();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer bg-transparent text-sm"
            >
              Relinquish your Bean <span className="text-xs">✕</span>
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
