import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  variant?: "default" | "primary" | "blood";
  className?: string;
}

export function HalftoneBg({ children, variant = "default", className = "" }: Props) {
  const cls =
    variant === "primary" ? "halftone-primary" : variant === "blood" ? "halftone-blood" : "halftone";
  return <div className={`${cls} ${className}`}>{children}</div>;
}
