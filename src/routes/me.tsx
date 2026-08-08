import { createFileRoute } from "@tanstack/react-router";
import MePage from "../components/pages/MePage";

export const Route = createFileRoute("/me")({
  component: MePage,
});
