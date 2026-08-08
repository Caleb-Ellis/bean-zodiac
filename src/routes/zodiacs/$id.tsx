import { createFileRoute, notFound } from "@tanstack/react-router";
import ZodiacDetail from "../../components/zodiac/ZodiacDetail";
import { isValidZodiacId } from "../../lib/zodiac";

export const Route = createFileRoute("/zodiacs/$id")({
  component: () => {
    const { id } = Route.useParams();
    if (!isValidZodiacId(id)) throw notFound();

    return <ZodiacDetail id={id} />;
  },
});
