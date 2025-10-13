import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SignUp as ClerkSignUpForm } from '@clerk/nextjs';
import {
  IconAccessible,
  IconShield,
  IconUsers,
  IconCheck
} from '@tabler/icons-react';
import { Metadata } from 'next';
import Link from 'next/link';
import { A3SAuthLogo } from '@/components/branding/a3s-logo';

export const metadata: Metadata = {
  title: 'A3S Admin | Sign Up',
  description:
    'Join A3S accessibility compliance platform. Get started with comprehensive WCAG 2.2 AA compliance solutions.'
};

export default function SignUpViewPage({ stars }: { stars: number }) {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/auth/sign-in'
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'absolute top-4 right-4 hidden md:top-8 md:right-8'
        )}
      >
        Sign In
      </Link>
      <div className='relative hidden h-full flex-col bg-gradient-to-br from-green-600 to-green-800 p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-gradient-to-br from-green-600/90 to-green-800/90' />
        <div className='relative z-20 flex items-center text-xl font-bold'>
          <A3SAuthLogo className='mr-3' />
        </div>
        <div className='relative z-20 mt-8 space-y-6'>
          <div>
            <h1 className='text-3xl leading-tight font-bold'>
              Join A3S
              <br />
              Accessibility Platform
            </h1>
            <p className='mt-2 text-xl font-semibold text-green-200'>
              Get Compliant Now
            </p>
            <p className='mt-4 text-lg text-green-100'>
              Start your journey to comprehensive WCAG compliance with our
              6-step systematic approach.
            </p>
          </div>

          <div className='space-y-4'>
            <div className='flex items-center space-x-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/10'>
                <IconCheck className='h-4 w-4 text-white' />
              </div>
              <span className='text-green-100'>Audit, Triage & Remediate</span>
            </div>
            <div className='flex items-center space-x-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/10'>
                <IconCheck className='h-4 w-4 text-white' />
              </div>
              <span className='text-green-100'>Verify, Document & Monitor</span>
            </div>
            <div className='flex items-center space-x-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/10'>
                <IconCheck className='h-4 w-4 text-white' />
              </div>
              <span className='text-green-100'>
                Real-time Progress Tracking
              </span>
            </div>
          </div>

          <div className='rounded-lg bg-white/5 p-4 backdrop-blur-sm'>
            <div className='mb-3 text-sm text-green-200'>What You Get:</div>
            <div className='space-y-2 text-sm text-green-100'>
              <div className='flex items-center space-x-2'>
                <IconShield className='h-3 w-3' />
                <span>Legal evidence packages</span>
              </div>
              <div className='flex items-center space-x-2'>
                <IconUsers className='h-3 w-3' />
                <span>IAAP certified experts</span>
              </div>
              <div className='flex items-center space-x-2'>
                <IconAccessible className='h-3 w-3' />
                <span>WCAG 2.2 AA compliance</span>
              </div>
            </div>
          </div>
        </div>
        <div className='relative z-20 mt-auto'>
          <div className='rounded-lg bg-white/5 p-4 backdrop-blur-sm'>
            <div className='mb-2 text-sm text-green-200'>Live Proof:</div>
            <div className='text-xs text-green-100'>
              <div className='font-semibold'>Color Contrast Fixed</div>
              <div>Before: 2.1:1 (Failed) → After: 4.8:1 (Passes)</div>
              <div className='mt-1 text-green-200'>WCAG 1.4.3 Verified ✓</div>
            </div>
          </div>
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-8'>
          <div className='space-y-2 text-center'>
            <div className='mb-4 flex items-center justify-center'>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/20'>
                <IconAccessible className='h-6 w-6 text-green-600 dark:text-green-400' />
              </div>
            </div>
            <h2 className='text-foreground text-2xl font-bold'>
              Join A3S Platform
            </h2>
            <p className='text-muted-foreground'>
              Create your account to start comprehensive accessibility
              compliance
            </p>
          </div>

          <ClerkSignUpForm
            initialValues={{
              emailAddress: 'admin@a3s.app'
            }}
          />

          <div className='space-y-4 text-center'>
            <div className='bg-muted/50 rounded-lg p-4'>
              <div className='text-foreground mb-2 text-sm font-medium'>
                What&apos;s included:
              </div>
              <div className='text-muted-foreground grid grid-cols-2 gap-2 text-xs'>
                <div className='flex items-center space-x-1'>
                  <IconCheck className='h-3 w-3 text-green-600' />
                  <span>6-Step Process</span>
                </div>
                <div className='flex items-center space-x-1'>
                  <IconCheck className='h-3 w-3 text-green-600' />
                  <span>Legal Protection</span>
                </div>
                <div className='flex items-center space-x-1'>
                  <IconCheck className='h-3 w-3 text-green-600' />
                  <span>Expert Support</span>
                </div>
                <div className='flex items-center space-x-1'>
                  <IconCheck className='h-3 w-3 text-green-600' />
                  <span>Real-time Tracking</span>
                </div>
              </div>
            </div>

            <p className='text-muted-foreground px-8 text-sm'>
              By creating an account, you agree to our{' '}
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
                Already have an account?{' '}
                <Link
                  href='/auth/sign-in'
                  className='hover:text-primary font-medium underline underline-offset-4'
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
