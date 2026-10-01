import { redirect } from "next/navigation";

/** Profile editing lives on the Settings page. */
export default function ProfilePage() {
  redirect("/youth-leader/settings");
}
