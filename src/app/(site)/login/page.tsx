import type { Metadata } from "next";
import { TelegramLoginButton } from "@/components/TelegramLoginButton";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to FutBetter with Telegram to vote, predict and track your accuracy.",
};

export default function LoginPage() {
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "futbetterlogin_bot";

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand text-2xl font-black text-black">
        F
      </span>
      <h1 className="mt-4 text-2xl font-black">Log in to FutBetter</h1>
      <p className="mt-2 text-sm text-muted">
        Vote on matches, make predictions, track your accuracy and climb the rankings — all with your
        Telegram account.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-8">
        <TelegramLoginButton botUsername={botUsername} />
        <p className="mt-4 text-xs text-muted">
          We only use your Telegram name, username and profile photo to create your FutBetter profile.
        </p>
      </div>

      <p className="mt-6 text-xs text-muted">
        Staff member?{" "}
        <a href="/admin/login" className="text-brand hover:underline">
          Sign in to the admin panel
        </a>
      </p>
    </div>
  );
}
