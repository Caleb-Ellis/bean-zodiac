import { createFileRoute } from "@tanstack/react-router";
import BeaniaryPage from "../components/pages/BeaniaryPage";
import { allZodiacData } from "../lib/data";

export const Route = createFileRoute("/beaniary")({
  component: () => (
    <section className="animate-fade-up flex flex-col items-center my-6 sm:my-12 px-4">
      <BeaniaryPage data={allZodiacData} />
    </section>
  ),
});
