import { createFileRoute, Link } from "@tanstack/react-router";
import { allZodiacData } from "../../../lib/data";
import { FORM_EMOJI, type FormId } from "../../../lib/zodiac";

export const Route = createFileRoute("/beaniary/forms/")({
  component: () => {
    const forms = Object.entries(allZodiacData.forms);
    return (
      <div className="animate-fade-up">
        <section className="py-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">
            The Six Seasons of Form
          </h1>
          <p className="mt-3 text-lg text-zinc-300 max-w-xl mx-auto">
            Each Bean is augmented by one of six foundational forms.
          </p>
        </section>
        <ul className="grid grid-cols-2 gap-5 list-none p-0 m-0 max-w-lg mx-auto w-full">
          {forms.map(([id, form]) => (
            <li
              key={id}
              className={`rounded-xl border-4 border-form-${id} bg-zinc-900 overflow-hidden transition-opacity hover:opacity-80`}
            >
              <Link
                to="/beaniary/forms/$id"
                params={{ id }}
                className="flex flex-col no-underline h-full"
              >
                <div className="h-20 flex items-center justify-center">
                  <span style={{ fontSize: "2rem", lineHeight: 1 }}>
                    {FORM_EMOJI[id as FormId]}
                  </span>
                </div>
                <div className={`p-3 bg-form-${id} flex-1`}>
                  <h2 className="text-base font-semibold text-black">
                    {form.name}
                  </h2>
                  <p className="text-sm text-black/70 mt-0.5">{form.tagline}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  },
});
