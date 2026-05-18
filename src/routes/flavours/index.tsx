import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/flavours/")({
  beforeLoad: () => {
    throw redirect({ to: "/beaniary/flavours" });
  },
  component: () => null,
});
