"use client";

import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    onFutBetterTelegramAuth?: (user: TelegramUser) => void;
  }
}

export function TelegramLoginButton({ botUsername }: { botUsername: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    window.onFutBetterTelegramAuth = (user: TelegramUser) => {
      signIn("telegram", {
        id: String(user.id),
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        username: user.username ?? "",
        photo_url: user.photo_url ?? "",
        auth_date: String(user.auth_date),
        hash: user.hash,
        callbackUrl: "/",
      });
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "10");
    script.setAttribute("data-onauth", "onFutBetterTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");

    container?.appendChild(script);

    return () => {
      if (container) container.innerHTML = "";
      delete window.onFutBetterTelegramAuth;
    };
  }, [botUsername]);

  return <div ref={containerRef} className="flex justify-center" />;
}
