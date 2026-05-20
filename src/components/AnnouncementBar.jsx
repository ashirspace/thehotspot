import { useState } from "react";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="lp-announce" role="region" aria-label="Announcement">
      <div className="lp-announce-inner">
        <span className="lp-announce-dot" aria-hidden="true" />
        <span>
          Now in Beta — Join 500+ companies growing with{" "}
          <a href="#pricing">thehotspot &rarr;</a>
        </span>
      </div>
      <button
        type="button"
        className="lp-announce-close"
        aria-label="Dismiss announcement"
        onClick={() => setVisible(false)}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M1 1l12 12M13 1L1 13"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
