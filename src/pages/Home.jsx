import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import LogoMarquee from "../components/LogoMarquee";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Stats from "../components/Stats";
import Testimonial from "../components/Testimonial";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

export default function Home({ onSignIn, onGetStarted }) {
  return (
    <div className="lp-page">
      <AnnouncementBar />
      <Navbar onSignIn={onSignIn} onGetStarted={onGetStarted} />
      <div className="lp-scroll">
        <Hero onGetStarted={onGetStarted} onSignIn={onSignIn} />
        <LogoMarquee />
        <Features />
        <HowItWorks />
        <Stats />
        <Testimonial />
        <Pricing />
        <FAQ />
        <CTA onGetStarted={onGetStarted} />
        <Footer onGetStarted={onGetStarted} />
      </div>
    </div>
  );
}
