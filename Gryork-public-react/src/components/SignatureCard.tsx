import type { ReactNode } from "react";

type SignatureCardVariant = "metric" | "story" | "workflow" | "proof";

type SignatureCardProps = {
  variant?: SignatureCardVariant;
  className?: string;
  children: ReactNode;
};

const variantClass: Record<SignatureCardVariant, string> = {
  metric: "card-metric",
  story: "card-story",
  workflow: "card-workflow-step",
  proof: "card-proof",
};

export function SignatureCard({ variant = "story", className = "", children }: SignatureCardProps) {
  return <article className={`${variantClass[variant]} ${className}`}>{children}</article>;
}
