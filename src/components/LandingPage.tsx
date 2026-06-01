"use client";

import { signIn } from "next-auth/react";
import Home from "../pages/Home";

export default function LandingPage({ isLoggedIn }: { isLoggedIn: boolean }) {
  function handleSignIn() {
    signIn("linkedin", { callbackUrl: "/dashboard" });
  }

  return (
    <Home
      onSignIn={handleSignIn}
      onGetStarted={handleSignIn}
      isLoggedIn={isLoggedIn}
    />
  );
}
