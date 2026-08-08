import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import ZodiacDetail from "../zodiac/ZodiacDetail";
import { exportData, importData } from "../../lib/backup";
import { useStore } from "../../store";
import type { ZodiacId } from "../../lib/zodiac";

const pillClass =
  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer bg-transparent text-sm";

const dangerPillClass =
  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-red-900/70 hover:border-red-700 text-red-400/80 hover:text-red-300 transition-colors cursor-pointer bg-transparent text-sm";

export default function MePage() {
  const navigate = useNavigate();
  const [claimedSlug] = useState<ZodiacId | null>(
    () => useStore.getState().claimed?.id ?? null,
  );
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  if (!claimedSlug) {
    return (
      <div className="flex flex-col items-center gap-4 mt-28 text-center animate-fade-up">
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

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Clear the input so re-picking the same file fires change again.
    e.target.value = "";
    if (!file) return;

    setError(null);
    if (
      !window.confirm(
        "Importing will replace everything currently stored in this browser. Continue?",
      )
    ) {
      return;
    }

    const result = importData(await file.text());
    if (!result.ok) {
      setError(result.error);
      return;
    }
    location.reload();
  };

  const handleRelinquish = () => {
    if (
      window.confirm(
        "Are you sure you want to relinquish your Bean? Your Beaniary, Beanstalk and Spirit Bean will be lost permanently.",
      )
    ) {
      useStore.getState().relinquish();
      navigate({ to: "/" });
    }
  };

  return (
    <ZodiacDetail id={claimedSlug}>
      <div className="mt-2 flex flex-col gap-3 border-t border-zinc-800 pt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex justify-between gap-4 sm:justify-start">
            <button onClick={exportData} className={pillClass}>
              Export Data <span className="text-xs">↓</span>
            </button>
            <button
              onClick={() => fileInput.current?.click()}
              className={pillClass}
            >
              Import Data <span className="text-xs">↑</span>
            </button>
          </div>
          <hr className="border-zinc-800 sm:hidden" />
          <div className="flex justify-end">
            <button onClick={handleRelinquish} className={dangerPillClass}>
              Relinquish Bean <span className="text-xs">✕</span>
            </button>
          </div>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          onChange={handleImportFile}
          className="hidden"
        />
        {error && <p className="text-center text-sm text-zinc-400">{error}</p>}
      </div>
    </ZodiacDetail>
  );
}
