"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Home from "../pages/Home";

export default function LandingPage() {
  const router = useRouter();

  function handleSignIn() {
    signIn("linkedin", { callbackUrl: "/dashboard" });
  }

  function handleGetStarted() {
    router.push("/dashboard");
  }

  return <Home onSignIn={handleSignIn} onGetStarted={handleGetStarted} />;
}
