import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlannerApp from "../components/PlannerApp";

const KUNCI = "dewasa-ayu-planner-v2";
const baca = () => JSON.parse(window.localStorage.getItem(KUNCI));

/* Checklist adalah modul inti dan yang paling lama cacat: sampai baru-baru ini
   tugas hanya bisa ditambah, tidak bisa diubah maupun dihapus. Tes ini menjaga
   supaya kemampuan itu tidak hilang lagi tanpa ketahuan. */

const bukaChecklist = async (pengguna) => {
  await screen.findByText("Checklist Pernikahan");
  await pengguna.click(screen.getByRole("button", { name: /Checklist/ }));
  await screen.findByText("Checklist persiapan");
};

describe("Checklist", () => {
  beforeEach(() => window.localStorage.clear());

  it("menambah tugas baru beserta tenggat dan vendornya", async () => {
    const pengguna = userEvent.setup();
    render(<PlannerApp />);
    await bukaChecklist(pengguna);

    await pengguna.click(screen.getByRole("button", { name: /Tambah tugas/ }));
    const dialog = await screen.findByText("Tambah Tugas");
    expect(dialog).toBeInTheDocument();

    await pengguna.type(screen.getByLabelText("Nama tugas"), "Pesan penjor");
    await pengguna.type(screen.getByLabelText("Vendor"), "Pak Wayan");
    await pengguna.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      const tugas = baca().checklist.find((t) => t.task === "Pesan penjor");
      expect(tugas).toBeTruthy();
      expect(tugas.vendor).toBe("Pak Wayan");
    });
  });

  it("mengubah tugas yang sudah ada lewat modal terisi otomatis", async () => {
    const pengguna = userEvent.setup();
    render(<PlannerApp />);
    await bukaChecklist(pengguna);

    const tombolEdit = screen.getAllByRole("button", { name: "Edit" })[0];
    await pengguna.click(tombolEdit);

    // Inti perbaikannya: modal harus terisi data tugas, bukan kosong.
    const kolom = await screen.findByLabelText("Nama tugas");
    expect(kolom).toHaveValue("Mulai Pre Marital Booster H-6");

    await pengguna.clear(kolom);
    await pengguna.type(kolom, "Pre Marital Booster (diubah)");
    await pengguna.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      const daftar = baca().checklist;
      expect(daftar.some((t) => t.task === "Pre Marital Booster (diubah)")).toBe(true);
      // Mengubah tidak boleh menambah baris baru.
      expect(daftar).toHaveLength(38);
    });
  });

  it("menghapus tugas setelah dikonfirmasi", async () => {
    const pengguna = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<PlannerApp />);
    await bukaChecklist(pengguna);

    await pengguna.click(screen.getAllByRole("button", { name: "Hapus" })[0]);
    await waitFor(() => expect(baca().checklist).toHaveLength(37));
  });

  it("tidak menghapus apa pun kalau konfirmasi dibatalkan", async () => {
    const pengguna = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<PlannerApp />);
    await bukaChecklist(pengguna);

    await pengguna.click(screen.getAllByRole("button", { name: "Hapus" })[0]);
    await new Promise((r) => setTimeout(r, 120));
    expect(baca().checklist).toHaveLength(38);
  });

  it("menandai selesai lewat centang dan menyetel statusnya", async () => {
    const pengguna = userEvent.setup();
    render(<PlannerApp />);
    await bukaChecklist(pengguna);

    const centang = screen.getAllByRole("button", { name: /^Tandai selesai:/ })[0];
    await pengguna.click(centang);

    await waitFor(() => {
      const tugas = baca().checklist[0];
      expect(tugas.done).toBe(true);
      expect(tugas.status).toBe("DONE");
    });
  });

  it("menyaring tugas menurut status", async () => {
    const pengguna = userEvent.setup();
    render(<PlannerApp />);
    await bukaChecklist(pengguna);

    await pengguna.click(screen.getAllByRole("button", { name: /^Tandai selesai:/ })[0]);
    await waitFor(() => expect(baca().checklist[0].done).toBe(true));

    const daftar = document.querySelector(".checklist-list");
    await pengguna.click(screen.getByRole("button", { name: /Selesai/ }));
    await waitFor(() => {
      expect(within(daftar).getAllByRole("button", { name: "Edit" })).toHaveLength(1);
    });
  });
});
