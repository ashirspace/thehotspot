import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import LogoMarquee from "../components/LogoMarquee";
import LandingConsolidatedSections, { ResourcesSection } from "../components/LandingConsolidatedSections";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import CTA from "../components/CTA";
import Footer from "../components/Footer";
import { useEffect } from "react";

export default function Home({ onSignIn, onGetStarted }) {
  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace("#", "");
      if (!id) return;
      const target = document.getElementById(id);
      const scroller = document.querySelector(".lp-page");
      if (!target || !scroller) return;
      const top = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 74;
      scroller.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    };

    const timeouts = [80, 260, 720].map((delay) => window.setTimeout(scrollToHash, delay));
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, []);

  return (
    <div className="lp-page">
      <AnnouncementBar />
      <Navbar onSignIn={onSignIn} onGetStarted={onGetStarted} />
      <div className="lp-scroll">
        <Hero onGetStarted={onGetStarted} onSignIn={onSignIn} />
        <LogoMarquee />
        <LandingConsolidatedSections />
        <Pricing onGetStarted={onGetStarted} />
        <ResourcesSection />
        <FAQ />
        <CTA onGetStarted={onGetStarted} />
        <Footer onGetStarted={onGetStarted} />
      </div>
    </div>
  );
}
