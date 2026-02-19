import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Layout } from "./Layout";
import { HomePage } from "../views/HomePage";
import { EventsPage } from "../views/EventsPage";
import { EventDetailPage } from "../views/EventDetailPage";
import { DashboardPage } from "../views/DashboardPage";
import { MyEventsPage } from "../views/MyEventsPage";
import { EventFormPage } from "../views/EventFormPage";
import { AdminPage } from "../views/AdminPage";
import { ArtistsAdminPage } from "../views/ArtistsAdminPage";
import { ArtistsPage } from "../views/ArtistsPage";
import { ArtistProfilePage } from "../views/ArtistProfilePage";
import { CommunityPage } from "../views/CommunityPage";
import { ProfilePage } from "../views/ProfilePage";
import { FavoritesPage } from "../views/FavoritesPage";
import { AppPage } from "../views/AppPage";
import { NotFoundPage } from "../views/NotFoundPage";
import { ImpressumPage } from "../views/ImpressumPage";
import { DatenschutzPage } from "../views/DatenschutzPage";
import { AgbPage } from "../views/AgbPage";
import { BarrierefreiheitPage } from "../views/BarrierefreiheitPage";
import { KontaktPage } from "../views/KontaktPage";
import { useAuth } from "../state/auth";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading, openLogin } = useAuth();
  useEffect(() => {
    if (!loading && !user) openLogin();
  }, [loading, user]);
  if (loading) return <div className="p-6">Lade…</div>;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function RedirectWithModal({ mode }: { mode: "login" | "register" }) {
  const { openLogin, openRegister } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (mode === "login") openLogin(); else openRegister();
    navigate("/", { replace: true });
  }, []);
  return null;
}

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/community/:slug" element={<CommunityPage />} />
        <Route path="/artists" element={<ArtistsPage />} />
        <Route path="/artists/:slug" element={<ArtistProfilePage />} />
        <Route path="/login" element={<RedirectWithModal mode="login" />} />
        <Route path="/register" element={<RedirectWithModal mode="register" />} />
        <Route
          path="/my-events"
          element={
            <RequireAuth>
              <MyEventsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/events/new"
          element={
            <RequireAuth>
              <EventFormPage mode="create" />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/events/:id/edit"
          element={
            <RequireAuth>
              <EventFormPage mode="edit" />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/artists"
          element={
            <RequireAuth>
              <ArtistsAdminPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/favorites"
          element={
            <RequireAuth>
              <FavoritesPage />
            </RequireAuth>
          }
        />
        <Route path="/app" element={<AppPage />} />
        <Route path="/impressum" element={<ImpressumPage />} />
        <Route path="/datenschutz" element={<DatenschutzPage />} />
        <Route path="/agb" element={<AgbPage />} />
        <Route path="/barrierefreiheit" element={<BarrierefreiheitPage />} />
        <Route path="/kontakt" element={<KontaktPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
