import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import SubNav from "../components/SubNav";
import MobileTabBar from "../components/nav/MobileTabBar";
import { useRealtimeSync } from "../store/hooks/useRealtimeSync";
import { useAppSelector } from "../store/hooks";

export default function RootLayout() {
  useRealtimeSync();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <>
      <Toaster
        position="top-center"
        gutter={8}
        containerStyle={{ inset: "12px" }}
        toastOptions={{
          duration: 4000,
          style: {
            maxWidth: "min(420px, calc(100vw - 24px))",
            fontSize: "0.875rem",
            padding: "10px 14px",
          },
        }}
      />
      <header className="sticky top-0 z-30">
        <Navbar />
        <SubNav />
      </header>
      <div className={user ? "pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0" : undefined}>
        <Outlet />
      </div>
      {user && <MobileTabBar />}
    </>
  );
}
