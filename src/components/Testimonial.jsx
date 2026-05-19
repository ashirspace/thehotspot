export default function Testimonial() {
  return (
    <section className="testimonial-section">
      <div className="testimonial-section__inner">
        <p className="testimonial-section__eyebrow">Customer Story</p>

        <blockquote className="testimonial-quote">
          "We replaced 3 outreach tools with thehotspot and our reply
          rate jumped from 8% to 34% in six weeks."
        </blockquote>

        <div className="testimonial-attr">
          <div className="testimonial-avatar" aria-hidden="true">AR</div>
          <div className="testimonial-meta">
            <strong>Anika Rao</strong>
            <span className="testimonial-sep">·</span>
            Head of Growth
            <span className="testimonial-sep">·</span>
            Freshworks
          </div>
        </div>
      </div>
    </section>
  );
}
