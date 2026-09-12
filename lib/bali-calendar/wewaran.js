// Siklus wewaran & pawukon kalender Bali.
// Epoch dan offset di bawah ini divalidasi terhadap 5.607 hari dari kalenderbali.org (1970-2100).

export const WUKU = [
  "Sinta", "Landep", "Ukir", "Kulantir", "Tolu", "Gumbreg", "Wariga", "Warigadean",
  "Julungwangi", "Sungsang", "Dunggulan", "Kuningan", "Langkir", "Medangsia", "Pujut",
  "Pahang", "Krulut", "Merakih", "Tambir", "Medangkungan", "Matal", "Uye", "Menail",
  "Prangbakat", "Bala", "Ugu", "Wayang", "Kulawu", "Dukut", "Watugunung"
];

export const SAPTAWARA = ["Redite", "Soma", "Anggara", "Buda", "Wraspati", "Sukra", "Saniscara"];
export const PANCAWARA = ["Umanis", "Paing", "Pon", "Wage", "Keliwon"];
export const TRIWARA = ["Pasah", "Beteng", "Kajeng"];
export const CATURWARA = ["Sri", "Laba", "Jaya", "Menala"];
export const SADWARA = ["Tungleh", "Aryang", "Urukung", "Paniron", "Was", "Maulu"];
export const ASTAWARA = ["Sri", "Indra", "Guru", "Yama", "Ludra", "Brahma", "Kala", "Uma"];
export const SANGAWARA = ["Dangu", "Jangur", "Gigis", "Nohan", "Ogan", "Erangan", "Urungan", "Tulus", "Dadi"];
export const DASAWARA = ["Pandita", "Pati", "Suka", "Duka", "Sri", "Manuh", "Manusa", "Raja", "Dewa", "Raksasa"];
export const DWIWARA = ["Menga", "Pepet"];

export const URIP_SAPTAWARA = { Redite: 5, Soma: 4, Anggara: 3, Buda: 7, Wraspati: 8, Sukra: 6, Saniscara: 9 };
export const URIP_PANCAWARA = { Umanis: 5, Paing: 9, Pon: 7, Wage: 4, Keliwon: 8 };

// Jejepan diturunkan dari sadwara; kalenderbali.org menampilkannya sebagai "Ingkel Jejepan".
export const JEJEPAN = {
  Tungleh: "Mina", Aryang: "Taru", Urukung: "Sato",
  Paniron: "Patra", Was: "Wong", Maulu: "Paksi"
};

// Ingkel wuku berganti tiap wuku, berulang tiap 6 wuku.
export const INGKEL_WUKU = ["Wong", "Sato", "Mina", "Manuk", "Taru", "Buku"];

export const PAWUKON_OFFSET = 32; // (hari sejak 1970-01-01 + 32) mod 210 = indeks pawukon
export const PANCAWARA_OFFSET = 3;
