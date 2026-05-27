interface Props {
  fortuneTitle: string | null;
  fortuneText: string | null;
  landed: boolean;
  handleScore: (v: number) => void;
}

export default function FacetVariant({
  fortuneTitle,
  fortuneText,
  landed,
  handleScore,
}: Props) {
  return (
    <>
      {fortuneTitle ? (
        <p
          className={`font-bold text-zinc-200 text-center ${landed ? "animate-fade-up" : "opacity-0"}`}
          style={
            landed
              ? { animationDelay: "150ms", animationDuration: "500ms" }
              : undefined
          }
        >
          {fortuneTitle}
        </p>
      ) : (
        <div className="h-3 w-32 bg-zinc-800 rounded-full animate-pulse" />
      )}
      {fortuneText ? (
        <p
          className={`text-zinc-200 text-center sm:text-base mb-2 ${landed ? "animate-fade-up" : "opacity-0"}`}
          style={
            landed
              ? { animationDelay: "400ms", animationDuration: "500ms" }
              : undefined
          }
        >
          {fortuneText}
        </p>
      ) : (
        <div className="h-5 w-56 bg-zinc-800 rounded-full animate-pulse" />
      )}
      <div
        className={`flex flex-wrap justify-center gap-4 text-sm ${landed ? "animate-fade-up" : "opacity-0"}`}
        style={
          landed
            ? { animationDelay: "700ms", animationDuration: "500ms" }
            : undefined
        }
      >
        <button
          onClick={() => handleScore(1)}
          className="flex items-center gap-2 px-3 py-1 rounded-full border border-green-700 text-green-300 hover:bg-[#042012] hover:border-green-600 transition-colors cursor-pointer bg-transparent"
        >
          <span>🌱</span>
          <span>Accept</span>
        </button>
        <button
          onClick={() => handleScore(-1)}
          className="flex items-center gap-2 px-3 py-1 rounded-full border border-amber-700 text-amber-300 hover:bg-[#261503] hover:border-amber-600 transition-colors cursor-pointer bg-transparent"
        >
          <span>🍂</span>
          <span>Resist</span>
        </button>
      </div>
    </>
  );
}
