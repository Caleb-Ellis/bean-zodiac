import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/beans/")({
  beforeLoad: () => {
    throw redirect({ to: "/beaniary/beans" });
  },
  component: () => null,
});
