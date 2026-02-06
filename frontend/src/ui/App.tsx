import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./Layout";
import { HomePage } from "../views/HomePage";
import { EventsPage } from "../views/EventsPage";
import { EventDetailPage } from "../views/EventDetailPage";
import { LoginPage } from "../views/LoginPage";
import { RegisterPage } from "../views/RegisterPage";
import { DashboardPage } from "../views/DashboardPage";
import { MyEventsPage } from "../views/MyEventsPage";
import { EventFormPage } from "../views/EventFormPage";
import { AdminPage } from "../views/AdminPage";
import { ArtistsAdminPage } from "../views/ArtistsAdminPage";
import { ArtistProfilePage } from "../views/ArtistProfilePage";
import { ProfilePage } from "../views/ProfilePage";
import { useAuth } from "../state/auth";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Lade…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/artists/:slug" element={<ArtistProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
