import { Metadata } from 'next';
import OverViewLayout from './layout';

export const metadata: Metadata = {
  title: 'A3S Admin | Dashboard Overview',
  description:
    'A3S accessibility compliance dashboard overview with key metrics and insights.'
};

export default function OverviewPage() {
  return <OverViewLayout />;
}
