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

  if (!claimedSlug) return null;

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
      <div className="mt-2 flex flex-col items-center gap-3 border-t border-zinc-800 pt-5">
        <div className="flex flex-wrap gap-4">
          <button onClick={exportData} className={pillClass}>
            Export Data <span className="text-xs">↓</span>
          </button>
          <button
            onClick={() => fileInput.current?.click()}
            className={pillClass}
          >
            Import Data <span className="text-xs">↑</span>
          </button>
          <button onClick={handleRelinquish} className={dangerPillClass}>
            Relinquish Bean <span className="text-xs">✕</span>
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          onChange={handleImportFile}
          className="hidden"
        />
        {error && <p className="text-sm text-zinc-400">{error}</p>}
      </div>
    </ZodiacDetail>
  );
}
