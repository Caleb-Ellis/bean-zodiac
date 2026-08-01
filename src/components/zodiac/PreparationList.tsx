import FlavourBadge from "./FlavourBadge";
import FormBadge from "./FormBadge";
import PreparationName from "./PreparationName";
import TraitBadge from "./TraitBadge";
import { allZodiacData, preparationsFor } from "../../lib/data";
import type { FlavourId, FormId } from "../../lib/zodiac";

interface Props {
  /** Which axis the page is for — the other axis is what varies down the list. */
  axis: "flavour" | "form";
  id: FlavourId | FormId;
}

export default function PreparationList({ axis, id }: Props) {
  const preparations = preparationsFor(axis, id);

  return (
    <section className="flex flex-col gap-4">
      <ul className="flex flex-col gap-4 list-none p-0 m-0">
        {preparations.map((preparation) => {
          const flavour = allZodiacData.flavours[preparation.flavour];
          const form = allZodiacData.forms[preparation.form];
          return (
            <li
              key={preparation.slug}
              className="flex flex-col gap-2 rounded-xl bg-zinc-950/40 border border-zinc-800 p-4"
            >
              <h3 className="text-lg font-semibold">
                <PreparationName
                  flavourId={preparation.flavour}
                  formId={preparation.form}
                  name={preparation.name}
                />
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-zinc-500">
                <FlavourBadge id={flavour.slug} name={flavour.name} small />
                <span aria-hidden="true">×</span>
                <FormBadge id={form.slug} name={form.name} small />
              </div>
              <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0">
                {preparation.positiveTraits.map((trait) => (
                  <TraitBadge key={trait} trait={trait} />
                ))}
                {preparation.negativeTraits.map((trait) => (
                  <TraitBadge key={trait} trait={trait} shadow />
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
