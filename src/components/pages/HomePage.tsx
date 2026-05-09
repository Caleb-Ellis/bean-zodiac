import { useState } from "react";
import { type AllZodiacData } from "../../lib/data";
import { useStore } from "../../store";
import type { ZodiacId } from "../../lib/zodiac";
import ClaimedHome from "./home/ClaimedHome";
import UnclaimedHome from "./home/UnclaimedHome";

interface Props {
  data: AllZodiacData;
  showContent?: boolean;
  showFortune?: boolean;
  showQuote?: boolean;
}

export default function HomePage({ data, showContent, showFortune, showQuote }: Props) {
  const [date] = useState(() => new Date());
  const [claimedSlug, setClaimedSlug] = useState<ZodiacId | null>(
    () => useStore.getState().claimed?.id ?? null,
  );

  if (claimedSlug) {
    return (
      <ClaimedHome
        data={data}
        date={date}
        claimedSlug={claimedSlug}
        onRelinquish={() => setClaimedSlug(null)}
      />
    );
  }

  return (
    <UnclaimedHome
      data={data}
      date={date}
      showContent={showContent}
      showFortune={showFortune}
      showQuote={showQuote}
    />
  );
}
