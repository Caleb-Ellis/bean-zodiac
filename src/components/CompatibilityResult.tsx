import {
  getBeanCompatibility,
  getFlavourCompatibility,
  getFormCompatibility,
  getSpecialCompatibilityDetail,
  getTotalCompatibility,
} from "../lib/compatibility";
import {
  getPreparationName,
  type BeanId,
  type FlavourId,
  type FormId,
} from "../lib/zodiac";
import { type AllZodiacData } from "../lib/data";
import BeanBadge from "./BeanBadge";
import FlavourBadge from "./FlavourBadge";
import FormBadge from "./FormBadge";
import MiniIdentity from "./MiniIdentity";

export type MetaSlice = {
  beanId: BeanId;
  flavourId: FlavourId;
  formId: FormId;
};

export const CALCULATING_TEXTS = [
  "Consulting Bean astrologers...",
  "Divining broth...",
  "Reading pod lines...",
  "Steeping results...",
  "Consulting ancient legume scrolls...",
  "Referencing harvest charts...",
  "Asking elders of the pod...",
];

export const REVEAL_STEP_MS = 320;
export const CALC_VISIBLE_MS = 1600;
export const CALC_FADE_MS = 400;
export const CALC_CYCLE_MS = CALC_VISIBLE_MS + CALC_FADE_MS;
export const CALC_NUM_TEXTS = 2;

export function scoreColor(score: number): string {
  if (score >= 4) return "text-effect-gold";
  if (score === 3) return "text-effect-emerald";
  if (score === 2) return "text-emerald-400";
  if (score === 1) return "text-green-500";
  if (score === 0) return "text-zinc-400";
  if (score === -1) return "text-red-400";
  if (score === -2) return "text-effect-bruise";
  return "text-effect-rot";
}

function attrBadge(
  attr: "bean" | "flavour" | "form",
  meta: MetaSlice,
  bean: { name: string },
  flavour: { name: string },
  form: { name: string },
) {
  if (attr === "bean")
    return <BeanBadge small id={meta.beanId} name={bean.name} />;
  if (attr === "flavour")
    return <FlavourBadge small id={meta.flavourId} name={flavour.name} />;
  return <FormBadge small id={meta.formId} name={form.name} />;
}

function DimensionRow({
  label,
  compat,
  badgeA,
  badgeB,
}: {
  label: string;
  compat: { score: number; label: string; description: string };
  badgeA: React.ReactNode;
  badgeB: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900/80 border-2 border-zinc-800 rounded-xl px-5 py-4 flex items-center gap-4">
      <div className="flex flex-col items-center gap-1 w-20 shrink-0">
        <span className="text-xs uppercase tracking-widest text-zinc-500">
          {label}
        </span>
        <span className={`text-lg font-bold ${scoreColor(compat.score)}`}>
          {compat.score > 0 ? `+${compat.score}` : compat.score}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-white text-sm text-left">
          {compat.label}
        </span>
        <span className="flex items-center gap-1 text-xs my-1.5 flex-wrap">
          {badgeA}
          <span className="text-zinc-600">×</span>
          {badgeB}
        </span>
        <span className="text-zinc-400 text-sm text-left">
          {compat.description}
        </span>
      </div>
    </div>
  );
}

export function CompatibilityResult({
  data,
  metaA,
  metaB,
  revealedCount,
  calculatingText,
  calculatingVisible,
}: {
  data: AllZodiacData;
  metaA: MetaSlice;
  metaB: MetaSlice;
  revealedCount: number;
  calculatingText: string | null;
  calculatingVisible: boolean;
}) {
  const beanA = data.beans[metaA.beanId];
  const flavourA = data.flavours[metaA.flavourId];
  const formA = data.forms[metaA.formId];

  const beanB = data.beans[metaB.beanId];
  const flavourB = data.flavours[metaB.flavourId];
  const formB = data.forms[metaB.formId];

  const prepA = getPreparationName(metaA.flavourId, metaA.formId);
  const prepB = getPreparationName(metaB.flavourId, metaB.formId);

  const beanCompat = getBeanCompatibility(metaA.beanId, metaB.beanId);
  const flavourCompat = getFlavourCompatibility(
    metaA.flavourId,
    metaB.flavourId,
  );
  const formCompat = getFormCompatibility(metaA.formId, metaB.formId);
  const specialDetail = getSpecialCompatibilityDetail(metaA, metaB);
  const total = getTotalCompatibility(metaA, metaB);

  return (
    <div className="flex flex-col items-center gap-6 w-full animate-fade-up">
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center sm:items-start w-full max-w-2xl">
        <MiniIdentity
          beanId={metaA.beanId}
          beanName={beanA.name}
          preparation={prepA}
          bean={beanA}
          flavourId={metaA.flavourId}
          formId={metaA.formId}
        />
        <div className="flex items-center self-center text-zinc-600 text-3xl font-thin">
          ×
        </div>
        <MiniIdentity
          beanId={metaB.beanId}
          beanName={beanB.name}
          preparation={prepB}
          bean={beanB}
          flavourId={metaB.flavourId}
          formId={metaB.formId}
        />
      </div>

      <div className="relative h-0 w-full mt-4">
        {calculatingText && (
          <p
            className={`absolute inset-x-0 text-center text-zinc-300 text-lg italic transition-opacity duration-400 ${
              calculatingVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {calculatingText}
          </p>
        )}
      </div>

      {revealedCount >= 1 && (
        <div className="w-full max-w-lg flex flex-col gap-3">
          <div className="animate-fade-up">
            <DimensionRow
              label="Flavour"
              compat={flavourCompat}
              badgeA={
                <FlavourBadge small id={metaA.flavourId} name={flavourA.name} />
              }
              badgeB={
                <FlavourBadge small id={metaB.flavourId} name={flavourB.name} />
              }
            />
          </div>
          {revealedCount >= 2 && (
            <div className="animate-fade-up">
              <DimensionRow
                label="Form"
                compat={formCompat}
                badgeA={<FormBadge small id={metaA.formId} name={formA.name} />}
                badgeB={<FormBadge small id={metaB.formId} name={formB.name} />}
              />
            </div>
          )}
          {revealedCount >= 3 && (
            <div className="animate-fade-up">
              <DimensionRow
                label="Bean"
                compat={beanCompat}
                badgeA={<BeanBadge small id={metaA.beanId} name={beanA.name} />}
                badgeB={<BeanBadge small id={metaB.beanId} name={beanB.name} />}
              />
            </div>
          )}
          {revealedCount >= 4 && specialDetail && (
            <div className="animate-fade-up">
              <DimensionRow
                label="Special"
                compat={specialDetail.entry}
                badgeA={attrBadge(
                  specialDetail.attrA,
                  metaA,
                  beanA,
                  flavourA,
                  formA,
                )}
                badgeB={attrBadge(
                  specialDetail.attrB,
                  metaB,
                  beanB,
                  flavourB,
                  formB,
                )}
              />
            </div>
          )}
        </div>
      )}

      {revealedCount >= 4 && (
        <div className="animate-fade-up bg-zinc-900/80 border-2 border-zinc-700/60 rounded-xl px-6 py-5 my-4 max-w-lg w-full text-center">
          <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2">
            Overall
          </p>
          <p className="text-2xl sm:text-3xl font-bold mb-2">
            <span className={scoreColor(total.score)}>{total.label}</span>
          </p>
          <p className="text-zinc-300 text-sm">{total.description}</p>
        </div>
      )}
    </div>
  );
}
