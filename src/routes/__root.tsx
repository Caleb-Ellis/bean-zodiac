import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { BottomTabBar } from "../components/layout/BottomTabBar";
import { Footer } from "../components/layout/Footer";
import { FormFilters } from "../components/layout/FormFilters";
import { LayoutOrbs } from "../components/layout/LayoutOrbs";
import { LayoutStars } from "../components/layout/LayoutStars";
import { Navigation } from "../components/layout/Navigation";
import "../styles/global.css";

function RootLayout() {
  return (
    <>
      <FormFilters />
      <LayoutStars />
      <LayoutOrbs />
      <div
        id="layout-content"
        className="relative z-10 flex flex-col min-h-screen overflow-x-clip"
      >
        <Navigation />
        <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full md:pb-8">
          <Outlet />
        </main>
        <BottomTabBar />
        <Footer />
      </div>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
