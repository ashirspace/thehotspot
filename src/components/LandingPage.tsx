"use client";

import { useState } from "react";
import Home from "../pages/Home";
import SignInModal from "./SignInModal";

type ModalMode = "signin" | "signup" | null;

export default function LandingPage({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  return (
    <>
      <Home
        onSignIn={() => setModalMode("signin")}
        onGetStarted={() => setModalMode("signup")}
        isLoggedIn={isLoggedIn}
      />
      {modalMode && (
        <SignInModal mode={modalMode} onClose={() => setModalMode(null)} />
      )}
    </>
  );
}
