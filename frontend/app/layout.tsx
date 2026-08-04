import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScaleOn — Internship Study Portal",
  description: "ScaleOn Internship Study Portal — manage internships, track progress, earn certificates. The all-in-one platform for scalable intern management.",
  keywords: ["ScaleOn", "thescaleon", "scaleon study portal", "internship portal", "intern management", "ScaleOn internship", "learning portal"],
  authors: [{ name: "ScaleOn" }],
  openGraph: {
    title: "ScaleOn — Internship Study Portal",
    description: "Manage internships, track progress, earn certificates.",
    siteName: "ScaleOn",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className="h-full antialiased font-sans" suppressHydrationWarning>{children}</body>
    </html>
  );
}
