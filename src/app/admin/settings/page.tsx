import { redirect } from "next/navigation";

// Settings index redirects to general
export default function SettingsIndexPage() {
  redirect("/admin/settings/general");
}
