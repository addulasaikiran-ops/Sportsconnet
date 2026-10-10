---
name: web-quality
description: Use before shipping web UI or changes affecting accessibility, performance, security headers, SEO, reliability, or user experience.
---

# Web quality gate

Run the relevant checks for the scope of the change; do not claim checks were run unless they actually were.

## Accessibility
- Use semantic structure, meaningful headings, labels, alt text, keyboard support, visible focus, and accessible status/error announcements.
- Check contrast, zoom, reduced motion, touch target size, and focus management for dialogs/menus.
- Avoid unlabeled icon-only controls and keyboard traps.

## Performance and resilience
- Avoid unnecessary client-side JavaScript and repeated requests. Prefer server rendering when appropriate and use caching only for data that is genuinely safe to share.
- Never publicly cache user-specific, authenticated, or private responses. Review cache headers when changing profile, messaging, or account endpoints.
- Provide loading and failure states for network operations; avoid exposing stack traces or secrets.
- For images and media, consider dimensions, responsive delivery, upload limits, content type validation, and storage access policies.

## Security and privacy
- Validate all untrusted input server-side; apply authentication, authorization, rate limiting, and safe error responses.
- Check RLS and storage policies for least privilege. Public visibility must be intentional.
- Do not log credentials, access tokens, message bodies, private profile data, or raw sensitive identifiers.
- Treat user-generated content as untrusted and prevent injection or unsafe rendering.

## Search and metadata
- Keep page titles and metadata descriptive and accurate. Add canonical/share metadata where appropriate and avoid indexing private pages.
- Ensure links and navigation have meaningful destinations and labels.

## Practical pre-PR checks
- Run the repo's lint and production build, plus focused tests.
- Inspect responsive layouts and keyboard navigation when UI changes.
- Check browser console and network failures when the environment permits.
- Review the final diff for secrets, generated files, unrelated edits, and claims unsupported by implementation.
- State known limitations clearly; automated checks do not replace real browser, assistive-technology, or multi-account authorization testing.
