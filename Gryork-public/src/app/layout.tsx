import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gryork - Bill Discounting Platform for Infrastructure",
  description:
    "India's trusted bill discounting platform connecting sub-contractors with NBFCs. Quick working capital for infrastructure sector.",
  keywords:
    "bill discounting, working capital, infrastructure finance, NBFC, EPC, sub-contractor financing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
