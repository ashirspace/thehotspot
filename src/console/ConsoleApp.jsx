import ConsoleGuard from "./ConsoleGuard.jsx";

// Admin console — mounted at /console/* (role-gated to admin/manager).
// The layout + pages are added in the next commits.
export default function ConsoleApp() {
  return (
    <ConsoleGuard>
      {(user) => (
        <div style={{ padding: 32, fontFamily: "var(--font-sans)", color: "var(--text)" }}>
          Console — signed in as {user.username} ({user.role}).
        </div>
      )}
    </ConsoleGuard>
  );
}
