"use client";

import type { ReactNode } from "react";

/** The public publication is intentionally light-only. */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
