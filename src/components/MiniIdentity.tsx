import type { BeanId, FlavourId, FormId } from "../lib/zodiac";
import type { AllZodiacData } from "../lib/data";
import Bean from "./Bean";
import ZodiacName from "./ZodiacName";

type Props = {
  beanName: string;
  preparation: string;
  bean: AllZodiacData["beans"][BeanId];
  flavourId: FlavourId;
  formId: FormId;
  beanId: BeanId;
};

export default function MiniIdentity({
  beanName,
  preparation,
  bean,
  flavourId,
  formId,
  beanId,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-7 flex-1 text-center">
      <div className="h-48 flex items-center justify-center">
        <Bean bean={bean} flavourId={flavourId} formId={formId} />
      </div>
      <p className="font-bold text-lg leading-tight">
        <ZodiacName
          flavourId={flavourId}
          formId={formId}
          beanId={beanId}
          preparation={preparation}
          beanName={beanName}
        />
      </p>
    </div>
  );
}
