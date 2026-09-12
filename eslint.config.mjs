import next from "eslint-config-next/core-web-vitals";

/* Konfigurasi sengaja tipis: tujuannya menangkap kesalahan yang benar-benar
   merusak (hook dipanggil bersyarat, key hilang, gambar tanpa alt), bukan
   memaksakan gaya penulisan pada kode yang sudah ada. */

export default [
  {
    ignores: [".next/**", "node_modules/**", "out/**", "scripts/bali-calendar/raw/**"]
  },
  ...next,
  {
    rules: {
      // Peringatan, bukan galat: penanda berguna, tapi tidak boleh
      // menggagalkan CI untuk hal yang tidak merusak apa pun.
      "@next/next/no-img-element": "warn",
      "react/no-unescaped-entities": "off",

      // Petunjuk optimasi React Compiler, bukan cacat perilaku: artinya satu
      // komponen tidak ikut dioptimasi otomatis. Menyusun ulang mesin kalender
      // yang sudah tervalidasi hanya demi ini tidak sepadan risikonya.
      "react-hooks/preserve-manual-memoization": "warn"
    }
  }
];
