/**
 * A3S Branding Constants and Utilities
 * Centralized branding configuration for consistent theming across the application
 */

export const A3S_BRAND = {
  name: 'A3S',
  fullName: 'A3S Accessibility Solutions',
  tagline: 'AI-Powered, Human-Perfected',
  description:
    'Comprehensive WCAG 2.2 AA compliance solutions with AI-powered automation and expert oversight.',

  // URLs
  urls: {
    demo: 'https://demo.a3s.app',
    website: 'https://a3s.app',
    support: 'mailto:support@a3s.app',
    admin: 'mailto:admin@a3s.app'
  },

  // Colors (matching Tailwind theme)
  colors: {
    primary: {
      light: '#2563eb', // blue-600
      dark: '#3b82f6' // blue-500
    },
    secondary: {
      light: '#059669', // emerald-600
      dark: '#10b981' // emerald-500
    },
    accent: {
      light: '#dc2626', // red-600
      dark: '#ef4444' // red-500
    },
    background: {
      light: '#ffffff',
      dark: '#09090b'
    }
  },

  // Asset paths
  assets: {
    icons: {
      black: '/assets/A3S Branding/A3S Website Icon/A3S Black Icon.svg',
      white: '/assets/A3S Branding/A3S Website Icon/A3S White Icon.svg',
      blackPng: '/assets/A3S Branding/A3S Website Icon/A3S Black Icon.png',
      whitePng: '/assets/A3S Branding/A3S Website Icon/A3S White Icon.png'
    },
    logos: {
      black: '/assets/A3S Branding/A3S Website Logo/A3S black logo.svg',
      white: '/assets/A3S Branding/A3S Website Logo/A3S White logo.svg',
      blackPng: '/assets/A3S Branding/A3S Website Logo/A3S black logo.png',
      whitePng: '/assets/A3S Branding/A3S Website Logo/A3S White logo.png'
    },
    text: {
      black: '/assets/A3S Branding/A3S Website Text/A3S Black Text.svg',
      white: '/assets/A3S Branding/A3S Website Text/A3S White Text.svg',
      blackPng: '/assets/A3S Branding/A3S Website Text/A3S Black Text.png',
      whitePng: '/assets/A3S Branding/A3S Website Text/A3S White Text.png'
    }
  },

  // Typography
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingFontFamily: 'Inter, system-ui, sans-serif'
  },

  // Accessibility focus
  accessibility: {
    wcagLevel: 'AA',
    wcagVersion: '2.2',
    complianceStandards: ['WCAG 2.2 AA', 'Section 508', 'ADA']
  }
} as const;

/**
 * Get the appropriate asset based on theme
 */
export function getThemedAsset(
  assetType: 'icons' | 'logos' | 'text',
  isDark: boolean,
  format: 'svg' | 'png' = 'svg'
): string {
  const assets = A3S_BRAND.assets[assetType];
  const suffix = format === 'png' ? 'Png' : '';
  const theme = isDark ? 'white' : 'black';
  return assets[`${theme}${suffix}` as keyof typeof assets];
}

/**
 * Get theme-appropriate color
 */
export function getThemedColor(
  colorType: 'primary' | 'secondary' | 'accent' | 'background',
  isDark: boolean
): string {
  return A3S_BRAND.colors[colorType][isDark ? 'dark' : 'light'];
}

/**
 * Generate consistent page titles
 */
export function generatePageTitle(pageTitle?: string): string {
  const baseTitle = 'A3S Admin Dashboard';
  return pageTitle ? `${pageTitle} | ${baseTitle}` : baseTitle;
}

/**
 * Generate consistent meta descriptions
 */
export function generateMetaDescription(customDescription?: string): string {
  return customDescription || A3S_BRAND.description;
}

/**
 * Brand-consistent CSS custom properties
 */
export const brandCSSVariables = {
  '--brand-primary': A3S_BRAND.colors.primary.light,
  '--brand-primary-dark': A3S_BRAND.colors.primary.dark,
  '--brand-secondary': A3S_BRAND.colors.secondary.light,
  '--brand-secondary-dark': A3S_BRAND.colors.secondary.dark,
  '--brand-accent': A3S_BRAND.colors.accent.light,
  '--brand-accent-dark': A3S_BRAND.colors.accent.dark,
  '--brand-bg': A3S_BRAND.colors.background.light,
  '--brand-bg-dark': A3S_BRAND.colors.background.dark
} as const;
