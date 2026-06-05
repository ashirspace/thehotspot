import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { AppShell } from "./shell/app-shell";
import { AuthLayout } from "./shell/auth-layout";
import { MarketingLayout } from "./shell/marketing-layout";
import { AuthProvider } from "./state/auth";
import { DashboardPage } from "./pages/app/dashboard";
import { CampaignsPage } from "./pages/app/campaigns";
import { CrmPage } from "./pages/app/crm";
import { DeliverabilityPage } from "./pages/app/deliverability";
import { InboxPage } from "./pages/app/inbox";
import { LeadsPage } from "./pages/app/leads";
import { SequenceBuilderPage } from "./pages/app/sequence-builder";
import { SettingsPage } from "./pages/app/settings";
import { TemplatesPage } from "./pages/app/templates";
import { LoginPage } from "./pages/auth/login";
import { OtpPage } from "./pages/auth/otp-page";
import { SignupPage } from "./pages/auth/signup";
import { AboutPage } from "./pages/marketing/about";
import { BlogPage } from "./pages/marketing/blog";
import { LandingPage } from "./pages/marketing/landing";
import { LegalPage } from "./pages/marketing/legal";
import { PricingPage } from "./pages/marketing/pricing";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/pricing", element: <PricingPage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/blog", element: <BlogPage /> },
      { path: "/privacy", element: <LegalPage type="privacy" /> },
      { path: "/terms", element: <LegalPage type="terms" /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/otp", element: <OtpPage /> },
    ],
  },
  {
    path: "/app",
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "leads", element: <LeadsPage /> },
      { path: "campaigns", element: <CampaignsPage /> },
      { path: "sequences", element: <SequenceBuilderPage /> },
      { path: "inbox", element: <InboxPage /> },
      { path: "crm", element: <CrmPage /> },
      { path: "templates", element: <TemplatesPage /> },
      { path: "deliverability", element: <DeliverabilityPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
