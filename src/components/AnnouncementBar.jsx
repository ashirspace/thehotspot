import { useState } from "react";

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="ann-bar">
      <span className="ann-bar__dot" />
      Now in Beta — Join 500+ companies growing with{" "}
      <a className="ann-bar__link" href="#features">thehotspot</a>
      {" →"}
      <button
        className="ann-bar__close"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
      >
        ×
      </button>
    </div>
  );
}
