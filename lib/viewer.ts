import { auth } from "@/auth";

export async function getViewer() {
  const session = await auth();
  if (session?.user?.id) return { id: session.user.id, name: session.user.name ?? "User", email: session.user.email ?? "" };
  if (process.env.NODE_ENV === "development") return { id: "demo-user", name: "Ashir Ayaan", email: "ashir@thehotspot.ai" };
  return null;
}
