import { useEffect } from "react";
import { getZodiacMetadataForDate, type ZodiacId } from "../../../lib/zodiac";
import { type AllZodiacData } from "../../../lib/data";
import { useStore } from "../../../store";
import ClaimedHomeContent from "./ClaimedHomeContent";
import FortuneDialog from "./FortuneDialog";
import { useDailyFortune } from "./useDailyFortune";

interface Props {
  data: AllZodiacData;
  date: Date;
  claimedSlug: ZodiacId;
  onRelinquish: () => void;
}

export default function ClaimedHome({ data, date, claimedSlug, onRelinquish }: Props) {
  const fortune = useDailyFortune(date, claimedSlug);
  const seasonalZodiacId = getZodiacMetadataForDate(date).zodiacId;

  useEffect(() => {
    const { addMetBean } = useStore.getState();
    addMetBean(claimedSlug);
    addMetBean(seasonalZodiacId);
    addMetBean(fortune.fortuneZodiacId);
  }, [claimedSlug, seasonalZodiacId, fortune.fortuneZodiacId]);

  return (
    <>
      {fortune.dialogOpen && <FortuneDialog data={data} fortune={fortune} />}
      <ClaimedHomeContent
        data={data}
        date={date}
        claimedSlug={claimedSlug}
        onRelinquish={onRelinquish}
      />
    </>
  );
}
