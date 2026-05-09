import { createFileRoute } from "@tanstack/react-router";
import WheelPage from "../components/pages/WheelPage";
import { allZodiacData } from "../lib/data";

export const Route = createFileRoute("/wheel")({
  component: () => (
    <div className="animate-fade-up">
      <section className="text-center py-8">
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
          Consult the Wheel
        </h1>
      </section>
      <section className="border-zinc-800 flex flex-col items-center">
        <WheelPage data={allZodiacData} />
      </section>
    </div>
  ),
});
