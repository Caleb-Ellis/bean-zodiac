import { useState, useEffect } from "react";
import Divider from "../ui/Divider";
import {
  type BeanId,
  type FlavourId,
  type FormId,
  type ZodiacId,
  getPreparationName,
} from "../../lib/zodiac";

import { type AllZodiacData } from "../../lib/data";
import { useStore } from "../../store";
import {
  computeSpiritBeanScores,
  buildBeanstalkNodes,
  getSpiritDiff,
  getSpiritZodiacId,
  getAlignmentText,
  SPIRIT_FLAVOUR_RING,
  SPIRIT_FORM_RING,
  SPIRIT_BEAN_RING,
  type BeanstalkNode,
} from "../../lib/spiritBean";
import Beanstalk from "./beanstalk/Beanstalk";
import { FlavourRadar, FormRadar, BeanRadar } from "../zodiac/SpiritBeanRadars";
import MiniIdentity from "../zodiac/MiniIdentity";

interface Props {
  data: AllZodiacData;
}

export default function BeanstalkPage({ data }: Props) {
  const [claimedSlug] = useState<ZodiacId | null>(
    () => useStore.getState().claimed?.id ?? null,
  );
  const [scores] = useState<ReturnType<typeof computeSpiritBeanScores> | null>(
    () => (claimedSlug ? computeSpiritBeanScores(claimedSlug) : null),
  );
  const [beanstalkNodes] = useState<BeanstalkNode[]>(() =>
    claimedSlug ? buildBeanstalkNodes(claimedSlug) : [],
  );

  useEffect(() => {
    if (!scores) return;
    useStore.getState().addMetBean(getSpiritZodiacId(scores));
  }, []);

  if (claimedSlug === null) {
    return (
      <div className="flex flex-col items-center gap-4 mt-16 text-center animate-fade-up">
        <p className="text-zinc-400">You haven't claimed a Bean yet.</p>
        <a
          href="/wheel"
          className="bg-zinc-900/80 border-2 border-zinc-500/60 text-white rounded-xl px-8 py-4 font-bold backdrop-blur-sm transition-[border-color,background-color,color] duration-200 hover:border-zinc-400 hover:text-white hover:bg-zinc-800/80"
        >
          Consult the wheel to find yours&nbsp;→
        </a>
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
          <h1 className="text-4xl sm:text-6xl font-bold">The Beanstalk</h1>
          <p className="mt-4 text-lg text-zinc-300 max-w-xl mx-auto">
            A record of all Bean Wisdom you've received — and a chart of how far
            you've drifted from the Bean you claimed.
          </p>
        </div>

        <div className="max-w-6xl w-full mb-4">
          <Divider />
        </div>

        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4">Spirit Bean</h1>
          <p className="text-zinc-400 mt-3 mb-4 sm:mb-6">
            Your current affinity with each element of the Bean Zodiac.
          </p>
        </div>
        {scores && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-16 w-full">
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
              const spiritFlavourId =
                SPIRIT_FLAVOUR_RING[scores.flavourHighlight];
              const spiritFormId = SPIRIT_FORM_RING[scores.formHighlight];
              const spiritBeanId = SPIRIT_BEAN_RING[scores.beanHighlight];
              const isDifferent =
                spiritFlavourId !== flavourId ||
                spiritFormId !== formId ||
                spiritBeanId !== beanId;

              return (
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
                  {isDifferent && (
                    <div className="flex flex-col items-center gap-3 flex-1">
                      <p className="text-sm text-zinc-500 uppercase tracking-widest mb-4">
                        Your spirit is a
                      </p>
                      <MiniIdentity
                        beanId={spiritBeanId}
                        beanName={data.beans[spiritBeanId].name}
                        preparation={getPreparationName(
                          spiritFlavourId,
                          spiritFormId,
                        )}
                        bean={data.beans[spiritBeanId]}
                        flavourId={spiritFlavourId}
                        formId={spiritFormId}
                      />
                    </div>
                  )}
                </div>
              );
            })()}
            <p className="text-lg sm:text-xl font-bold text-zinc-300 text-center">
              {getAlignmentText(getSpiritDiff(scores))}
            </p>
          </>
        )}

        <div className="max-w-6xl w-full">
          <Divider />
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
