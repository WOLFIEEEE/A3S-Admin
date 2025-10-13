import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sign-in-view';

export const metadata: Metadata = {
  title: 'A3S Admin | Sign In',
  description:
    'Sign in to your A3S accessibility compliance dashboard. Manage WCAG 2.2 AA compliance with AI-powered automation and expert oversight.'
};

export default async function Page() {
  let stars = 3000; // Default value

  try {
    const response = await fetch(
      'https://api.github.com/repos/kiranism/next-shadcn-dashboard-starter',
      {
        next: { revalidate: 86400 }
      }
    );

    if (response.ok) {
      const data = await response.json();
      stars = data.stargazers_count || stars; // Update stars if API response is valid
    }
  } catch (error) {
    // Error fetching GitHub stars, using default value
  }
  return <SignInViewPage stars={stars} />;
}
