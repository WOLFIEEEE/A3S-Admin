export interface PlatformCredential {
  id: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'textarea' | 'checkbox';
  required: boolean;
  placeholder?: string;
  description?: string;
}

export interface PlatformConfig {
  label: string;
  credentials: PlatformCredential[];
}

export const PLATFORM_CREDENTIALS: Record<string, PlatformConfig> = {
  wordpress: {
    label: 'WordPress',
    credentials: [
      {
        id: 'wp_admin_username',
        label: 'WordPress Admin Username',
        type: 'text',
        required: true,
        placeholder: 'admin',
        description: 'WordPress admin login username'
      },
      {
        id: 'wp_admin_password',
        label: 'WordPress Admin Password (Temporary)',
        type: 'password',
        required: true,
        placeholder: '••••••••',
        description: 'Temporary password for WordPress admin access'
      },
      {
        id: 'ftp_access',
        label: 'FTP or cPanel Access Details',
        type: 'textarea',
        required: false,
        placeholder:
          'FTP Host: ftp.example.com\nUsername: user\nPassword: pass',
        description: 'FTP or cPanel credentials for theme and plugin file edits'
      },
      {
        id: 'theme_name',
        label: 'Active Theme Name',
        type: 'text',
        required: false,
        placeholder: 'Twenty Twenty-Four',
        description: 'Current active WordPress theme'
      },
      {
        id: 'active_plugins',
        label: 'Active Plugins List',
        type: 'textarea',
        required: false,
        placeholder: 'Plugin 1\nPlugin 2\nPlugin 3',
        description: 'List of currently active plugins'
      },
      {
        id: 'website_url',
        label: 'Website URL',
        type: 'url',
        required: true,
        placeholder: 'https://example.com',
        description: 'Main website URL'
      },
      {
        id: 'staging_url',
        label: 'Staging URL (if applicable)',
        type: 'url',
        required: false,
        placeholder: 'https://staging.example.com',
        description: 'Staging environment URL if available'
      },
      {
        id: 'accessibility_plugins',
        label: 'Accessibility Plugins/Reports Access',
        type: 'textarea',
        required: false,
        placeholder: 'Plugin names and access details',
        description: 'Access to any installed accessibility plugins or reports'
      },
      {
        id: 'testing_plugin_permission',
        label: 'Permission to install temporary testing plugin',
        type: 'checkbox',
        required: false,
        description: 'Allow installation of temporary testing plugins if needed'
      }
    ]
  },
  shopify: {
    label: 'Shopify',
    credentials: [
      {
        id: 'shopify_admin_email',
        label: 'Shopify Admin Email (for staff account)',
        type: 'text',
        required: true,
        placeholder: 'admin@example.com',
        description: 'Email for temporary staff account creation'
      },
      {
        id: 'store_url',
        label: 'Storefront URL',
        type: 'url',
        required: true,
        placeholder: 'https://store.myshopify.com',
        description: 'Main Shopify store URL'
      },
      {
        id: 'theme_name',
        label: 'Active Theme Name',
        type: 'text',
        required: false,
        placeholder: 'Dawn',
        description: 'Current active Shopify theme'
      },
      {
        id: 'theme_edit_permission',
        label: 'Permission to edit theme code',
        type: 'checkbox',
        required: true,
        description: 'Allow editing of Liquid files, CSS, and JavaScript'
      },
      {
        id: 'third_party_apps',
        label: 'Third-party Apps affecting UI',
        type: 'textarea',
        required: false,
        placeholder: 'App 1\nApp 2\nApp 3',
        description: 'List of installed apps that affect the user interface'
      },
      {
        id: 'custom_modifications',
        label: 'Custom sections or checkout modifications',
        type: 'textarea',
        required: false,
        placeholder: 'Custom section 1\nCheckout modification 1',
        description: 'List of custom sections or checkout modifications'
      }
    ]
  },
  drupal: {
    label: 'Drupal',
    credentials: [
      {
        id: 'drupal_admin_username',
        label: 'Drupal Admin Username',
        type: 'text',
        required: true,
        placeholder: 'admin',
        description: 'Drupal backend admin username'
      },
      {
        id: 'drupal_admin_password',
        label: 'Drupal Admin Password',
        type: 'password',
        required: true,
        placeholder: '••••••••',
        description: 'Drupal backend admin password'
      },
      {
        id: 'ssh_sftp_access',
        label: 'SSH or SFTP Access Details',
        type: 'textarea',
        required: false,
        placeholder:
          'Host: server.example.com\nUsername: user\nPassword/Key: ...',
        description: 'SSH or SFTP access to theme/module directories'
      },
      {
        id: 'theme_name_version',
        label: 'Theme Name and Version',
        type: 'text',
        required: false,
        placeholder: 'Bartik 9.x',
        description: 'Current theme name and version'
      },
      {
        id: 'installed_modules',
        label: 'Installed Modules (especially custom ones)',
        type: 'textarea',
        required: false,
        placeholder: 'Module 1\nCustom Module 2\nModule 3',
        description: 'List of installed modules, especially custom ones'
      },
      {
        id: 'staging_environment',
        label: 'Staging Environment Access',
        type: 'url',
        required: false,
        placeholder: 'https://staging.example.com',
        description: 'Access to staging environment for testing changes'
      }
    ]
  },
  wix: {
    label: 'Wix',
    credentials: [
      {
        id: 'wix_collaborator_email',
        label: 'Email for Wix Collaborator Invite',
        type: 'text',
        required: true,
        placeholder: 'collaborator@example.com',
        description: 'Email address to send Wix collaborator invite'
      },
      {
        id: 'website_url',
        label: 'Website URL',
        type: 'url',
        required: true,
        placeholder: 'https://example.wixsite.com/mysite',
        description: 'Main Wix website URL'
      },
      {
        id: 'template_edit_permission',
        label: 'Permission to edit templates and site design',
        type: 'checkbox',
        required: true,
        description: 'Allow editing of templates and site design elements'
      },
      {
        id: 'custom_code_embeds',
        label: 'Custom Code Embeds Information',
        type: 'textarea',
        required: false,
        placeholder: 'Custom HTML/CSS/JS details',
        description: 'Information about any custom code embeds'
      }
    ]
  },
  squarespace: {
    label: 'Squarespace',
    credentials: [
      {
        id: 'squarespace_email',
        label: 'Email for Contributor Access',
        type: 'text',
        required: true,
        placeholder: 'contributor@example.com',
        description:
          'Email for Squarespace contributor access (Administrator role preferred)'
      },
      {
        id: 'website_url',
        label: 'Website URL',
        type: 'url',
        required: true,
        placeholder: 'https://example.squarespace.com',
        description: 'Main Squarespace website URL'
      },
      {
        id: 'template_name',
        label: 'Template Name',
        type: 'text',
        required: false,
        placeholder: 'Brine',
        description: 'Current Squarespace template name'
      },
      {
        id: 'custom_code_access',
        label: 'Access to custom code sections',
        type: 'checkbox',
        required: false,
        description: 'Access to custom code sections if used'
      }
    ]
  },
  webflow: {
    label: 'Webflow',
    credentials: [
      {
        id: 'webflow_email',
        label: 'Email for Designer Access',
        type: 'text',
        required: true,
        placeholder: 'designer@example.com',
        description:
          'Email for Webflow Designer access (Collaborator or Editor role)'
      },
      {
        id: 'published_site_url',
        label: 'Published Site URL',
        type: 'url',
        required: true,
        placeholder: 'https://example.webflow.io',
        description: 'Published Webflow site URL'
      },
      {
        id: 'designer_access',
        label: 'Access to Webflow Designer',
        type: 'checkbox',
        required: true,
        description: 'Access to Webflow Designer for structure adjustments'
      },
      {
        id: 'custom_code_embeds',
        label: 'Custom Code Embeds',
        type: 'textarea',
        required: false,
        placeholder: 'JavaScript embeds\niframes\nother custom code',
        description: 'Custom code embeds (JS, iframes, etc.)'
      }
    ]
  },
  tylertech: {
    label: 'TylerTech (GovCMS / Munis Platform)',
    credentials: [
      {
        id: 'admin_dashboard_username',
        label: 'Admin Dashboard Username',
        type: 'text',
        required: true,
        placeholder: 'admin',
        description: 'TylerTech admin dashboard username'
      },
      {
        id: 'admin_dashboard_password',
        label: 'Admin Dashboard Password',
        type: 'password',
        required: true,
        placeholder: '••••••••',
        description: 'TylerTech admin dashboard password'
      },
      {
        id: 'staging_instance',
        label: 'Staging Instance Access',
        type: 'url',
        required: false,
        placeholder: 'https://staging.tylertech.example.com',
        description: 'Access to staging instance if available'
      },
      {
        id: 'template_export_ability',
        label: 'Ability to export affected templates or pages',
        type: 'checkbox',
        required: false,
        description: 'Permission to export templates or pages for analysis'
      },
      {
        id: 'it_support_contact',
        label: 'IT Support Point of Contact',
        type: 'text',
        required: false,
        placeholder: 'John Doe - john@example.com - (555) 123-4567',
        description: 'Point of contact for IT support (for restricted systems)'
      }
    ]
  }
};

export function getPlatformCredentials(
  platform: string
): PlatformConfig | null {
  return PLATFORM_CREDENTIALS[platform] || null;
}

export function getAllPlatforms(): Array<{ value: string; label: string }> {
  return Object.entries(PLATFORM_CREDENTIALS).map(([key, config]) => ({
    value: key,
    label: config.label
  }));
}
