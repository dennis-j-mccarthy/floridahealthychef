import { redirect } from "next/navigation";

// /creator is the one URL every site's creator page answers to.
// Here the creator studio lives at /admin.
export default function CreatorAlias() {
  redirect("/admin");
}
