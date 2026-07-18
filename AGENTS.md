# CookieGuard Repository Guide

## Project

CookieGuard is a dependency-free static browser game built with semantic HTML, CSS, inline SVG, and vanilla JavaScript. The files in the repository root are the deployable GitHub Pages artifact; there is no generated build directory.

## Commands

- Run locally: `pnpm start`
- Verify before committing or releasing: `pnpm check`

## Working rules

- Preserve pointer, touch, drag, and keyboard parity for cookie interactions.
- Preserve the attempt 10 half-cookie milestone and attempt 15 complete-cookie release.
- Keep all assets relative so the site works under the `/CookieGuard/` GitHub Pages subpath.
- Maintain semantic controls, live announcements, visible focus states, responsive behavior, and reduced-motion support.
- Do not add runtime dependencies or a build tool unless the project genuinely requires one.
- Do not introduce analytics, remote fonts, third-party scripts, or network requests without explicit approval and corresponding privacy documentation.
- Do not add or modify GitHub Actions workflows without Sudarshan's explicit approval.
- Do not commit environment files, local configuration, credentials, signing material, generated output, or editor state.

## Release gate

Run `pnpm check`, inspect the intentional diff, confirm no sensitive files are tracked, and perform a manual browser review before changing repository visibility or enabling GitHub Pages.
