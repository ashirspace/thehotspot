import { useState, useEffect } from "react";
import { LANDING_DEFAULTS } from "../admin/api/siteContentApi.js";

let __cache = null;
let __promise = null;

export function useLandingContent() {
  const [content, setContent] = useState(() => __cache || LANDING_DEFAULTS);

  useEffect(() => {
    if (__cache) { setContent(__cache); return; }
    if (!__promise) {
      __promise = fetch("/api/db?entity=content&key=landing")
        .then(r => (r.ok ? r.json() : null))
        .then(j => {
          __cache = { ...LANDING_DEFAULTS, ...(j && j.data ? j.data : {}) };
          return __cache;
        })
        .catch(() => {
          __cache = LANDING_DEFAULTS;
          return __cache;
        });
    }
    __promise.then(c => setContent(c));
  }, []);

  return content;
}
