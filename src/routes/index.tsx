import { createFileRoute } from "@tanstack/react-router";
import HomePage from "../components/pages/HomePage";
import { allZodiacData } from "../lib/data";

export const Route = createFileRoute("/")({
  component: () => (
    <section className="animate-fade-up flex flex-col items-center my-6 sm:my-12">
      <HomePage data={allZodiacData} showFortune />
    </section>
  ),
});
