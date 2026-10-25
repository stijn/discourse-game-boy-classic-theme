# Game Boy Classic

A four-shade, 8-bit theme for [Discourse](https://www.discourse.org), inspired by the original 1989 handheld. It ships with the pixel font, square corners, chunky borders, "pressable" buttons and a Konami-code easter egg.

Built for [Eurth](https://eurth.org).

## What it does

- **DMG-01 colour palette.** Four greens, installed with the theme. Every shade in the stylesheet reads from the active palette, so you can recolour the whole theme from **Admin → Appearance → Colors** without touching code.
- **Press Start 2P pixel font.** Bundled with the theme, so visitors' browsers never contact Google Fonts.
- **Square everything.** No rounded corners, hard 4px borders, drop-shadow buttons that press down on hover.
- **Restyled posts.** Inverted code blocks and mentions, boxed tags, dashed dividers, and a distinct style for each heading level.
- **Optional effects** (all on by default, see [Settings](#settings)): green-tinted images, logo boot animation, blinking cursor, and confetti.

Animations only run for visitors who haven't turned on "reduce motion" in their operating system.

## Install

**Admin → Appearance → Themes → Install → From a git repository**, then paste:

```
https://github.com/stijn/discourse-game-boy-classic-theme
```

While the repository is private, tick **Private repository**. Discourse will show a public key. Add it on GitHub under the repository's **Settings → Deploy keys** (read-only), then finish the install in Discourse.

After installing, open the theme and:

1. Set **Color palette** to **DMG-01**.
2. Add any components you want under **Included components**.
3. Tick **Selectable by users** if members should be able to pick it in their preferences.

Updates: open the theme and click **Check for updates**, or enable automatic updates.

## Settings

| Setting | Default | What it does |
| --- | --- | --- |
| `uppercase_text` | on | Headings, topic titles, buttons and tags in capitals |
| `camera_filter` | on | Tints avatars, logos and post images green |
| `boot_animation` | on | Drops the site logo in on page load |
| `blinking_cursor` | on | Blinking block cursor on the New Topic and Reply buttons |
| `konami_confetti` | on | Typing ↑ ↑ ↓ ↓ ← → ← → B A outside a text field fires square confetti in the palette colours. The confetti script loads only at that moment. |

## Repository layout

Follows the official [Discourse theme skeleton](https://github.com/discourse/discourse-theme-skeleton):

```
about.json                  Theme metadata, bundled assets, DMG-01 palette
settings.yml                Theme settings
locales/en.yml              Theme description and setting labels
common/common.scss          All styles (desktop and mobile)
javascripts/discourse/
  api-initializers/
    konami-confetti.js      Easter egg
assets/                     Bundled font and confetti script
screenshots/                Theme previews (1600×900) and the script that draws them
licenses/                   Third-party licences
spec/system/                Discourse core-feature smoke tests (run in CI)
```

## Development

Requires Node 22+ and pnpm.

```sh
pnpm install
pnpm lint        # ESLint, Stylelint, Prettier
pnpm lint:fix
```

For live editing against a site, use the [`discourse_theme`](https://meta.discourse.org/t/82950) CLI:

```sh
gem install discourse_theme
discourse_theme watch .
```

GitHub Actions runs the linters and Discourse's core-feature system specs on every push to `main` and on pull requests.

## Credits

- [Press Start 2P](https://github.com/google/fonts/tree/main/ofl/pressstart2p) by CodeMan38. SIL Open Font License 1.1.
- [canvas-confetti](https://github.com/catdad/canvas-confetti) 1.9.3 by Kiril Vatev. ISC License.

Not affiliated with or endorsed by Nintendo. Game Boy is a trademark of Nintendo.

## License

[MIT](LICENSE) © 2026 Stijn Vogels. Bundled third-party files keep their own licences; see [`licenses/`](licenses/).
