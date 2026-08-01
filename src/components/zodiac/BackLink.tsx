import { useRouter } from "@tanstack/react-router";

/** Returns to wherever the reader came from, rather than assuming the index page. */
export default function BackLink() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.history.back()}
      className="self-start text-sm text-zinc-500 hover:text-zinc-300 transition-colors bg-transparent border-0 p-0 cursor-pointer"
    >
      ← Back
    </button>
  );
}
