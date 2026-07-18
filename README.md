# CookieGuard

[![Version](https://img.shields.io/badge/version-1.0.0-274C77)](CHANGELOG.md)
[![HTML5](https://img.shields.io/badge/HTML5-semantic-E34F26?logo=html5&logoColor=white)](index.html)
[![Vanilla JavaScript](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?logo=javascript&logoColor=111)](script.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-477A50.svg)](LICENSE)

CookieGuard is a playful, dependency-free browser game about a cartoon cookie jar determined to protect its final cookie. Players can click, tap, drag, or use the keyboard to grab the cookie while the jar responds with ten randomized defenses.

The complete deployable site is built from semantic HTML, CSS, inline SVG, and vanilla JavaScript. It has no runtime dependencies, backend, analytics, external assets, or build step.

## Table of contents

- [Features](#features)
- [How to play](#how-to-play)
- [Jar defenses](#jar-defenses)
- [Technology](#technology)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Verification](#verification)
- [Accessibility](#accessibility)
- [Privacy and security](#privacy-and-security)
- [GitHub Pages deployment](#github-pages-deployment)
- [Release checklist](#release-checklist)
- [Contributing](#contributing)
- [Author](#author)
- [License](#license)

## Features

- Click, tap, drag, and keyboard cookie interactions powered by Pointer Events.
- Elastic drag boundaries and smooth collision handling keep the cookie inside the kitchen scene.
- Ten defenses are shuffled without replacement, so every defense appears before the set repeats.
- Attempt counter and accessible progress indicator track the path to victory.
- Half-cookie reward after 10 completed attempts.
- Complete-cookie release and confetti celebration after 15 completed attempts.
- Generated Web Audio effects with a persistent sound preference and no audio files.
- Sound and reset controls implemented with native buttons.
- Responsive illustrated kitchen, table, jar, lid, cookie, and decorations made with CSS and inline SVG.
- Reduced-motion support, visible keyboard focus, semantic landmarks, and live status announcements.
- Content Security Policy that blocks remote scripts, network connections, forms, frames, and plugins.
- Relative asset paths and `.nojekyll` support for GitHub Pages repository subpaths.

## How to play

1. Try to take the visible cookie from the jar.
2. Use a mouse, trackpad, touch screen, stylus, or keyboard:
   - **Click or tap:** activate the cookie once.
   - **Drag:** move the cookie and release it to complete an attempt.
   - **Keyboard:** focus the cookie and press <kbd>Enter</kbd> or <kbd>Space</kbd>.
3. Watch the jar deploy a randomized defense after each valid attempt.
4. Reach attempt 10 to receive half a cookie.
5. Reach attempt 15 to free the complete cookie and win.

The game ignores repeated input while a defense is running, ensuring one completed interaction counts as one attempt. Use **Reset** at any time to start a new game.

## Jar defenses

| Defense | What the jar does |
| --- | --- |
| Lid lockdown | Closes the lid over the cookie. |
| Cookie recall | Pulls the cookie back into position. |
| Table shuffle | Moves the jar across the table. |
| Tiny arms | Grows small cartoon arms and waves the grab away. |
| Broccoli swap | Replaces the cookie with broccoli. |
| Under-jar hideout | Hides the cookie beneath the jar. |
| Official warning | Displays a stern pantry-security warning. |
| Empty-jar bluff | Pretends the jar is completely empty. |
| Decoy batch | Creates fake cookie copies around the real one. |
| Pointer patrol | Sends a cartoon hand toward the attempted grab point. |

The defenses use a shuffled-bag strategy: all ten appear in a random order before the bag is reshuffled. Milestones at attempts 10 and 15 remain deterministic.

## Technology

| Area | Implementation |
| --- | --- |
| Structure | Semantic HTML5 |
| Visual design | Responsive CSS with custom properties and keyframe animation |
| Illustration | Inline SVG and CSS-drawn elements |
| Interaction | Vanilla JavaScript and Pointer Events |
| Sound | Generated Web Audio API oscillators |
| State | A single in-browser `CookieGuardGame` controller |
| Persistence | `localStorage` for the sound preference only |
| Verification | Dependency-free Node.js verification script |
| Hosting target | GitHub Pages from the repository root |

## Project structure

```text
CookieGuard/
├── index.html          # Semantic interface and inline SVG artwork
├── styles.css          # Responsive design, defenses, and motion preferences
├── script.js           # Game state, pointer handling, audio, and milestones
├── favicon.svg         # Cookie jar browser icon
├── scripts/
│   └── verify.mjs      # Production and repository quality gate
├── package.json        # Project metadata and verification commands
├── AGENTS.md           # Repository-specific development guidance
├── CHANGELOG.md        # User-facing release history
├── SECURITY.md         # Vulnerability reporting and security posture
├── LICENSE             # MIT license
└── .nojekyll           # Direct static serving on GitHub Pages
```

## Getting started

### Prerequisites

- A modern browser with Pointer Events and Web Audio support.
- [Node.js 18 or newer](https://nodejs.org/) and [pnpm](https://pnpm.io/) for verification.
- Python 3 only if using the included local-server command.

There are no packages to install.

### Clone the repository

The repository remains private until launch, so cloning requires authorized GitHub access.

```bash
git clone https://github.com/SUDARSHANCHAUDHARI/CookieGuard.git
cd CookieGuard
```

### Run locally

```bash
pnpm start
```

Open [http://localhost:4173](http://localhost:4173). You can also open `index.html` directly without a local server.

## Verification

Run the complete production gate:

```bash
pnpm check
```

The command validates JavaScript syntax and runs 78 project checks covering:

- Required production and repository files.
- Local asset resolution and unique HTML IDs.
- Semantic landmarks and accessibility hooks.
- Pointer, keyboard, progress, sound, and milestone behavior.
- All ten defense definitions and interface labels.
- Content Security Policy and referrer protection.
- Absence of unsafe HTML/code sinks and runtime network calls.
- Dependency-free package metadata and supported Node.js version.
- Required secret, build, cache, signing, and editor ignore patterns.
- Private-until-release documentation and GitHub Pages readiness.
- Balanced CSS block structure and third-party runtime references.

`pnpm test` runs the project verifier without the separate `node --check` command.

## Accessibility

CookieGuard includes:

- Native button controls for the cookie, sound, and reset actions.
- Pointer, touch, drag, Enter, and Space input parity.
- An assertive live region for defense and milestone announcements.
- An accessible progress bar with numeric and descriptive values.
- Visible focus indicators and a skip link.
- Instructions connected to the cookie with `aria-describedby`.
- Minimum touch-friendly control sizing.
- Responsive layouts from mobile screens through large desktops.
- `prefers-reduced-motion` behavior that shortens motion while retaining state feedback.

## Privacy and security

CookieGuard does not use accounts, cookies, analytics, advertising, remote fonts, third-party scripts, or network requests. The only locally stored value is whether generated sound is enabled.

The page declares a Content Security Policy restricting scripts and assets to the project itself while blocking connections, forms, frames, objects, media downloads, and workers. JavaScript creates interface elements with safe DOM APIs and does not use `innerHTML`, `eval`, or dynamic code generation.

Please report suspected vulnerabilities privately according to [SECURITY.md](SECURITY.md).

## GitHub Pages deployment

The checked-in repository root is the production artifact; no build output needs to be generated or committed.

1. Run `pnpm check`.
2. Review [CHANGELOG.md](CHANGELOG.md) and the intentional Git diff.
3. Confirm the final interface manually in a browser.
4. In GitHub, open **Settings → Pages**.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Choose `main` and `/ (root)`, then save.

All asset references are relative, so the site works under the `/CookieGuard/` repository path. `.nojekyll` prevents Jekyll processing. GitHub Actions are intentionally not required for deployment.

Keep the GitHub repository private until the public release is explicitly approved. GitHub Pages support for private repositories depends on the account and plan.

## Release checklist

- [ ] `pnpm check` passes.
- [ ] The worktree contains only intentional changes.
- [ ] No environment files, credentials, local configuration, or generated output are tracked.
- [ ] Accessibility and responsive behavior receive a manual browser review.
- [ ] `CHANGELOG.md` reflects the release.
- [ ] Local and remote `main` commits match.
- [ ] Repository visibility and Pages activation are explicitly approved.

## Contributing

CookieGuard currently has no runtime dependency or build-tool layer. Keep changes focused and preserve that simplicity unless a concrete requirement justifies additional tooling.

1. Create a feature branch from `main`.
2. Make the smallest complete change.
3. Preserve pointer, touch, drag, and keyboard parity.
4. Run `pnpm check`.
5. Document user-facing changes in `CHANGELOG.md`.
6. Open a focused pull request.

Repository-specific development rules are documented in [AGENTS.md](AGENTS.md).

## Author

**Sudarshan Chaudhari**<br>
Independent developer and founder of **SudarshanTechLabs**<br>
Bangkok, Thailand

- GitHub: [@SUDARSHANCHAUDHARI](https://github.com/SUDARSHANCHAUDHARI)
- Development contact: [sunny.sudarshan@gmail.com](mailto:sunny.sudarshan@gmail.com)
- Business and security contact: [sudarshantechlabs@gmail.com](mailto:sudarshantechlabs@gmail.com)

CookieGuard was designed and developed by Sudarshan Chaudhari under SudarshanTechLabs.

## License

CookieGuard is available under the [MIT License](LICENSE). Copyright © 2026 SudarshanTechLabs.
