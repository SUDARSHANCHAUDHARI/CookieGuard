# CookieGuard

CookieGuard is a dependency-free browser game about a cartoon cookie jar that refuses to surrender its final cookie. Try to click, tap, drag, or use the keyboard to claim it while the jar cycles through ten randomized defenses.

## Game rules

- Every completed grab counts as one attempt.
- The ten defenses are shuffled so each appears before the set repeats.
- Attempt 10 awards half a cookie.
- Attempt 15 releases the complete cookie and starts a celebration.
- Reset starts a fresh game. The sound control uses generated Web Audio tones; no audio files or tracking are included.

## Run locally

No install or build step is required. Open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## Verify

Node.js 18 or newer is recommended.

```bash
pnpm check
```

The verification script checks JavaScript syntax, local asset links, accessibility hooks, security policy, game defenses, milestones, repository hygiene, and GitHub Pages essentials.

## Production status

- Runtime dependencies: none
- Build step: none; the checked-in source is the deployable artifact
- Main quality gate: `pnpm check`
- Content policy: remote scripts, connections, frames, forms, and plugins are blocked
- Data handling: no analytics, cookies, accounts, or network requests; only the sound preference is stored locally
- CI: intentionally not configured; branch-based GitHub Pages does not require a workflow

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the default branch and the `/ (root)` folder, then save.

The project uses relative paths and includes `.nojekyll`, so it works from both a user site and a repository subpath. No GitHub Actions workflow is needed.

Keep the GitHub repository private until the release decision is made. Before changing visibility or enabling Pages, run `pnpm check`, review [CHANGELOG.md](CHANGELOG.md), and confirm the final site visually in a browser. GitHub Pages availability for private repositories depends on the GitHub account and plan.

## Accessibility

CookieGuard supports pointer, touch, drag, and keyboard input. It includes visible focus styles, live status announcements, a native progress meter, a sound toggle, and reduced-motion behavior that follows the operating-system preference.

## License

[MIT](LICENSE)

Security reports are handled according to [SECURITY.md](SECURITY.md).
