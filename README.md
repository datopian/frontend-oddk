# Open Data DK theme

*Note*: ODDK now has a custom search facet, `update_frequency`. To display this properly in the UI, a small change was needed in frontend-v2. Instead of hardcoding the custom facet in the master branch, the change is in its own branch, [oddk/custom-facet](https://github.com/datopian/frontend-v2/tree/oddk/custom-facet). When there's a better way to handle or override this somewhere else (e.g. in this theme or in [ckanext-portalopendatadk](https://github.com/datopian/ckanext-portalopendatadk)), we can switch back to using the master branch of frontend-v2. Until then, you should use the `oddk/custom-facet` branch of frontend-v2 for development and deployments.

To watch files:

```bash
npx gulp
```

This watches for changes to CSS and icons. On changes to CSS [PostCSS](https://postcss.org/) and plugins ([postcss-import](https://github.com/postcss/postcss-import), [postcss-preset-env](https://preset-env.cssdb.org/), [tailwindcss](https://tailwindcss.com), [cssnano](https://cssnano.co/)) are run. On icon changes, the SVG icon sprite is remade. These processes can be run without watching via `npx gulp css` and `npx gulp icons`.

Note: Unless you are making significant changes to the design, you probably won't need these processes. Most styling is done through [Tailwind's](https://tailwindcss.com) utility classes.

## Tailwind CSS

The CSS framework [Tailwind](https://tailwindcss.com) is used to style this theme. This means that if you want to change the appearance of something, or add new elements, Tailwind utility classes should provide you with what you need. The docs at [tailwindcss.com](https://tailwindcss.com) should provide you with most of what you need to know.

### Exceptions

Some styles have been extracted out into CSS files (`src/css/components`). The spirit of Tailwind would be to avoid doing this, but there are two scenarios where it becomes desirable, or necessary.

1. You are repeating a combination of utility classes.
2. You need aspects of CSS that is not catered for by Tailwind.

Scenario 1 should probably be resolved with the use of (Nunjucks) templates where reasonable to do so. This codebase could probably be improved a little in that regard.

In either scenario, the [`@apply` feature](https://tailwindcss.com/docs/functions-and-directives/#apply) is and should be used, whenever dealing with the variable-like utility classes, such as width, padding, colour etc. This ensures that the same variables are being used throughout, and that a change to the Tailwind configuration will effect these custom components.

In addition to the components directory, there is an `elements.css` file, which adds some styles to base HTML tags, mostly when nested in specific containers. For example, headings and paragraphs within a `content` wrapper get styling, without the need to add classes to each element.

(This convention of *components* and *elements* is not Tailwind related, but part of a general [approach to making stuff easy to find](https://c3css.com/).)

### Structure

All Tailwind classes and custom components are imported into `src/app.css`. The importing, and other operations (such as Tailwind) are handled by [PostCSS](https://postcss.org/) plugins, as defined in `gulpfile.js`.

Tailwind is configured in `tailwind.config.js`. The configuration for this theme adds an additional spacing variable named `gutter`, to remove some of the guess work from spacing e.g "Was I using `p-4` or `p-6` to separate columns?". The default colour and font family have been replaced. Note, unlike the *addition* of the gutter value, colour and font family were *replaced*, so the values found in the Tailwind docs will not be applicable.

## Icons

Icons are used like so: `<svg><use xlink:href="#<filename>" /></svg>`. Eg. to use the `src/icons/search.svg` icon, you put the following in the template: `<svg><use xlink:href="#search" /></svg>`.
