import { useState } from "react";

export function useAgent(agentFn) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const out = await agentFn(...args);
      setResult(out);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setResult(null); setError(null); };

  return { loading, result, error, run, reset };
}
