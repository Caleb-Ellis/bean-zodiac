import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

export const getStaticPaths: GetStaticPaths = async () => {
  const zodiacs = await getCollection("zodiacs");
  return zodiacs.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
};

export const GET: APIRoute = ({ props }) => {
  const { entry } = props as {
    entry: Awaited<ReturnType<typeof getCollection<"zodiacs">>>[0];
  };
  return new Response(JSON.stringify({ ...entry.data, content: entry.body ?? "" }), {
    headers: { "Content-Type": "application/json" },
  });
};
