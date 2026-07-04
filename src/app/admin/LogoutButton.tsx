"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-light-2 bg-white px-5 py-2.5 text-sm font-light text-gray transition-colors hover:text-dark"
    >
      Sign Out
    </button>
  );
}
