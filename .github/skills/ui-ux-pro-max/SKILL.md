---
name: ui-ux-pro-max
description: Use when designing or improving SportsConnect pages, forms, dashboards, feeds, profiles, discovery, messaging, and responsive layouts.
---

# UI/UX quality for SportsConnect

Use these guidelines as a practical design checklist. For the full upstream UI/UX Pro Max system, see the source link in docs/developer-skills.md.

## Design with intent
- Start from the user task and role, not decoration. Athletes need profiles and discovery; coaches need scouting and opportunities; clubs and associations need trustworthy organization workflows.
- Establish a clear hierarchy: one primary action per view, descriptive page titles, concise supporting text, and consistent spacing.
- Reuse the existing design system and components. Avoid introducing arbitrary colors, font sizes, shadows, radii, or a second component library without a clear benefit.
- Use realistic content and useful empty states; avoid placeholder dashboards that imply nonexistent data or functionality.
- Provide clear feedback for save, upload, follow, message, and application actions. Confirm destructive actions and prevent duplicate submissions.

## Responsive and accessible by default
- Design mobile-first and check narrow screens, tablet, and desktop.
- Use semantic landmarks, properly associated labels, keyboard-operable controls, visible focus states, and sufficient color contrast.
- Do not rely on color alone to communicate status. Give icons accessible names when they convey meaning.
- Respect reduced-motion preferences; animation must not block interaction or convey essential information by itself.
- Use appropriate input types, autocomplete, and concise inline validation.

## Product trust and privacy
- Make profile visibility, organization identity, and opportunity requirements understandable.
- Do not expose private messages, email addresses, phone numbers, or non-public profile fields in public UI.
- Avoid dark patterns, fake urgency, fake social proof, and misleading success states.
- Treat loading, empty, error, and permission-denied states as part of the design—not afterthoughts.

## Before shipping
- Check keyboard-only navigation and focus order.
- Check contrast and zoom/responsive behavior.
- Verify links, forms, and actions actually work.
- Verify copy is clear and the interface does not promise unsupported backend behavior.
