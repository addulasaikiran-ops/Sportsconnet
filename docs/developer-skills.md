# Shared developer skills for SportsConnect

This guide records the upstream skills selected for this repository and the intended VS Code workflow. The repository-level `AGENTS.md` and `.github/copilot-instructions.md` are included now; the upstream skill packages themselves are **not vendored by this change**. Install them locally with the commands below after reviewing their source and license. Keep shared skill files in the repository only when the team wants to pin and maintain copies.

## Selected upstream projects

- [Superpowers](https://github.com/obra/superpowers) — structured brainstorming, planning, debugging, and test-driven development workflows. Its setup varies by agent; do not assume the Claude Code plugin command installs into VS Code Copilot.
- [Matt Pocock Skills](https://github.com/mattpocock/skills) — TypeScript and engineering workflow skills. Upstream documents `npx skills@latest add mattpocock/skills` for supported agents.
- [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) — UI patterns, visual design, and UX guidance. Upstream lists Copilot as a supported platform and documents its CLI setup.
- [Web Quality Skills](https://github.com/addyosmani/web-quality-skills) — measurement-led performance, Core Web Vitals, accessibility, SEO, and best-practice audits.
- TDD and brainstorming — use Superpowers' corresponding workflows where the installed coding agent supports them; otherwise follow the test-first workflow in `AGENTS.md`.

## VS Code setup

1. Open the SportsConnect repository folder in VS Code.
2. Confirm which agent integration is active (GitHub Copilot Chat, an extension that supports Agent Skills, or another coding agent). VS Code itself is an editor; skill discovery depends on the installed agent and its supported file conventions.
3. For Matt Pocock's skills, review the upstream README and run the upstream installer in the repository terminal only after confirming the desired agent and install scope:
   ```bash
   npx skills@latest add mattpocock/skills
   ```
4. For UI/UX Pro Max, review its README and supported platform setup. Its documented CLI form is:
   ```bash
   npx ui-ux-pro-max-cli init --ai copilot
   ```
   Confirm the current CLI options against upstream documentation before running it.
5. For Web Quality Skills, use the upstream repository's installation instructions for the chosen agent. If no skill-compatible integration is enabled, use the guides as reference material; do not assume VS Code automatically discovers arbitrary skill files.
6. For Superpowers, follow the current upstream installation instructions for the actual agent being used. The official README's Claude Code plugin commands are not generic VS Code installation commands.
7. Inspect generated files before committing them. Keep skill content and licenses intact, avoid generated binaries or unrelated editor settings, and do not commit tokens or personal configuration.
8. Run `npm run lint` and `npm run build` after project files change.

## Recommended usage

- Brainstorming: define the user problem, constraints, acceptance criteria, and alternatives before implementation.
- TDD: create a focused failing test, make the smallest change, and verify the test passes.
- UI/UX: review SportsConnect's athlete, coach, club, and association flows; include responsive, keyboard, and accessibility checks.
- Web quality: measure before optimizing; distinguish lab measurements from real-user field data.
- TypeScript: prefer explicit domain types, safe parsing, narrow interfaces, and existing validation helpers.

## Scope and safety

These tools guide development; they do not replace code review, CI, Supabase RLS, or security testing. Third-party skills can contain executable scripts or instructions. Review upstream changes before updating. This document does not install npm runtime dependencies, configure external accounts, merge changes, or deploy SportsConnect.
