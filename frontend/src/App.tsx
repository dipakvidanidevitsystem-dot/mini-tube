import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeModeProvider } from "./theme/ThemeModeProvider";
import RootLayout from "./layouts/RootLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WatchVideo from "./pages/WatchVideo";
import UploadVideo from "./pages/UploadVideo";
import EditVideo from "./pages/EditVideo";
import Channel from "./pages/Channel";
import MyVideos from "./pages/MyVideos";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import History from "./pages/History";
import WatchLater from "./pages/WatchLater";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <ThemeModeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
            <Route path="watch/:id" element={<WatchVideo />} />
            <Route path="channel/:id" element={<Channel />} />

            <Route element={<ProtectedRoute />}>
              <Route path="upload" element={<UploadVideo />} />
              <Route path="edit/:id" element={<EditVideo />} />
              <Route path="my-videos" element={<MyVideos />} />
              <Route path="history" element={<History />} />
              <Route path="watch-later" element={<WatchLater />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeModeProvider>
  );
}
