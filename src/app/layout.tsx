import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Youth Leadership Program (YLP) 2.0 | Pakistan's Largest Youth Leadership Program | Combine Foundation",
  description: "YLP 2.0 by Combine Foundation is Pakistan's largest youth leadership program, a free six-month journey in leadership, project management, communication and networking for university students across Pakistan.",
  openGraph: {
    type: "website",
    title: "Youth Leadership Program (YLP) 2.0 | Pakistan's Largest Youth Leadership Program",
    description: "A free 6-month leadership journey for Pakistani university students. Workshops, mentorship, networking and real projects by Combine Foundation.",
    url: "https://combinefoundation.org/",
    siteName: "Combine Foundation",
    images: ["/logo.png"],
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: "Youth Leadership Program (YLP) 2.0 | Pakistan's Largest Youth Leadership Program",
    description: "A free 6-month leadership journey for Pakistani university students, by Combine Foundation.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
