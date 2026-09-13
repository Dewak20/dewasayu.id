import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlannerApp from "../components/PlannerApp";

const KUNCI = "dewasa-ayu-planner-v2";
const baca = () => JSON.parse(window.localStorage.getItem(KUNCI));

/* Alur penyimpanan adalah satu-satunya hal yang memegang data pengguna.
   Kalau ini rusak, seluruh persiapan pernikahan hilang tanpa jejak — jadi
   inilah yang paling pantas dijaga tes, bukan detail tampilan. */

describe("Penyimpanan planner", () => {
  beforeEach(() => window.localStorage.clear());

  it("menyimpan perubahan ke localStorage", async () => {
    const pengguna = userEvent.setup();
    render(<PlannerApp />);

    await screen.findByText("Checklist Pernikahan");
    await pengguna.click(screen.getByRole("button", { name: /Checklist/ }));

    const centang = (await screen.findAllByRole("button", { name: /^Tandai selesai:/ }))[0];
    await pengguna.click(centang);

    await waitFor(() => {
      expect(baca().checklist.filter((t) => t.done)).toHaveLength(1);
    });
  });

  it("memuat kembali data tersimpan saat aplikasi dibuka lagi", async () => {
    const pengguna = userEvent.setup();
    const { unmount } = render(<PlannerApp />);

    await screen.findByText("Checklist Pernikahan");
    await pengguna.click(screen.getByRole("button", { name: /Checklist/ }));
    await pengguna.click((await screen.findAllByRole("button", { name: /^Tandai selesai:/ }))[0]);
    await waitFor(() => expect(baca().checklist.some((t) => t.done)).toBe(true));

    unmount();
    render(<PlannerApp />);

    // Kalau pemuatan gagal, data kembali ke bawaan Excel dan tak ada yang selesai.
    await waitFor(() => {
      expect(baca().checklist.filter((t) => t.done).length).toBeGreaterThan(0);
    });
  });

  it("tetap hidup dan memberi tahu pengguna saat browser menolak menyimpan", async () => {
    const pengguna = userEvent.setup();
    const asli = Storage.prototype.setItem;
    Storage.prototype.setItem = function (kunci, nilai) {
      if (kunci === KUNCI) {
        const galat = new Error("kuota penuh");
        galat.name = "QuotaExceededError";
        throw galat;
      }
      return asli.call(this, kunci, nilai);
    };

    try {
      render(<PlannerApp />);
      await screen.findByText("Checklist Pernikahan");
      await pengguna.click(screen.getByRole("button", { name: /Checklist/ }));
      await pengguna.click((await screen.findAllByRole("button", { name: /^Tandai selesai:/ }))[0]);

      // Inti regresinya: sebelum diperbaiki, ini melempar dan seluruh
      // aplikasi mati jadi layar kosong.
      const peringatan = await screen.findByRole("alert");
      expect(peringatan).toHaveTextContent(/Penyimpanan browser penuh/i);
      expect(screen.getByText("Checklist persiapan")).toBeInTheDocument();
    } finally {
      Storage.prototype.setItem = asli;
    }
  });

  it("mengabaikan data tersimpan yang rusak tanpa gagal render", async () => {
    window.localStorage.setItem(KUNCI, "{ bukan json yang sah");
    render(<PlannerApp />);
    expect(await screen.findByText("Checklist Pernikahan")).toBeInTheDocument();
  });
});
