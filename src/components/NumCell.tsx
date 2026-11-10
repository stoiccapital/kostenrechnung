import type { ReactNode } from "react";

export function NumCell({
  children,
  className = "",
  muted = false,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return (
    <td
      className={`num px-3 py-1.5 whitespace-nowrap ${
        muted ? "text-ink-500" : ""
      } ${className}`}
    >
      {children}
    </td>
  );
}
