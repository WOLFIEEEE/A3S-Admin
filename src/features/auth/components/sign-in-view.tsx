import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SignIn as ClerkSignInForm } from '@clerk/nextjs';
import { IconAccessible, IconShield, IconUsers } from '@tabler/icons-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { A3SAuthLogo } from '@/components/branding/a3s-logo';

export const metadata: Metadata = {
  title: 'A3S Admin | Sign In',
  description: 'Sign in to your A3S accessibility compliance dashboard.'
};

export default function SignInViewPage() {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/dashboard'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute top-4 right-4 hidden md:top-8 md:right-8'
        )}
      >
        Dashboard
      </Link>
      <div className='relative hidden h-full flex-col bg-gradient-to-br from-blue-600 to-blue-800 p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-800/90' />
        <div className='relative z-20 flex items-center text-xl font-bold'>
          <A3SAuthLogo className='mr-3' />
        </div>
        <div className='relative z-20 mt-8 space-y-6'>
          <div>
            <h1 className='text-3xl leading-tight font-bold'>
              Accessibility Compliance
              <br />
              Reduce Legal Risk
            </h1>
            <p className='mt-2 text-xl font-semibold text-blue-200'>
              AI-Powered, Human-Perfected
            </p>
            <p className='mt-4 text-lg text-blue-100'>
              Comprehensive compliance solutions that help reduce your legal
              troubles with our hybrid AI-human approach to WCAG compliance.
            </p>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center space-x-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/10'>
                <IconShield className='h-4 w-4 text-white' />
              </div>
              <span className='text-blue-100'>
                Legal Documentation Included
              </span>
            </div>
            <div className='flex items-center space-x-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/10'>
                <IconUsers className='h-4 w-4 text-white' />
              </div>
              <span className='text-blue-100'>IAAP Certified Experts</span>
            </div>
            <div className='flex items-center space-x-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/10'>
                <IconAccessible className='h-4 w-4 text-white' />
              </div>
              <span className='text-blue-100'>WCAG 2.2 AA Guaranteed</span>
            </div>
          </div>

          <div className='rounded-lg bg-white/5 p-4 backdrop-blur-sm'>
            <div className='mb-2 text-sm text-blue-200'>
              Trusted by Government & Enterprise:
            </div>
            <div className='grid grid-cols-2 gap-2 text-xs text-blue-100'>
              <div>• Saguache County, CO</div>
              <div>• Gilpin County, CO</div>
              <div>• Kit Carson County, CO</div>
              <div>• Wilftek</div>
            </div>
          </div>
        </div>
        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;With A3S, we&apos;ve cut our compliance and remediation
              time in half. What used to feel like a burden is now a seamless
              part of the established development process.&rdquo;
            </p>
            <footer className='text-sm text-blue-200'>
              Jason McKee, CEO, P15R
            </footer>
          </blockquote>
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-8'>
          <div className='space-y-2 text-center'>
            <div className='mb-4 flex items-center justify-center'>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/20'>
                <IconAccessible className='h-6 w-6 text-blue-600 dark:text-blue-400' />
              </div>
            </div>
            <h2 className='text-foreground text-2xl font-bold'>
              Welcome to A3S Admin
            </h2>
            <p className='text-muted-foreground'>
              Sign in to access your accessibility compliance dashboard
            </p>
          </div>

          <ClerkSignInForm
            initialValues={{
              emailAddress: 'admin@a3s.app'
            }}
          />

          <div className='space-y-4 text-center'>
            <p className='text-muted-foreground px-8 text-sm'>
              By signing in, you agree to our{' '}
              <Link
                href='/terms'
                className='hover:text-primary font-medium underline underline-offset-4'
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href='/privacy'
                className='hover:text-primary font-medium underline underline-offset-4'
              >
                Privacy Policy
              </Link>
              .
            </p>

            <div className='border-border border-t pt-4'>
              <p className='text-muted-foreground text-xs'>
                Need help? Contact{' '}
                <Link
                  href='mailto:support@a3s.app'
                  className='hover:text-primary font-medium underline underline-offset-4'
                >
                  support@a3s.app
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
