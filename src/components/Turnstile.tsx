import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

type Props = {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
};

export function Turnstile({ siteKey, onVerify, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 30;

    function init() {
      if (!containerRef.current) return;
      if (!window.turnstile) {
        if (++attempts < maxAttempts) setTimeout(init, 200);
        return;
      }
      window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        "error-callback": onError,
        theme: "light",
      });
    }

    init();
  }, [siteKey, onVerify, onError]);

  return <div ref={containerRef} />;
}
