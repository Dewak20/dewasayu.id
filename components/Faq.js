import { LdFaq } from "./DataTerstruktur";

/* Bagian tanya-jawab yang tampil di halaman sekaligus menghasilkan JSON-LD
   FAQPage dari daftar yang sama persis.

   Satu sumber data dipakai untuk keduanya bukan tanpa alasan: Google
   mensyaratkan isi FAQPage benar-benar terlihat pengunjung. Markup yang
   menjanjikan jawaban yang tidak ada di halaman melanggar pedomannya.

   Catatan ekspektasi: sejak 2023 rich result FAQ dibatasi untuk situs
   pemerintah dan kesehatan, jadi nilai bagian ini terutama pada kontennya
   sendiri — menjawab pertanyaan panjang yang diketik orang, dan menjadi
   bahan featured snippet serta ringkasan AI. */

export default function Faq({ judul = "Pertanyaan yang sering muncul", daftar }) {
  if (!daftar?.length) return null;

  return (
    <section className="da-faq" aria-labelledby="faq-judul">
      <LdFaq tanya={daftar} />
      <h2 id="faq-judul">{judul}</h2>
      <div className="da-faq-daftar">
        {daftar.map((item) => (
          <details key={item.tanya} className="da-faq-item">
            <summary>{item.tanya}</summary>
            <p>{item.jawab}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
