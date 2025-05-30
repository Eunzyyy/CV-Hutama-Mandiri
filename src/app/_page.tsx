import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import PublicHome from "./(public)/page";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // Jika user sudah login, redirect ke dashboard sesuai role
  if (session) {
    const role = session.user.role.toLowerCase();
    return redirect(`/${role}`);
  }
  
  // Jika belum login, tampilkan halaman home publik
  return <PublicHome />;
}