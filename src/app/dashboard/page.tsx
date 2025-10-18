import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

// Force dynamic rendering - this page uses authentication
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    return redirect('/auth/sign-in');
  } else {
    redirect('/dashboard/overview');
  }
}
