import AuthPage from "../../components/AuthPage";

export const metadata = {
  title: "Masuk — Dewasa Ayu",
  description: "Masuk ke ruang persiapan pernikahan Dewasa Ayu."
};

export default function LoginPage() {
  return <AuthPage mode="login" />;
}
