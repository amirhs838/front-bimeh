import { AppShell } from "@/components/layout/AppShell";
import { Scroll1 } from "@/components/sections/Scroll1";
import { Scroll2 } from "@/components/sections/Scroll2";
import { Scroll3 } from "@/components/sections/Scroll3";
import { Footer } from "@/components/sections/Footer";
import { site } from "@/data/site";

/** Optional invisible JSON-LD Organization (contact values are placeholders). */
function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    alternateName: site.latinName,
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://bimeh.example.com", // PLACEHOLDER
    email: site.footerContact.email, // PLACEHOLDER
    telephone: "+98 21 9100 0000", // PLACEHOLDER (matches the footer display copy)
    address: {
      "@type": "PostalAddress",
      addressLocality: "تهران",
      streetAddress: site.footerContact.address, // PLACEHOLDER
      addressCountry: "IR",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function Home() {
  return (
    <AppShell>
      <Scroll1 />
      <Scroll2 />
      <Scroll3 />
      <Footer />
      <OrganizationJsonLd />
    </AppShell>
  );
}
