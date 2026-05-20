import { useEffect, useState } from "react";

/**
 * Returns the logged-in user if they may access the console
 * (role admin or manager), otherwise null.
 * NOTE: client-side only — TODO: server-side role validation in v2.
 */
export function getConsoleUser() {
  try {
    const u = JSON.parse(localStorage.getItem("thehotspot_user") || "null");
    if (u && (u.role === "admin" || u.role === "manager")) return u;
    return null;
  } catch {
    return null;
  }
}

// Gate the console: admin/manager pass through, everyone else is sent to "/".
export default function ConsoleGuard({ children }) {
  const [state, setState] = useState("checking"); // checking | ok | denied
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = getConsoleUser();
    if (u) { setUser(u); setState("ok"); }
    else { setState("denied"); }
  }, []);

  if (state === "checking") return null;

  if (state === "denied") {
    window.location.replace("/");
    return null;
  }

  return typeof children === "function" ? children(user) : children;
}
