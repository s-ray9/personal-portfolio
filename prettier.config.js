/** @type {import("prettier").Config} */
export default {
  // NOTE: prettier-plugin-astro is pinned to 0.14.1 in package.json.
  // v1.x breaks prettier-plugin-tailwindcss class sorting in .astro files.
  // See https://github.com/withastro/prettier-plugin-astro/issues/483
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/styles/global.css",
  tailwindAttributes: ["class:list"],
  tailwindFunctions: ["clsx", "cn"],
};
