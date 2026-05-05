import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TatBook — Book Your Tattoo Artist",
    template: "%s | TatBook",
  },
  description:
    "Discover and book appointments with talented tattoo artists. Browse flash designs or submit a custom piece.",
  keywords: ["tattoo", "booking", "tattoo artist", "flash tattoo", "custom tattoo"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-obsidian-950 text-obsidian-50">
        {children}
      </body>
    </html>
  );
}
