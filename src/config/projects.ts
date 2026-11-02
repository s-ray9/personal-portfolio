export interface Project {
  readonly name: string;
  readonly description: string;
  readonly details: string;
  readonly href?: string;
  readonly featured?: boolean;
  readonly current?: boolean;
}

export const projects: readonly Project[] = [
  {
    name: "Rainfall",
    description:
      "A lightweight Roblox framework in Luau with state management, structured logging, a ballistics engine, and libraries for animation and cleanup.",
    details: "Luau, Rojo",
    href: "https://github.com/s-ray9/rainfall",
    featured: true,
  },
  {
    name: "Sleep Cognition ML",
    description:
      "Independent research project testing how reliable feature-importance rankings are in machine learning models that predict cognitive impairment from sleep recordings.",
    details: "Python, scikit-learn",
    href: "https://github.com/s-ray9/sleep-cognition-ml",
    featured: true,
  },
  {
    name: "Gun Simulator FPS",
    description:
      "A fast, simple shooter with unique gun stats, a leaderboard, saved player data, sniper scopes, and movement like sprinting, leaning and sliding. Showcased on my YouTube channel.",
    details: "Roblox, Luau",
    href: "https://www.roblox.com/games/12519247792",
    featured: true,
  },
  {
    name: "Zom-Tonk",
    description:
      "A zombie survival game about manning an understaffed tank, inspired by Project Zomboid.",
    details: "Roblox, Luau",
    current: true,
  },
  {
    name: "Brink",
    description:
      "A zombie survival game about factions, with raiding, trading and conflict.",
    details: "Roblox, Luau",
    href: "https://www.roblox.com/games/10810472579",
  },
  {
    name: "FavourLink",
    description:
      "A Roblox Studio prototype that calls the Gemini API over HTTP using few-shot prompting. It placed second out of 11 teams at Spark4STEM SparkHacks.",
    details: "Roblox, Luau, Gemini API",
  },
  {
    name: "Flow",
    description: "A prototype physics simulator built for a school project.",
    details: "Java",
    href: "https://github.com/s-ray9/flow",
  },
  {
    name: "Personal Portfolio",
    description:
      "Personal portfolio featuring work experience, personal projects, and technical blogs.",
    details: "Astro, TypeScript, Tailwind CSS, WebGL",
    href: "https://github.com/s-ray9/personal-portfolio",
  },
];

export const featuredProjects = projects.filter(({ featured }) => featured);

export const currentProject = projects.find(({ current }) => current);
