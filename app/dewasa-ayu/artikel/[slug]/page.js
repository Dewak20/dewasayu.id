import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import ContentLayout from "../../../../components/ContentLayout";
import { getAllArticleSlugs, getArticleBySlug } from "../../../../lib/artikel";

export function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

// `params` adalah Promise sejak Next 15 dan wajib di-await sejak Next 16 —
// shim yang dulu mengizinkan akses sinkron sudah dibuang.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: `${article.meta.title} | Dewasa Ayu`,
    description: article.meta.description
  };
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" });

export default async function ArtikelDetail({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <ContentLayout>
      <div className="da-crumbs">
        <Link href="/dewasa-ayu">Dewasa Ayu</Link>
        <span aria-hidden="true">/</span>
        <Link href="/dewasa-ayu/artikel">Artikel</Link>
        <span aria-hidden="true">/</span>
        <strong>{article.meta.title}</strong>
      </div>

      <div className="da-hero">
        <span className="eyebrow"><i aria-hidden="true">✦</i> {dateFormatter.format(new Date(article.meta.date))}</span>
        <h1>{article.meta.title}</h1>
        <p className="da-lede">{article.meta.description}</p>
      </div>

      <div className="da-prose">
        <MDXRemote source={article.content} />
      </div>

      <div className="da-cta">
        <h2>Sudah dapat gambarannya?</h2>
        <p>Siapkan sisanya di satu tempat — anggaran, uang adat, rangkaian acara, vendor, sampai daftar tamu.</p>
        <Link className="btn btn-gold btn-lg" href="/daftar">Mulai siapkan pernikahan <i className="arrow" aria-hidden="true">↗</i></Link>
      </div>
    </ContentLayout>
  );
}
