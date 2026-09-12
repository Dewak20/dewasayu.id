import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, url } from "../lib/situs";

/* JSON-LD untuk mesin pencari. Dirender sebagai <script type="application/ld+json">
   di server, jadi tidak menambah JavaScript yang diunduh pengunjung.

   Dipakai karena konten wariga/kalender di situs ini adalah kandidat kuat rich
   result: artikel penjelasan, daftar istilah (cocok FAQ), dan remah navigasi. */

function Ld({ data }) {
  return (
    <script
      type="application/ld+json"
      // Konten dibentuk di server dari data kita sendiri, bukan masukan pengguna.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Identitas situs — dipasang sekali di beranda. */
export function LdSitus() {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": url("/#website"),
            url: SITE_URL,
            name: SITE_NAME,
            description: SITE_DESCRIPTION,
            inLanguage: "id-ID"
          },
          {
            "@type": "Organization",
            "@id": url("/#organisasi"),
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION
          }
        ]
      }}
    />
  );
}

/** Artikel penjelasan (hub dewasa ayu maupun artikel MDX). */
export function LdArtikel({ judul, deskripsi, jalur, terbit, diubah }) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: judul,
        description: deskripsi,
        inLanguage: "id-ID",
        mainEntityOfPage: { "@type": "WebPage", "@id": url(jalur) },
        author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        ...(terbit ? { datePublished: terbit } : {}),
        ...(diubah || terbit ? { dateModified: diubah || terbit } : {})
      }}
    />
  );
}

/** Remah navigasi. `jejak` = [{ nama, jalur }], urut dari beranda. */
export function LdRemah({ jejak }) {
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: jejak.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.nama,
          item: url(item.jalur)
        }))
      }}
    />
  );
}

/** Tanya-jawab. `tanya` = [{ tanya, jawab }] — jawab berupa teks biasa. */
export function LdFaq({ tanya }) {
  if (!tanya?.length) return null;
  return (
    <Ld
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: tanya.map((t) => ({
          "@type": "Question",
          name: t.tanya,
          acceptedAnswer: { "@type": "Answer", text: t.jawab }
        }))
      }}
    />
  );
}
