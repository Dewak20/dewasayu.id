// Tahun yang punya halaman daftar hari baik pernikahan.
//
// Dipakai bersama oleh halaman induk /dewasa-ayu/pernikahan (untuk menautkan) dan
// generateStaticParams halaman tahunnya (untuk menentukan apa yang di-prerender),
// supaya keduanya tidak pernah berbeda.
//
// Tahun berjalan plus dua tahun ke depan: rentang yang realistis untuk orang yang
// sedang merencanakan pernikahan, dan cukup pendek supaya halaman tidak menumpuk.

export const TAHUN_TERBIT = (() => {
  const ini = new Date().getFullYear();
  return [ini, ini + 1, ini + 2];
})();

export const adalahTahunTerbit = (t) => TAHUN_TERBIT.includes(Number(t));
