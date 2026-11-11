import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthScreen, safeNext } from "@/components/auth-screen";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  const next = safeNext((await searchParams).next);

  if (user) redirect(next);

  return <AuthScreen mode="signin" next={next} />;
}
