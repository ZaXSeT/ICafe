import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ReservationLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // If user is not logged in, redirect to login page
  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
