import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ROLES, getRoleBySlug } from "@/lib/careers";
import RolePageClient from "./RolePageClient";

// ── Static generation ─────────────────────────────────────────────────────────

export function generateStaticParams() {
  return ROLES.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const role = getRoleBySlug(slug);
  if (!role) return { title: "Role Not Found | Gryork Careers" };

  const title = `${role.title} — Careers at Gryork`;
  const description = `${role.description} ${role.location} · ${role.type} · ${role.experience} experience. Apply now.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://gryork.com/careers/${slug}`,
      siteName: "Gryork",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function RolePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const role = getRoleBySlug(slug);
  if (!role) notFound();

  return <RolePageClient role={role} />;
}
