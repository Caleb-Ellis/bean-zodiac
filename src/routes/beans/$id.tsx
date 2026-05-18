import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/beans/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/beaniary/beans/$id", params });
  },
  component: () => null,
});
