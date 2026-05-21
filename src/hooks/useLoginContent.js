import { useState, useEffect } from "react";
import { LOGIN_DEFAULTS } from "../console/loginFields.js";

// Module-level cache — login content is fetched once per page load.
let __cache = null;
let __promise = null;

/**
 * Returns the login page copy, always a complete object (admin overrides
 * merged over LOGIN_DEFAULTS). If the fetch fails or hasn't resolved, the
 * hardcoded defaults are used — so the login page never shifts or breaks.
 */
export function useLoginContent() {
  const [content, setContent] = useState(() => __cache || LOGIN_DEFAULTS);

  useEffect(() => {
    if (__cache) { setContent(__cache); return; }
    if (!__promise) {
      __promise = fetch("/api/db?entity=content&key=login")
        .then(r => (r.ok ? r.json() : null))
        .then(j => {
          __cache = { ...LOGIN_DEFAULTS, ...(j && j.data ? j.data : {}) };
          return __cache;
        })
        .catch(() => {
          __cache = LOGIN_DEFAULTS;
          return __cache;
        });
    }
    __promise.then(c => setContent(c));
  }, []);

  return content;
}
