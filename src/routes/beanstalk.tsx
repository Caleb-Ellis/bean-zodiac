import { createFileRoute } from "@tanstack/react-router";
import BeanstalkPage from "../components/pages/BeanstalkPage";
import { allZodiacData } from "../lib/data";

export const Route = createFileRoute("/beanstalk")({
  component: () => (
    <section className="animate-fade-up flex flex-col my-6 sm:my-12">
      <BeanstalkPage data={allZodiacData} />
    </section>
  ),
});
