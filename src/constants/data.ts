import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Clients',
    url: '/dashboard/clients',
    icon: 'users',
    shortcut: ['c', 'c'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Projects',
    url: '/dashboard/projects',
    icon: 'folder',
    shortcut: ['p', 'p'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Tickets',
    url: '/dashboard/tickets',
    icon: 'ticket',
    shortcut: ['t', 't'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Issues',
    url: '/dashboard/issues',
    icon: 'bug',
    shortcut: ['i', 'i'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Account',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'billing',
    isActive: true,

    items: [
      {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'Login',
        shortcut: ['l', 'l'],
        url: '/',
        icon: 'login'
      }
    ]
  }
];

export interface ClientActivity {
  id: number;
  name: string;
  email: string;
  activity: string;
  company: string;
  image: string;
  initials: string;
  timestamp: string;
}

export const recentClientActivity: ClientActivity[] = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john@saguachecounty.net',
    activity: 'New project created',
    company: 'Saguache County, CO',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'JS',
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@gilpincounty.org',
    activity: 'Ticket resolved',
    company: 'Gilpin County, CO',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'SJ',
    timestamp: '4 hours ago'
  },
  {
    id: 3,
    name: 'Mike Rodriguez',
    email: 'mike@wilftek.com',
    activity: 'File uploaded',
    company: 'Wilftek',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'MR',
    timestamp: '6 hours ago'
  },
  {
    id: 4,
    name: 'Lisa Chen',
    email: 'lisa@kitcarsoncounty.org',
    activity: 'Compliance review completed',
    company: 'Kit Carson County, CO',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'LC',
    timestamp: '1 day ago'
  },
  {
    id: 5,
    name: 'David Wilson',
    email: 'david@mrocorp.com',
    activity: 'Project milestone reached',
    company: 'MRO Corp',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'DW',
    timestamp: '2 days ago'
  }
];
