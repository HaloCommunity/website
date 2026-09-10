import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type {Options as DocsOptions} from '@docusaurus/plugin-content-docs';
import type {Options as PageOptions} from '@docusaurus/plugin-content-pages';
import type {PluginOptions as ShowcasePluginOptions} from '@homotechsual/docusaurus-plugin-showcase';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
// Import the Docusaurus version.
import { DOCUSAURUS_VERSION } from '@docusaurus/utils'
// Setup our Prism themes
import { themes } from 'prism-react-renderer';
const lightCodeTheme = themes.vsLight;
const darkCodeTheme = themes.vsDark;
// Define our admonitions config.
const admonitionsConfig = {
  admonitions: {
    keywords: [
      'discord',
      'info',
      'success',
      'danger',
      'note',
      'tip',
      'warning',
      'important',
      'caution',
      'powershell',
      'security',
      'ninja',
      'release',
      'credit',
      'docusaurus'
    ],
  },
}
// Setup common config options for the docs plugin instances.
const commonDocsPluginConfig = {
  showLastUpdateAuthor: false,
  showLastUpdateTime: true,
  sidebarCollapsible: true,
  sidebarCollapsed: true,
  ...admonitionsConfig,
}

const showcaseSchemaPath = join(dirname(fileURLToPath(import.meta.url)), 'showcase', 'schema.json');
const showcaseSubmissionApiUrl = process.env.SHOWCASE_SUBMISSION_API_URL?.trim() || '';
const showcaseTurnstileSiteKey = process.env.SHOWCASE_TURNSTILE_SITE_KEY?.trim() || '';

