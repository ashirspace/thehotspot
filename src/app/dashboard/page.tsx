import { getServerSession } from "next-auth";
import { ConnectionScreen, DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getAuthOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(getAuthOptions());

  if (!session?.user) {
    return <ConnectionScreen />;
  }

  return <DashboardShell user={session.user} />;
}
