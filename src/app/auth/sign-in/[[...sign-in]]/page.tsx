import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sign-in-view';

export const metadata: Metadata = {
  title: 'A3S Admin | Sign In',
  description:
    'Sign in to your A3S accessibility compliance dashboard. Manage WCAG 2.2 AA compliance with AI-powered automation and expert oversight.'
};

export default async function Page() {
  return <SignInViewPage />;
}
