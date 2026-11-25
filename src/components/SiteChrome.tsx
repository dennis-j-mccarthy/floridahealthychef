"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/* The public header, footer and popup — hidden inside the studios (/creator, /admin). */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "";
  if (path.startsWith("/creator") || path.startsWith("/admin")) return null;
  return <>{children}</>;
}
