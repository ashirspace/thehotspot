import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./admin.css";
import AdminGuard from "./AdminGuard.jsx";
import AdminLayout from "./AdminLayout.jsx";

// Landing editors
const AnnouncementEditor = lazy(() => import("./pages/landing/AnnouncementEditor.jsx"));
const HeroEditor         = lazy(() => import("./pages/landing/HeroEditor.jsx"));
const FeaturesEditor     = lazy(() => import("./pages/landing/FeaturesEditor.jsx"));
const StatsEditor        = lazy(() => import("./pages/landing/StatsEditor.jsx"));
const TestimonialEditor  = lazy(() => import("./pages/landing/TestimonialEditor.jsx"));
const PricingEditor      = lazy(() => import("./pages/landing/PricingEditor.jsx"));
const FooterEditor       = lazy(() => import("./pages/landing/FooterEditor.jsx"));

// Login editors
const BrandingEditor     = lazy(() => import("./pages/login/BrandingEditor.jsx"));
const WelcomeEditor      = lazy(() => import("./pages/login/WelcomeEditor.jsx"));
const FormLabelsEditor   = lazy(() => import("./pages/login/FormLabelsEditor.jsx"));
const ButtonsEditor      = lazy(() => import("./pages/login/ButtonsEditor.jsx"));
const ToggleLinksEditor  = lazy(() => import("./pages/login/ToggleLinksEditor.jsx"));

// Settings stubs
const SettingsUsers      = lazy(() => import("./pages/settings/SettingsUsers.jsx"));
const SettingsAudit      = lazy(() => import("./pages/settings/SettingsAudit.jsx"));
const SettingsIntegrations = lazy(() => import("./pages/settings/SettingsIntegrations.jsx"));

function EditorSuspense({ children }) {
  return (
    <Suspense fallback={<div className="cms-loading">Loading editor…</div>}>
      {children}
    </Suspense>
  );
}

export default function AdminApp() {
  return (
    <AdminGuard>
      {(user, isAdmin) => (
        <Routes>
          <Route element={<AdminLayout user={user} isAdmin={isAdmin} />}>
            <Route index element={<Navigate to="/admin/landing/hero" replace />} />

            {/* Landing editors */}
            <Route path="landing/announcement" element={<EditorSuspense><AnnouncementEditor user={user} /></EditorSuspense>} />
            <Route path="landing/hero"         element={<EditorSuspense><HeroEditor user={user} /></EditorSuspense>} />
            <Route path="landing/features"     element={<EditorSuspense><FeaturesEditor user={user} /></EditorSuspense>} />
            <Route path="landing/stats"        element={<EditorSuspense><StatsEditor user={user} /></EditorSuspense>} />
            <Route path="landing/testimonial"  element={<EditorSuspense><TestimonialEditor user={user} /></EditorSuspense>} />
            <Route path="landing/pricing"      element={<EditorSuspense><PricingEditor user={user} /></EditorSuspense>} />
            <Route path="landing/footer"       element={<EditorSuspense><FooterEditor user={user} /></EditorSuspense>} />

            {/* Login editors */}
            <Route path="login/branding"    element={<EditorSuspense><BrandingEditor user={user} /></EditorSuspense>} />
            <Route path="login/welcome"     element={<EditorSuspense><WelcomeEditor user={user} /></EditorSuspense>} />
            <Route path="login/form-labels" element={<EditorSuspense><FormLabelsEditor user={user} /></EditorSuspense>} />
            <Route path="login/buttons"     element={<EditorSuspense><ButtonsEditor user={user} /></EditorSuspense>} />
            <Route path="login/toggle-links"element={<EditorSuspense><ToggleLinksEditor user={user} /></EditorSuspense>} />

            {/* Settings (admin only) */}
            <Route path="settings/users"        element={isAdmin ? <EditorSuspense><SettingsUsers /></EditorSuspense> : <Navigate to="/" replace />} />
            <Route path="settings/integrations" element={isAdmin ? <EditorSuspense><SettingsIntegrations /></EditorSuspense> : <Navigate to="/" replace />} />
            <Route path="settings/audit"        element={isAdmin ? <EditorSuspense><SettingsAudit /></EditorSuspense> : <Navigate to="/" replace />} />

            <Route path="*" element={<Navigate to="/admin/landing/hero" replace />} />
          </Route>
        </Routes>
      )}
    </AdminGuard>
  );
}
