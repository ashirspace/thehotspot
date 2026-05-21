import { useState, useCallback, useEffect } from "react";

let _setToasts = null;

export function showToast(msg, type = "success") {
  if (_setToasts) {
    const id = Date.now();
    _setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      _setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _setToasts = setToasts;
    return () => { _setToasts = null; };
  }, []);

  return (
    <div className="cms-toast-container">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`cms-toast${t.type === "error" ? " cms-toast--error" : ""}`}
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
