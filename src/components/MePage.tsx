import { useState, useEffect } from "react";
import {
  type BeanId,
  type FlavourId,
  type FormId,
  type ZodiacId,
  BEAN_ORDER,
  FLAVOUR_ORDER,
  FORM_ORDER,
  getPreparationName,
} from "../lib/zodiac";

import { type AllZodiacData } from "../lib/data";
import { getClaimedBeanSlug } from "../lib/claimedBean";
import { addMetBean } from "../lib/metBeans";
import {
  computeSpiritBeanScores,
  buildBeanstalkNodes,
  getSpiritDiff,
  getAlignmentText,
  type BeanstalkNode,
} from "../lib/spiritBean";
import Beanstalk from "./Beanstalk";
import { FlavourRadar, FormRadar, BeanRadar } from "./SpiritBeanRadars";
import MiniIdentity from "./MiniIdentity";

interface Props {
  data: AllZodiacData;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin" />
    </div>
  );
}

export default function MePage({ data }: Props) {
  const [mounted, setMounted] = useState(false);
  const [claimedSlug] = useState<ZodiacId | null>(() => {
    if (typeof window === "undefined") return null;
    return getClaimedBeanSlug();
  });
  const [scores] = useState<ReturnType<typeof computeSpiritBeanScores> | null>(
    () => {
      if (typeof window === "undefined") return null;
      const slug = getClaimedBeanSlug();
      return slug ? computeSpiritBeanScores(slug) : null;
    },
  );
  const [beanstalkNodes] = useState<BeanstalkNode[]>(() => {
    if (typeof window === "undefined") return [];
    const slug = getClaimedBeanSlug();
    return slug ? buildBeanstalkNodes(slug) : [];
  });

  useEffect(() => {
    setMounted(true);
    if (!scores) return;
    const spiritZodiacId = `${FLAVOUR_ORDER[scores.flavourHighlight]}-${FORM_ORDER[scores.formHighlight]}-${BEAN_ORDER[scores.beanHighlight]}` as ZodiacId;
    addMetBean(spiritZodiacId);
  }, []);

  if (!mounted) return <Spinner />;

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

  const [flavourId, formId, beanId] = claimedSlug.split("-") as [
    FlavourId,
    FormId,
    BeanId,
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Beanstalk */}
      <section id="beanstalk" className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-4">The Beanstalk</h1>
        </div>

        <div className="flex items-center gap-3 max-w-6xl w-full mb-4">
          <div className="flex-1 border-t border-zinc-600" />
          <span className="text-zinc-500 text-xs">✦</span>
          <div className="flex-1 border-t border-zinc-600" />
        </div>

        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4">Spirit Bean</h1>
          <p className="text-zinc-400 mt-3 mb-4 sm:mb-6">
            Your current affinity with each element of the Bean Zodiac.
          </p>
        </div>
        {scores && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 w-full">
              <div className="flex flex-col items-center">
                <p className="text-sm text-zinc-400 uppercase tracking-widest">
                  Flavour
                </p>
                <FlavourRadar
                  data={data}
                  claimedId={flavourId}
                  values={scores.flavourValues}
                  highlightIndex={scores.flavourHighlight}
                  showLinks
                />
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm text-zinc-400 uppercase tracking-widest">
                  Form
                </p>
                <FormRadar
                  data={data}
                  claimedId={formId}
                  values={scores.formValues}
                  highlightIndex={scores.formHighlight}
                  showLinks
                />
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm text-zinc-400 uppercase tracking-widest">
                  Bean
                </p>
                <BeanRadar
                  data={data}
                  claimedId={beanId}
                  values={scores.beanValues}
                  highlightIndex={scores.beanHighlight}
                  showLinks
                />
              </div>
            </div>
            {(() => {
              const spiritFlavourId = FLAVOUR_ORDER[scores.flavourHighlight];
              const spiritFormId = FORM_ORDER[scores.formHighlight];
              const spiritBeanId = BEAN_ORDER[scores.beanHighlight];
              const isDifferent =
                spiritFlavourId !== flavourId ||
                spiritFormId !== formId ||
                spiritBeanId !== beanId;

              return isDifferent ? (
                <div className="flex flex-col sm:flex-row gap-12 sm:gap-8 justify-center items-center sm:items-start w-full max-w-2xl my-4">
                  <div className="flex flex-col items-center gap-3 flex-1">
                    <p className="text-sm text-zinc-500 uppercase tracking-widest mb-4">
                      You were born a
                    </p>
                    <MiniIdentity
                      beanId={beanId}
                      beanName={data.beans[beanId].name}
                      preparation={getPreparationName(flavourId, formId)}
                      bean={data.beans[beanId]}
                      flavourId={flavourId}
                      formId={formId}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-3 flex-1">
                    <p className="text-sm text-zinc-500 uppercase tracking-widest mb-4">
                      Your spirit is a
                    </p>
                    <MiniIdentity
                      beanId={spiritBeanId}
                      beanName={data.beans[spiritBeanId].name}
                      preparation={getPreparationName(spiritFlavourId, spiritFormId)}
                      bean={data.beans[spiritBeanId]}
                      flavourId={spiritFlavourId}
                      formId={spiritFormId}
                    />
                  </div>
                </div>
              ) : null;
            })()}
            <p className="text-lg sm:text-xl font-bold text-zinc-300 text-center">
              {getAlignmentText(getSpiritDiff(scores))}
            </p>
          </>
        )}

        <div className="flex items-center gap-3 max-w-6xl w-full">
          <div className="flex-1 border-t border-zinc-600" />
          <span className="text-zinc-500 text-xs">✦</span>
          <div className="flex-1 border-t border-zinc-600" />
        </div>

        {scores && claimedSlug && (
          <Beanstalk
            nodes={beanstalkNodes}
            currentScores={scores}
            data={data}
            claimedSlug={claimedSlug}
          />
        )}
      </section>
    </div>
  );
}
