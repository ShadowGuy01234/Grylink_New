import type { ReactNode } from "react";

type SectionVariant = "light" | "accent" | "dark";

type SectionShellProps = {
  variant?: SectionVariant;
  className?: string;
  children: ReactNode;
};

const variantClass: Record<SectionVariant, string> = {
  light: "section-light",
  accent: "section-accent",
  dark: "section-dark",
};

export function SectionShell({ variant = "light", className = "", children }: SectionShellProps) {
  return <section className={`section-shell page-section ${variantClass[variant]} ${className}`}>{children}</section>;
}
