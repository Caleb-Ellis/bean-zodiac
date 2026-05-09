import { createFileRoute } from "@tanstack/react-router";
import CompatibilityPage from "../components/pages/CompatibilityPage";
import { allZodiacData } from "../lib/data";

export const Route = createFileRoute("/compatibility")({
  component: () => (
    <div className="animate-fade-up">
      <CompatibilityPage data={allZodiacData} />
    </div>
  ),
});
