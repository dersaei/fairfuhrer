"use client";

import { useEffect, useRef, useCallback, useImperativeHandle } from "react";
import type { Ref } from "react";
import Script from "next/script";

/**
 * Tokeny Turnstile są jednorazowe — po wysłaniu do siteverify tracą ważność.
 * Formularz, który zostaje na ekranie po nieudanej próbie, musi zamówić nowy
 * token, inaczej kolejne wysłanie odpadnie na weryfikacji mimo poprawnych danych.
 */
export interface TurnstileWidgetHandle {
  reset: () => void;
}

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  onTimeout?: () => void;
  ref?: Ref<TurnstileWidgetHandle>;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          "timeout-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          language?: string;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export default function TurnstileWidget({
  siteKey,
  onVerify,
  onExpire,
  onError,
  onTimeout,
  ref,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useImperativeHandle(ref, () => ({
    reset() {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    },
  }), []);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return;
    if (widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      "expired-callback": onExpire,
      "error-callback": onError,
      "timeout-callback": onTimeout,
      theme: "auto",
      language: "auto",
    });
  }, [siteKey, onVerify, onExpire, onError, onTimeout]);

  useEffect(() => {
    window.onTurnstileLoad = renderWidget;

    if (window.turnstile) {
      renderWidget();
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit"
        strategy="afterInteractive"
      />
      <div ref={containerRef} />
    </>
  );
}
