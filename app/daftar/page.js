import AuthPage from "../../components/AuthPage";

export const metadata = {
  title: "Buat Akun — Dewasa Ayu",
  description: "Buat akun Dewasa Ayu dan mulai menyusun persiapan pernikahan bersama."
};

export default function RegisterPage() {
  return <AuthPage mode="register" />;
}
