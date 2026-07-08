import { useEffect, useState } from "react";
import {
  getZodiacMetadataForDate,
  type ZodiacId,
} from "../../../lib/zodiac";
import { type AllZodiacData } from "../../../lib/data";
import { getSeasonSummary } from "../../../lib/seasonSummary";
import { useStore } from "../../../store";
import ClaimedHomeContent from "./ClaimedHomeContent";
import FortuneDialog from "./FortuneDialog";
import SeasonSummaryDialog from "./SeasonSummaryDialog";
import { useDailyFortune } from "./useDailyFortune";

function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

interface Props {
  data: AllZodiacData;
  date: Date;
  claimedSlug: ZodiacId;
  onRelinquish: () => void;
}

export default function ClaimedHome({ data, date, claimedSlug, onRelinquish }: Props) {
  const fortune = useDailyFortune(date, claimedSlug);
  const seasonalZodiacId = getZodiacMetadataForDate(date).zodiacId;

  // Compute the pending season summary once on mount. getSeasonSummary reads
  // fortuneHistory + claimed from the store and returns null unless a season has
  // ticked over since lastSeasonSeen and the past season met the entry bar.
  const currentSeasonKey = formatLocalDate(
    getZodiacMetadataForDate(date).startDate,
  );
  const [summary] = useState(() =>
    getSeasonSummary(date, useStore.getState().lastSeasonSeen),
  );
  const [summaryOpen, setSummaryOpen] = useState(() => !!summary);

  // Persist the summary immediately (so its Beanstalk marker survives even if the
  // user leaves mid-reveal); when there's nothing to recap, just record that this
  // season has been acknowledged.
  useEffect(() => {
    const store = useStore.getState();
    if (summary) {
      store.addSeasonSummary(summary);
    } else {
      store.setLastSeasonSeen(currentSeasonKey);
    }
  }, [summary, currentSeasonKey]);

  useEffect(() => {
    const { addMetBean } = useStore.getState();
    addMetBean(claimedSlug);
    addMetBean(seasonalZodiacId);
    addMetBean(fortune.fortuneZodiacId);
  }, [claimedSlug, seasonalZodiacId, fortune.fortuneZodiacId]);

  const handleSummaryClose = () => {
    useStore.getState().setLastSeasonSeen(currentSeasonKey);
    setSummaryOpen(false);
  };

  return (
    <>
      {summary && summaryOpen ? (
        <SeasonSummaryDialog
          data={data}
          summary={summary}
          onClose={handleSummaryClose}
        />
      ) : (
        fortune.dialogOpen && <FortuneDialog data={data} fortune={fortune} />
      )}
      <ClaimedHomeContent
        data={data}
        date={date}
        claimedSlug={claimedSlug}
        onRelinquish={onRelinquish}
      />
    </>
  );
}
