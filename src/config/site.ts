export interface ImageInfo {
  readonly src: string;
  readonly alt: string;
}

export interface NavItem {
  readonly title: string;
  readonly href: string;
}

export interface SocialLink {
  readonly platform: string;
  readonly label: string;
  readonly url: string;
}

export interface SiteConfig {
  readonly name: string;
  readonly startYear: number;

  readonly title: string;
  readonly description: string;

  readonly lang: string;
  readonly themeColor: string;
  readonly backgroundColor: string;
  readonly ogImage: ImageInfo;

  readonly developer: {
    readonly name: string;
    readonly startYear: number;
  };

  readonly navigation: {
    readonly main: readonly NavItem[];
    readonly footer: readonly NavItem[];
  };

  readonly socials: readonly SocialLink[];
}

const DEVELOPER_NAME = "s_ray9";
const DEVELOPER_START_YEAR = 2018;

const SITE_NAME = DEVELOPER_NAME;
const SITE_START_YEAR = 2026;

export const siteConfig: SiteConfig = {
  name: SITE_NAME,
  startYear: SITE_START_YEAR,

  title: `${SITE_NAME} - Systems Developer & Game Developer`,
  description: `The official portfolio of ${DEVELOPER_NAME}. Building Roblox frameworks and scaling viral game systems since ${DEVELOPER_START_YEAR}. Open for contracts and commissions.`,

  lang: "en",
  themeColor: "#1e272e",
  backgroundColor: "#0a0a0a",
  ogImage: {
    src: "/og-image.png",
    alt: "s_ray9: systems developer, game developer.",
  },

  developer: {
    name: DEVELOPER_NAME,
    startYear: DEVELOPER_START_YEAR,
  },

  navigation: {
    main: [
      { title: "Projects", href: "/projects/" },
      { title: "Pricing", href: "/pricing/" },
      { title: "About", href: "/about/" },
      { title: "Blog", href: "/blog/" },
    ],
    footer: [
      { title: "Uses", href: "/uses/" },
      { title: "Privacy", href: "/privacy/" },
      { title: "Terms", href: "/terms/" },
    ],
  },

  socials: [
    { platform: "github", label: "GitHub", url: "https://github.com/s-ray9" },
    {
      platform: "youtube",
      label: "YouTube",
      url: "https://www.youtube.com/@s_ray9",
    },
    {
      platform: "linkedin",
      label: "LinkedIn",
      url: "https://www.linkedin.com/in/xinrui-yang-b65339411",
    },
  ],
} as const;