type CommunityShowcasePluginOptions = ShowcasePluginOptions & {
  submissionApiUrl?: string;
  turnstileSiteKey?: string;
};
/** @type {import('@docusaurus/types').Config} */
const config: Config = {
  title: 'HaloPSA Community',
  tagline: 'The unofficial HaloPSA, HaloITSM, HaloCRM and Halo Service Desk community...',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://halopsa.community',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',
  onBrokenLinks: 'throw',
  trailingSlash: true,
  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  customFields: {
    showcaseSubmissionApiUrl,
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/HaloCommunity/website/edit/main/',
          ...commonDocsPluginConfig,
        } satisfies DocsOptions,
        blog: false,
        pages: {
        } satisfies PageOptions,
        theme: {
          customCss: './src/scss/custom.scss',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    // Replace with your project's social card
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },

    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'HaloPSA Community',
      logo: {
        alt: 'HaloPSA Community Logo',
        src: 'img/LogoLightMode.svg',
        srcDark: 'img/LogoDarkMode.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'knowledgeSidebar',
          position: 'left',
          label: 'Introduction',
        },
        {
          to: '/showcase',
          label: 'Showcase',
          position: 'left',
        },
        {
          to: 'https://github.com/sponsors/homotechsual/',
          label: 'Sponsor',
          position: 'right',
          target: '_blank',
          className: 'sponsorship-link',
        },
        {
          to: 'https://reddit.halopsa.community',
          label: 'Reddit',
          position: 'right',
          target: '_blank',
          className: 'reddit-link',
        },
        {
          to: 'https://discord.halopsa.community',
          label: 'Discord',
          position: 'right',
          target: '_blank',
          className: 'discord-link',
        },
        {
          to: 'https://github.com/HaloCommunity/website',
          label: 'GitHub',
          position: 'right',
          target: '_blank',
          className: 'github-link',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Knowledge',
          items: [
            {
              label: 'Introduction',
              to: '/docs/',
            },
            {
              label: 'Community Showcase',
              to: '/showcase',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Reddit',
              href: 'https://reddit.halopsa.community',
            },
            {
              label: 'Discord',
              href: 'https://discord.halopsa.community',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/HaloCommunity',
            },
          ],
        },
        {
          title: 'Official Links',
          items: [
            {
              label: 'Website',
              href: 'https://usehalo.com?utm_source=halopsa&utm_medium=referral&utm_campaign=halopsa_community',
            },
            {
              label: 'Trial',
              href: 'https://usehalo.com/trial?utm_source=halopsa&utm_medium=referral&utm_campaign=halopsa_community',
            },
            {
              label: 'Find a Partner',
              href: 'https://usehalo.com/find-a-partner?utm_source=halopsa&utm_medium=referral&utm_campaign=halopsa_community',
            },
            {
              label: 'Academy',
              href: 'https://academy.halopsa.com/?utm_source=halopsa&utm_medium=referral&utm_campaign=halopsa_community',
            },
            {
              label: 'Roadmap',
              href: 'https://usehalo.com/halopsa/roadmap?utm_source=halopsa&utm_medium=referral&utm_campaign=halopsa_community',
            },
            {
              label: 'Feature Requests',
              href: 'https://ideas.halopsa.com/?utm_source=halopsa&utm_medium=referral&utm_campaign=halopsa_community',
            }
          ],
        },
      ],
      copyright: `<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/80x15.png" /></a><br />Licensed by the Docusaurus community under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.<br />Built with <a href="https://docusaurus.io">Docusaurus v${DOCUSAURUS_VERSION}</a>.<br /><span class="designedBy">Designed with <svg xmlns="http://www.w3.org/2000/svg" class="heart" width="24" height="24" viewBox="0 0 24 24"><path d="M14 20.408c-.492.308-.903.546-1.192.709-.153.086-.308.17-.463.252h-.002a.75.75 0 01-.686 0 16.709 16.709 0 01-.465-.252 31.147 31.147 0 01-4.803-3.34C3.8 15.572 1 12.331 1 8.513 1 5.052 3.829 2.5 6.736 2.5 9.03 2.5 10.881 3.726 12 5.605 13.12 3.726 14.97 2.5 17.264 2.5 20.17 2.5 23 5.052 23 8.514c0 3.818-2.801 7.06-5.389 9.262A31.146 31.146 0 0114 20.408z"/></svg> by <a href="https://homotechsual.dev">homotechsual</a></span>.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
      additionalLanguages: ['powershell','bash','docker', 'diff', 'json', 'sass']
    },
  } satisfies Preset.ThemeConfig,
  plugins: [
    'docusaurus-plugin-sass',
    'docusaurus-plugin-generate-llms-txt',
    [
      '@homotechsual/docusaurus-plugin-showcase',
      {
        id: 'community-showcase',
        dataDir: 'showcase',
        screenshotUrl: 'https://screengrabber.tools.homotechsual.dev/{url}/opengraph/_width:640?format=jpeg',
        schemaPath: showcaseSchemaPath,
        schemaUrl: 'https://halopsa.community/showcase/schema.json',
        routeBasePath: 'showcase',
        pageTitle: 'Community Integrations, Scripts and Tools',
        pageDescription: 'Share and discover Halo community-built integrations, scripts, and utilities. If you want to correct or improve an existing entry, head over to GitHub and submit a pull request or issue - click on GitHub on the navbar above!',
        submitLabel: 'Share an item',
        submitFormPath: 'submit',
        submitGithubRepo: 'HaloCommunity/website',
        submissionApiUrl: showcaseSubmissionApiUrl || undefined,
        turnstileSiteKey: showcaseTurnstileSiteKey || undefined,
        favouriteTag: 'featured',
        tags: {
          featured: {
            label: 'Featured',
            description: 'High-impact tools recommended by the community.',
            color: '#e9669e',
            icon: 'heart',
          },
          integration: {
            label: 'Integration',
            description: 'Connect Halo with third-party platforms and services.',
            color: '#39ca30',
            icon: 'plus-square',
          },
          script: {
            label: 'Script',
            description: 'Automation scripts, helpers, and operational tooling.',
            color: '#3b82f6',
          },
          reporting: {
            label: 'Reporting',
            description: 'Analytics, dashboards, and reporting-focused resources.',
            color: '#e6af2e',
          },
          utility: {
            label: 'Utility',
            description: 'General-purpose community tools and quality-of-life helpers.',
            color: '#0ea5a4',
          },
        },
        statuses: {
          active: {
            label: 'Active',
            description: 'Actively maintained and receiving updates.',
            color: '#39ca30',
            icon: 'circle-check',
          },
          beta: {
            label: 'Beta',
            description: 'Early release, testing and feedback welcome.',
            color: '#e6af2e',
            icon: 'circle-minus',
          },
          archived: {
            label: 'Archived',
            description: 'No longer maintained; provided for reference.',
            color: '#ca3c25',
            icon: 'circle-x',
          },
        },
      } satisfies CommunityShowcasePluginOptions,
    ],
    // [
    //  '@docusaurus/plugin-content-docs',
    //  /** @type {DocsOptions} */
    //  {
    //    id: 'api',
    //    path: 'api',
    //    routeBasePath: 'api',
    //    sidebarPath: './sidebars.ts',
    //  }
    //],
  ],
  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        indexDocs: true,
        indexBlog: false,
        indexPages: true,
        docsRouteBasePath: ["docs"],
        hashed: true,
        docsDir: ["docs"],
        highlightSearchTermsOnTargetPage: true,
      }),
    ],
  ],
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon-precomposed',
        sizes: '57x57',
        href: 'img/apple-touch-icon-57x57.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon-precomposed',
        sizes: '60x60',
        href: 'img/apple-touch-icon-60x60.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon-precomposed',
        sizes: '72x72',
        href: 'img/apple-touch-icon-72x72.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon-precomposed',
        sizes: '76x76',
        href: 'img/apple-touch-icon-76x76.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon-precomposed',
        sizes: '114x114',
        href: 'img/apple-touch-icon-114x114.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon-precomposed',
        sizes: '120x120',
        href: 'img/apple-touch-icon-120x120.png',
      },
    },      
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon-precomposed',
        sizes: '144x144',
        href: 'img/apple-touch-icon-144x144.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon-precomposed',
        sizes: '152x152',
        href: 'img/apple-touch-icon-152x152.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: 'img/favicon-16x16.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: 'img/favicon-32x32.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '96x96',
        href: 'img/favicon-96x96.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '128x128',
        href: 'img/android-chrome-128x128.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '196x196',
        href: 'img/android-chrome-196x196.png',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'msapplication-TileColor',
        content: '#000000'
      }
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'msapplication-TileImage',
        content: '/img/mstile-144x144.png'
      }
    },
  ],
  scripts: [
    {
      src: 'https://plausible.io/js/script.file-downloads.outbound-links.js',
      defer: true,
      'data-domain': 'halopsa.community',
    },
  ],
  markdown: {
    hooks: {
      onBrokenMarkdownImages: 'warn',
      onBrokenMarkdownLinks: 'throw',
    }
  },
  future: {
    faster: true,
    v4: {
      removeLegacyPostBuildHeadAttribute: true,
    }
  },
}

export default config;
