import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/zodiacs/")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
