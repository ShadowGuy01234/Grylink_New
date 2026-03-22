import type { Metadata } from "next";
import "./globals.css";
import LayoutClient from "./LayoutClient";

export const metadata: Metadata = {
  title: "Gryork - Bill Discounting Platform for Construction Finance",
  description:
    "India's leading bill discounting platform connecting sub-contractors with 50+ RBI-registered NBFCs. Get funded in 48 hours with zero collateral.",
  keywords:
    "bill discounting, working capital, construction finance, NBFC, EPC, sub-contractor financing, infrastructure loans, invoice discounting",
  metadataBase: new URL("https://gryork.com"),
  alternates: {
    canonical: "https://gryork.com",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://gryork.com",
    siteName: "Gryork",
    title: "Gryork - Fast Bill Discounting for Construction",
    description:
      "Stop waiting 90 days. Get funded in 48 hours with competitive rates from multiple NBFCs.",
    images: [
      {
        url: "https://gryork.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Gryork - Bill Discounting Platform",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@gryork",
    creator: "@gryork",
    title: "Gryork - Fast Bill Discounting Platform",
    description: "Get funded in 48 hours. No collateral. Multiple NBFC options.",
    images: ["https://gryork.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  },
  verification: {
    google: "google-site-verification-code",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Gryork",
              url: "https://gryork.com",
              logo: "https://gryork.com/logo.png",
              description: "India's bill discounting platform for construction finance",
              sameAs: [
                "https://twitter.com/gryork",
                "https://linkedin.com/company/gryork",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+91-XXX-XXX-XXXX",
                contactType: "Customer Support",
              },
              address: {
                "@type": "PostalAddress",
                streetAddress: "Tech Park",
                addressLocality: "India",
                postalCode: "XXX XXX",
                addressCountry: "IN",
              },
            }),
          }}
        />
      </head>
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}

