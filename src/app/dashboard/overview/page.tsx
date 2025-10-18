import { Metadata } from 'next';
import OverViewLayout from './layout';

export const metadata: Metadata = {
  title: 'A3S Admin | Dashboard Overview',
  description:
    'A3S accessibility compliance dashboard overview with key metrics and insights.'
};

// Force dynamic rendering - this page fetches data from database
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function OverviewPage() {
  return <OverViewLayout />;
}
