import { Metadata } from 'next';
import SignUpViewPage from '@/features/auth/components/sign-up-view';

export const metadata: Metadata = {
  title: 'A3S Admin | Sign Up',
  description:
    'Join A3S accessibility compliance platform. Create your account to start comprehensive WCAG 2.2 AA compliance with our 6-step systematic approach.'
};

export default async function Page() {
  return <SignUpViewPage />;
}
