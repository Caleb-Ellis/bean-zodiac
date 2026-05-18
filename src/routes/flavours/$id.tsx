import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/flavours/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/beaniary/flavours/$id", params });
  },
  component: () => null,
});
