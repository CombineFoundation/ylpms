import { redirect } from "next/navigation";

/** Old URL: RO events now live under Activities. Keeps the developer's ?roId= scope. */
export default async function EventsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = new URLSearchParams();
  Object.entries(await searchParams).forEach(([key, value]) => {
    if (typeof value === "string") params.set(key, value);
  });
  const query = params.toString();
  redirect(`/RO/activities${query ? `?${query}` : ""}`);
}
