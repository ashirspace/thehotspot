import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth";
import LandingPage from "@/components/LandingPage";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(getAuthOptions());
  return <LandingPage isLoggedIn={!!session?.user} />;
}
