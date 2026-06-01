"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Home from "../pages/Home";
import SignInModal from "./SignInModal";

export default function LandingPage({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [modalOpen, setModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // ?signin=1 from the signup page "Already have an account?" link
  useEffect(() => {
    if (searchParams?.get("signin") === "1") {
      setModalOpen(true);
      router.replace("/");
    }
  }, [searchParams, router]);

  return (
    <>
      <Home
        onSignIn={() => setModalOpen(true)}
        onGetStarted={() => router.push("/signup")}
        isLoggedIn={isLoggedIn}
      />
      {modalOpen && <SignInModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
