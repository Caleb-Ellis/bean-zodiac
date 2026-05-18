import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/forms/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/beaniary/forms/$id", params });
  },
  component: () => null,
});
