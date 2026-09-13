import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlannerApp from "../components/PlannerApp";

const KUNCI = "dewasa-ayu-planner-v2";
const baca = () => JSON.parse(window.localStorage.getItem(KUNCI));

/* Ekspor/impor adalah satu-satunya jalan pulih kalau data browser terhapus.
   Kalau impor diam-diam menerima berkas yang salah, akibatnya justru lebih
   buruk daripada tidak punya fitur ini sama sekali. */

function siapkanPenangkapUnduhan() {
  const berkas = {};
  const blobAsli = URL.createObjectURL;
  URL.createObjectURL = (blob) => { berkas.blob = blob; return "blob:uji"; };
  URL.revokeObjectURL = () => {};
  const klikAsli = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () { berkas.nama = this.download; };
  return {
    berkas,
    pulihkan: () => { URL.createObjectURL = blobAsli; HTMLAnchorElement.prototype.click = klikAsli; }
  };
}

const unggah = async (pengguna, isi, nama = "cadangan.json") => {
  const input = document.querySelector('.backup-actions input[type=file]');
  await pengguna.upload(input, new File([isi], nama, { type: "application/json" }));
};

describe("Cadangan data", () => {
  beforeEach(() => window.localStorage.clear());

  it("mengekspor seluruh data sebagai JSON bernama tanggal", async () => {
    const pengguna = userEvent.setup();
    const { berkas, pulihkan } = siapkanPenangkapUnduhan();
    try {
      render(<PlannerApp />);
      await screen.findByText("Simpan salinan persiapanmu");
      await pengguna.click(screen.getByRole("button", { name: /Unduh cadangan/ }));

      await waitFor(() => expect(berkas.blob).toBeTruthy());
      const isi = JSON.parse(await berkas.blob.text());
      expect(isi.project).toBeTruthy();
      expect(isi.checklist).toHaveLength(38);
      expect(isi.meta.exportedAt).toBeTruthy();
      expect(berkas.nama).toMatch(/^dewasa-ayu-.*-\d{4}-\d{2}-\d{2}\.json$/);
    } finally {
      pulihkan();
    }
  });

  it("memulihkan data dari berkas cadangan", async () => {
    const pengguna = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<PlannerApp />);
    await screen.findByText("Simpan salinan persiapanmu");

    const cadangan = JSON.parse(JSON.stringify(baca() || {}));
    // Cadangan berisi keadaan berbeda supaya pemulihan benar-benar terlihat.
    const asal = await screen.findByText("Simpan salinan persiapanmu");
    expect(asal).toBeInTheDocument();

    const isiCadangan = { ...cadangan, project: { ...cadangan.project, couple: "Uji & Pulih" } };
    await unggah(pengguna, JSON.stringify(isiCadangan));

    await waitFor(() => expect(baca().project.couple).toBe("Uji & Pulih"));
  });

  it("menolak berkas JSON yang bukan cadangan planner", async () => {
    const pengguna = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<PlannerApp />);
    await screen.findByText("Simpan salinan persiapanmu");
    const sebelum = baca().project.couple;

    await unggah(pengguna, JSON.stringify({ halo: "ini bukan cadangan" }), "asing.json");

    expect(await screen.findByText(/bukan cadangan Dewasa Ayu yang sah/i)).toBeInTheDocument();
    expect(baca().project.couple).toBe(sebelum);
  });

  it("menolak berkas yang bukan JSON tanpa merusak data", async () => {
    const pengguna = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<PlannerApp />);
    await screen.findByText("Simpan salinan persiapanmu");
    const sebelum = baca().checklist.length;

    await unggah(pengguna, "ini bukan json <<<", "rusak.json");

    expect(await screen.findByText(/pastikan itu berkas .json hasil ekspor/i)).toBeInTheDocument();
    expect(baca().checklist).toHaveLength(sebelum);
  });

  it("tidak menimpa data kalau pengguna membatalkan konfirmasi", async () => {
    const pengguna = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<PlannerApp />);
    await screen.findByText("Simpan salinan persiapanmu");
    const sebelum = baca().project.couple;

    const cadangan = { ...baca(), project: { ...baca().project, couple: "Tidak Boleh Masuk" } };
    await unggah(pengguna, JSON.stringify(cadangan));

    await new Promise((r) => setTimeout(r, 120));
    expect(baca().project.couple).toBe(sebelum);
  });
});
