import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import SideRail from "../components/nav/SideRail";
import MobileTabBar from "../components/nav/MobileTabBar";
import { useRealtimeSync } from "../store/hooks/useRealtimeSync";
import { useAppSelector } from "../store/hooks";

/** Routes rendered without the desktop side rail: auth screens (full-bleed) and the watch page (theater layout). */
const RAIL_HIDDEN_PREFIXES = ["/login", "/register", "/forgot-password", "/reset-password", "/watch/"];

export default function RootLayout() {
  useRealtimeSync();
  const user = useAppSelector((state) => state.auth.user);
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  // Move focus to the main region after client-side navigation so screen-reader and keyboard
  // users land on the new page instead of the link they activated. Skip the initial load.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const showRail = !RAIL_HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Toaster
        position="top-center"
        gutter={8}
        containerStyle={{ inset: "12px", top: 76 }}
        toastOptions={{
          duration: 4000,
          className: "!bg-elevated !text-foreground !border !border-border !shadow-float !rounded-md",
          style: {
            maxWidth: "min(420px, calc(100vw - 24px))",
            fontSize: "0.875rem",
            padding: "10px 14px",
          },
          success: { iconTheme: { primary: "rgb(var(--c-success))", secondary: "rgb(var(--c-elevated))" } },
          error: { iconTheme: { primary: "rgb(var(--c-destructive))", secondary: "rgb(var(--c-elevated))" } },
        }}
      />
      <header className="sticky top-0 z-30">
        <Navbar />
      </header>
      <div className="flex">
        {showRail && <SideRail />}
        <main
          id="main"
          ref={mainRef}
          tabIndex={-1}
          className={`min-w-0 flex-1 outline-none ${user ? "pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0" : ""}`}
        >
          <Outlet />
        </main>
      </div>
      {user && <MobileTabBar />}
    </>
  );
}
