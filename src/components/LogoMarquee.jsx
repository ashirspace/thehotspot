const NAMES = [
  "Razorpay", "CRED", "Zerodha", "Swiggy", "Unacademy",
  "Postman", "Freshworks", "Zoho", "Groww", "Meesho",
  "BrowserStack", "Chargebee", "Clevertap", "Darwinbox", "Leadsquared",
];

export default function LogoMarquee() {
  const doubled = [...NAMES, ...NAMES];

  return (
    <div className="marquee-section">
      <p className="marquee-section__label">Trusted by teams at</p>

      <div className="marquee-track">
        <div className="marquee-names">
          {doubled.map((name, i) => (
            <span key={i} className="marquee-name">
              {name}
              <span className="marquee-sep"> ·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
