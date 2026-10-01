import { redirect } from "next/navigation";

/** Old URL: Events now live under Activities. Keeps the portal scope query. */
export default async function EventsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = new URLSearchParams();
  Object.entries(await searchParams).forEach(([key, value]) => {
    if (typeof value === "string") params.set(key, value);
  });
  const query = params.toString();
  redirect(`/Head-of-RO/activities${query ? `?${query}` : ""}`);
}
