import { redirect } from "next/navigation";

// src/proxy.ts normally redirects /Head-of-RO with a 307 before rendering;
// this is the fallback if the page is ever reached directly.
export default function HeadROIndexPage() {
  redirect("/Head-of-RO/dashboard");
}
