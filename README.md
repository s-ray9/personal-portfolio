![s_ray9: systems developer, game developer.][banner]

# s_ray9

[![Website][website-badge]][website]
[![License][license-badge]][license]

Personal portfolio featuring work experience, personal projects, and technical blogs.

## Tech stack

![TypeScript][typescript-badge]
![Astro][astro-badge]
![Three.js][threejs-badge]
![Tailwind CSS][tailwind-css-badge]
![pnpm][pnpm-badge]

## Features

- Home, projects, profile, blog, contact, and 404 pages
- PDF resume
- Interactive WebGL background
- Reduced-motion support
- Self-hosted fonts
- Page titles and descriptions for browser tabs and search results
- `robots.txt` for search engine crawlers
- Open Graph and Twitter card metadata for link previews
- Theme-adaptive favicon

## Getting started

### Prerequisites

- Git
- Node.js (v26.x)
- pnpm (v12.16.1+)

> [!TIP]
> This repository pins its Node.js version in a `.node-version` file. A version manager such as [fnm](https://github.com/Schniz/fnm) can read that file and switch to the right version for you, which is the easiest way to match the Node.js prerequisite above. With fnm, run `fnm use` in the project folder, or add `--use-on-cd` to your `fnm env` shell setup to switch automatically.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/s-ray9/personal-portfolio.git
   cd personal-portfolio
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

### Development

Start the local development server:

```bash
pnpm dev
```

Format the code:

```bash
pnpm format
```

### Build

Build the project:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

## License

Distributed under the MIT License. See [LICENSE] for more information.

[banner]: public/og-image.png
[license]: LICENSE
[website]: https://s-ray9.vercel.app
[website-badge]: https://deploy-badge.vercel.app/?url=https://s-ray9.vercel.app&name=Website&logo=vercel
[license-badge]: https://img.shields.io/github/license/s-ray9/personal-portfolio?color=blue&label=License&logo=opensourceinitiative&logoColor=white
[typescript-badge]: https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white
[astro-badge]: https://img.shields.io/badge/Astro-ff5d01?logo=astro&logoColor=white
[threejs-badge]: https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white
[tailwind-css-badge]: https://img.shields.io/badge/Tailwind_CSS-38bdf8?logo=tailwind-css&logoColor=white
[pnpm-badge]: https://img.shields.io/badge/pnpm-f9ad00?logo=pnpm&logoColor=white
