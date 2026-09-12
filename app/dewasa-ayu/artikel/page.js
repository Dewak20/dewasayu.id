import Link from "next/link";
import ContentLayout from "../../../components/ContentLayout";
import { getAllArticles } from "../../../lib/artikel";

export const metadata = {
  title: "Artikel Dewasa Ayu — Catatan Seputar Hari Baik & Wariga Bali",
  description: "Kumpulan artikel pendek seputar dewasa ayu, wariga, dan tradisi Hindu Bali yang relevan untuk persiapan pernikahan.",
  alternates: { canonical: "/dewasa-ayu/artikel" },
  openGraph: {
    type: "article",
    url: "/dewasa-ayu/artikel",
    title: "Artikel Dewasa Ayu — Catatan Seputar Hari Baik & Wariga Bali",
    description: "Kumpulan artikel pendek seputar dewasa ayu, wariga, dan tradisi Hindu Bali yang relevan untuk persiapan pernikahan."
  }
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" });

export default function ArtikelIndex() {
  const articles = getAllArticles();

  return (
    <ContentLayout>
      <div className="da-crumbs">
        <Link href="/dewasa-ayu">Dewasa Ayu</Link>
        <span aria-hidden="true">/</span>
        <strong>Artikel</strong>
      </div>

      <div className="da-hero">
        <span className="eyebrow"><i aria-hidden="true">✦</i> Artikel</span>
        <h1>Catatan seputar dewasa ayu.</h1>
        <p className="da-lede">
          Tulisan pendek yang mengurai satu istilah atau kebiasaan pada satu waktu —
          diperbarui dari waktu ke waktu seiring pertanyaan yang paling sering muncul.
        </p>
      </div>

      <div className="da-hub-grid">
        {articles.map((article) => (
          <Link key={article.slug} className="da-hub-card" href={`/dewasa-ayu/artikel/${article.slug}`}>
            <span className="tag">{dateFormatter.format(new Date(article.date))}</span>
            <h3>{article.title}</h3>
            <p>{article.excerpt}</p>
            <span className="go">Baca selengkapnya →</span>
          </Link>
        ))}
      </div>

      <div className="da-cta">
        <h2>Sambil membaca, mulai siapkan pernikahannya.</h2>
        <p>Anggaran, uang adat, rangkaian acara, vendor, dan daftar tamu — dalam satu ruang kerja.</p>
        <Link className="btn btn-gold btn-lg" href="/daftar">Mulai siapkan pernikahan <i className="arrow" aria-hidden="true">↗</i></Link>
      </div>
    </ContentLayout>
  );
}
