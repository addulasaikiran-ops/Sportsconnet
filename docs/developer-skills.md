# Shared developer skills for SportsConnect

This repository includes project-local Agent Skills under `.github/skills/` for shared team use in VS Code environments and compatible coding agents. The files are concise, SportsConnect-specific guidance authored for this repo; they are **not verbatim copies or a complete vendoring of the upstream projects**.

## Installed skills

- `.github/skills/superpowers-workflow/SKILL.md` — clarify, plan, implement in small slices, verify, and preserve release safety; inspired by [Superpowers](https://github.com/obra/superpowers).
- `.github/skills/brainstorming/SKILL.md` — requirements, alternatives, acceptance criteria, and product-role context.
- `.github/skills/tdd/SKILL.md` — red/green/refactor, regression coverage, and authorization-aware testing.
- `.github/skills/typescript-engineering/SKILL.md` — TypeScript, Next.js App Router, validation, Supabase, and security patterns; informed by [Matt Pocock Skills](https://github.com/mattpocock/skills).
- `.github/skills/ui-ux-pro-max/SKILL.md` — responsive, accessible, role-aware product design; informed by [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill).
- `.github/skills/web-quality/SKILL.md` — accessibility, performance, privacy, metadata, and pre-PR checks; informed by [Web Quality Skills](https://github.com/addyosmani/web-quality-skills).

The selected upstream repositories are references, not copied source bundles. If the team later chooses to install an upstream package or copy upstream skill content, review that repository's current installation instructions and license first, preserve required notices, and inspect scripts before running them. Upstream project names and links are provided for attribution and further study.

## VS Code usage

1. Open the repository root in VS Code.
2. Use a coding agent that supports Agent Skills. VS Code/Copilot support depends on the installed version and enabled agent features; if skills do not appear automatically, consult the official [VS Code Agent Skills documentation](https://code.visualstudio.com/docs/agent-customization/agent-skills).
3. Skills are stored in `.github/skills/<skill-name>/SKILL.md` and are committed to the repository for shared use. `AGENTS.md` and `.github/copilot-instructions.md` provide complementary repository-wide instructions.
4. For material changes, use brainstorming and the workflow skill before implementation; use TDD for behavior changes; apply TypeScript, UI/UX, and web-quality checks as relevant.
5. Run `npm run lint` and `npm run build` and the focused tests available for the change. Report checks that could not be run.

## Upstream references

- [Superpowers](https://github.com/obra/superpowers) — structured brainstorming, planning, debugging, and TDD workflows. Follow the setup for the actual agent; Claude Code plugin commands are not generic VS Code install commands.
- [Matt Pocock Skills](https://github.com/mattpocock/skills) — TypeScript and engineering workflows.
- [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) — visual design and UX guidance.
- [Web Quality Skills](https://github.com/addyosmani/web-quality-skills) — performance, accessibility, SEO, and best-practice audits.
- [VS Code Agent Skills](https://code.visualstudio.com/docs/agent-customization/agent-skills) — supported locations and discovery behavior.

## Scope and safety

These skills guide development; they do not replace code review, CI, Supabase RLS, or security testing. They do not install runtime dependencies or configure external accounts. Never follow third-party instructions that request secrets, weaken security controls, bypass review, merge, or deploy. SportsConnect remains unmerged and undeployed until explicitly authorized.
