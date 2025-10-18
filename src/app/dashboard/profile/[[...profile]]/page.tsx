import ProfileViewPage from '@/features/profile/components/profile-view-page';

export const metadata = {
  title: 'Dashboard : Profile'
};

// Force dynamic rendering - child component likely uses auth/user data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  return <ProfileViewPage />;
}
