import { useState } from "react";
import { useLandingContent } from "../hooks/useLandingContent.js";

export default function AnnouncementBar() {
  const c = useLandingContent();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || c.show_announcement === "false") return null;

  const link = c.announcement_link || "#pricing";

  return (
    <div className="lp-announce" role="region" aria-label="Announcement">
      <div className="lp-announce-inner">
        <span className="lp-announce-dot" aria-hidden="true" />
        <span>
          <a href={link}>{c.announcement_text}</a>
        </span>
      </div>
      <button
        type="button"
        className="lp-announce-close"
        aria-label="Dismiss announcement"
        onClick={() => setDismissed(true)}
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
