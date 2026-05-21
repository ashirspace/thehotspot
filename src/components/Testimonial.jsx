import { useLandingContent } from "../hooks/useLandingContent.js";

export default function Testimonial() {
  const c = useLandingContent();
  return (
    <section className="lp-testimonial">
      <div className="lp-container">
        <span className="lp-eyebrow">Why teams switch</span>
        <blockquote className="lp-quote">
          &ldquo;{c.testimonial_quote}&rdquo;
        </blockquote>
      </div>
    </section>
  );
}
