import YLPPageMain from "@/components/YLPPageMain";
import { getPublicStats } from "@/services/public-stats.service";

/** Impact figures are counted from Firestore; refresh the page at most every 10 minutes. */
export const revalidate = 600;

export default async function Home() {
  return <YLPPageMain stats={await getPublicStats()} />;
}
