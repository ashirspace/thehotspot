const NAMES = [
  "Ibra Digital Branding Services", "GBuzz", "FictionFuel",
];

export default function LogoMarquee() {
  const loop = [...NAMES, ...NAMES, ...NAMES, ...NAMES, ...NAMES, ...NAMES];

  return (
    <section className="lp-marquee" id="customers">
      <div className="lp-container">
        <p className="lp-eyebrow lp-marquee-eyebrow">Trusted by teams at</p>
      </div>
      <div className="lp-marquee-track-wrap">
        <div className="lp-marquee-track">
          {loop.map((name, i) => (
            <span className="lp-marquee-item" key={`${name}-${i}`}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
