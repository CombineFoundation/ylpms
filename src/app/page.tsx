import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import YLPPageMain from "@/components/YLPPageMain";
import { landingFaqItems } from "@/components/landing/landing-faq";
import { YLP_2_SELECTION } from "@/config/cohorts";
import { getPublicStats } from "@/services/public-stats.service";

/** Impact figures are counted from Firestore; refresh the page at most every 10 minutes. */
export const revalidate = 600;

const sora = Sora({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-sora" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter" });

const { youthLeaders, universities, cities } = YLP_2_SELECTION;

export const metadata: Metadata = {
  description: `YLP 2.0 by Combine Foundation is Pakistan's largest youth leadership program: ${youthLeaders} Youth Leaders from ${universities} universities across ${cities} cities. A free 6-month journey in leadership, project management, communication and networking. Applications open now.`,
  keywords: [
    "Youth Leadership Program",
    "YLP 2.0",
    "Combine Foundation",
    "leadership program Pakistan",
    "youth leaders Pakistan",
    "university students leadership",
    "volunteer program Pakistan",
    "free leadership training",
  ],
  authors: [{ name: "Combine Foundation" }],
  robots: { index: true, follow: true },
  alternates: { canonical: "https://combinefoundation.org/" },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Combine Foundation",
    url: "https://combinefoundation.org",
    logo: "https://combinefoundation.org/logo.png",
    description: "Combine Foundation runs the Youth Leadership Program (YLP), Pakistan's largest youth leadership initiative for university students.",
  },
  {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Youth Leadership Program 2.0 (YLP 2.0)",
    description: "A six-month national leadership journey by Combine Foundation helping Pakistani university students build leadership, communication, project management and teamwork skills through practical learning.",
    provider: { "@type": "Organization", name: "Combine Foundation", sameAs: "https://combinefoundation.org" },
    educationalCredentialAwarded: "Certificate of Completion, Experience Letter, Recommendation Letter",
    audience: { "@type": "EducationalAudience", educationalRole: "student" },
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: landingFaqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  },
];

export default async function Home() {
  return (
    <div className={`landing ${sora.variable} ${inter.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <YLPPageMain stats={await getPublicStats()} />
    </div>
  );
}
