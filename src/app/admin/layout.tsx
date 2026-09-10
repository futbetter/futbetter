import type { Metadata } from "next";
import "../globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: { default: "FutBetter Admin", template: "%s | FutBetter Admin" },
  description: "FutBetter content management system.",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
