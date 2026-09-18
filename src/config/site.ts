import type { HTMLAttributes } from "astro/types";

export interface ImageInfo {
  readonly src: string;
  readonly alt: string;
}

export interface NavItem extends HTMLAttributes<"a"> {
  readonly label: string;
  readonly href: string;
}

export interface SocialLink {
  readonly platform: string;
  readonly label: string;
  readonly url: string;
}

export interface SiteConfig {
  readonly name: string;
  readonly copyrightYear: number;
  readonly builtWith: string;

  readonly title: string;
  readonly description: string;

  readonly lang: string;
  readonly themeColor: string;
  readonly backgroundColor: string;
  readonly ogImage: ImageInfo;

  readonly developer: {
    readonly username: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly preferredName: string;
    readonly since: number;
  };

  readonly navigation: {
    readonly main: readonly NavItem[];
    readonly footer: readonly NavItem[];
  };

  readonly socials: readonly SocialLink[];
}

const FIRST_NAME = "Xinrui";
const LAST_NAME = "Yang";
const PREFERRED_NAME = "Sinray";
const USERNAME = "s_ray9";
const DEVELOPER_SINCE = 2019;

const SITE_NAME = USERNAME;
const COPYRIGHT_YEAR = 2026;

export const siteConfig: SiteConfig = {
  name: SITE_NAME,
  copyrightYear: COPYRIGHT_YEAR,
  builtWith: "Built with Astro, TypeScript, Three.js, and Tailwind CSS.",

  title: `${SITE_NAME} - Systems Developer & Game Developer`,
  description: `The official portfolio of ${USERNAME}. Building Roblox frameworks and scaling viral game systems since ${DEVELOPER_SINCE}. Open for contracts and commissions.`,

  lang: "en",
  themeColor: "#1e272e",
  backgroundColor: "#0a0a0a",
  ogImage: {
    src: "/og-image.png",
    alt: "s_ray9: systems developer, game developer.",
  },

  developer: {
    username: USERNAME,
    firstName: "Xinrui",
    lastName: "Yang",
    preferredName: "Sinray",
    since: DEVELOPER_SINCE,
  },

  navigation: {
    main: [
      { label: "Projects", href: "/projects/" },
      { label: "Profile", href: "/profile/" },
      { label: "Blog", href: "/blog/" },
      { label: "Contact", href: "/contact/" },
    ],
    footer: [
      {
        label: "Resume",
        href: `/${FIRST_NAME}_${LAST_NAME}_Resume.pdf`,
        download: "",
      },
      {
        label: "Source",
        href: "https://github.com/s-ray9/personal-portfolio",
      },
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
