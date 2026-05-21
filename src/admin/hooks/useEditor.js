import { useState, useEffect, useCallback } from "react";
import { saveContent } from "../api/siteContentApi.js";
import { showToast } from "../components/Toast.jsx";

export function useEditor({ fetchFn, saveKey, defaults, username }) {
  const [saved,  setSaved]  = useState(defaults);
  const [local,  setLocal]  = useState(defaults);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    fetchFn().then(res => {
      const merged = { ...defaults, ...(res?.data || {}) };
      setSaved(merged);
      setLocal(merged);
      if (res?.updated_at) setLastSaved(new Date(res.updated_at));
    });
  }, []);

  const isDirty = JSON.stringify(saved) !== JSON.stringify(local);

  const update = useCallback((key, val) => {
    setLocal(prev => ({ ...prev, [key]: val }));
  }, []);

  const discard = useCallback(() => setLocal(saved), [saved]);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await saveContent(saveKey, local, username || "admin");
      setSaved(local);
      setLastSaved(new Date());
      showToast("Published — changes are live");
    } catch {
      showToast("Couldn't save. Check your connection.", "error");
    } finally {
      setSaving(false);
    }
  }, [local, saveKey, username]);

  // Cmd+S save shortcut
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s" && isDirty && !saving) {
        e.preventDefault();
        save();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDirty, saving, save]);

  function fmtLastSaved() {
    if (!lastSaved) return null;
    const mins = Math.round((Date.now() - lastSaved) / 60000);
    if (mins < 1) return "just now";
    if (mins === 1) return "1 minute ago";
    return `${mins} minutes ago`;
  }

  return { local, update, isDirty, saving, discard, save, lastSaved: fmtLastSaved() };
}
