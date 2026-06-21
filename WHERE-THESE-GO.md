# GeoScale UI Redesign — File Drop-In Guide

Drop these into: C:\Users\Aman\Downloads\geoscale-frontend\

| File in this zip            | Replaces / creates at                          |
|------------------------------|-------------------------------------------------|
| src/App.jsx                  | src/App.jsx  (replace)                           |
| src/pages/LandingPage.jsx    | src/pages/LandingPage.jsx  (NEW file)            |
| src/pages/LoginPage.jsx      | src/pages/LoginPage.jsx  (replace)               |
| src/pages/QuizPage.jsx       | src/pages/QuizPage.jsx  (replace)                |

## What changed

**App.jsx** — `/` is now the public landing page. Logged-in users hitting `/`
get bounced straight to `/map`. Unknown routes (`*`) now fall back to `/`
instead of `/dashboard`.

**LandingPage.jsx (new)** — Dark glassmorphism landing page. Hero headline
typewriter-cycles through countries that fit inside Africa at true scale
("Japan." / "most of Europe." / "the UK." ...), with an interactive hero
mockup (mouse-tilt, count-up "14x" Greenland-tiles-into-Africa visual) tied
directly to the True Size Of feature. Feature cards for the 4 core features,
stats strip, CTA band, footer.

**LoginPage.jsx** — Logo now links back to `/`. Reads `?tab=register` from
the URL so the landing page's "Get started" button opens straight on the
register tab. Post-login redirect changed from `/dashboard` → `/map` (since
`/dashboard` was never in the sidebar nav to begin with).

**QuizPage.jsx** — Full dark mobile-card redesign:
- 15s countdown per question, pink→blue gradient bar (turns red/orange
  under 5s), auto-reveals the correct answer on timeout without an API call
- Tapping an option now answers immediately (no separate Submit step)
- Rounded pill option cards, checkmark/X badges, dimmed wrong options on reveal
- Reward animation on correct: green flash + confetti burst + "+10 XP 🔥" popup
- Decorative blurred corner dots, full dark page background
- Same backend calls as before (quizService.startSession/getQuestion/
  submitAnswer/completeSession) — only the UI/UX changed

## Verified
`npm run build` passes clean against your actual node_modules (116 modules,
no errors) — built and tested against the real project zip you uploaded,
not from scratch.

## Still open (per the original handoff doc)
- RegisterPage.jsx is dead code — registration actually happens inline in
  LoginPage's "Create account" tab. RegisterPage uses Tailwind classes
  (bg-geo-bg, text-geo-accent, animate-slide-up) that don't exist in your
  tailwind.config.js, so if it's ever reached directly it'll render unstyled.
  Didn't touch it since it's out of scope — flag if you want it fixed or removed.
- AppLayout.jsx sidebar is still the light theme — only the landing page and
  quiz page went dark, per what was asked. Say the word if you want the
  whole shell unified.
