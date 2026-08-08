import { createFileRoute, redirect } from "@tanstack/react-router";
import MePage from "../components/pages/MePage";
import { useStore } from "../store";

export const Route = createFileRoute("/me")({
  beforeLoad: () => {
    if (!useStore.getState().claimed) throw redirect({ to: "/" });
  },
  component: MePage,
});
