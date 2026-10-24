<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Analytics tracking (Mixpanel)

This project uses **Mixpanel** for product analytics. Don't add other analytics tools without asking.

| Detail           | Value                                                                           |
| ---------------- | ------------------------------------------------------------------------------- |
| Platform         | Next.js (App Router)                                                            |
| Mixpanel SDK     | `mixpanel` (Node, server-side only)                                             |
| Tracking method  | Server-side, from server actions and server code                                |
| CDP              | None                                                                            |
| Consent required | No (not targeting EU or California players for now)                             |
| Token location   | `MIXPANEL_TOKEN` env var, set in `compose.yml`. Unset locally, so no dev events |

- **One client:** Mixpanel is initialized once in `src/lib/analytics.ts`. Track through its `trackEvent(playerId, event, properties)` helper, and don't import `mixpanel` anywhere else.
- **Profiles and location:** `setPlayerProfile` keeps current state on the player's profile (levels, focus), and `setPlayerProfileOnce` records facts that never change (`$created`). Every call passes the player's IP from `x-forwarded-for`, so Mixpanel places them in the right spot. Callers don't await any of these.
- **Browser SDK:** `src/components/mixpanel-browser.tsx` loads `mixpanel-browser` for session replay (unmasked, no autocapture or page views) and adds browser details to the profile. It tracks no events itself. It sends through the `/mp` rewrite in `next.config.ts`.
- **Identity:** there's no login. `distinct_id` is the anonymous player ID from the player cookie (`players.id`), so there's no identify or reset.
- **Naming:** event names are `snake_case`, past tense (`noun_verbed`). Property names are `snake_case`, and booleans start with `is_`.
- **When to track:** after the action succeeds (after the database write), never on click. Don't track in loops, like once per away shot.
- **Updates:** add new events to the table below.

| Event                     | Trigger                                                                        | Key properties                                                                                                                                           | File                 |
| ------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `player_created`          | A visitor's first visit creates their player row (the away check on page load) | `platform`                                                                                                                                               | `src/lib/player.ts`  |
| `away_progress_collected` | Coming back after a game or more finished while away (the welcome back dialog) | `away_minutes`, `is_capped`, `games_completed`, `average_score`, `first_ball_xp_gained`, `spares_xp_gained`, `first_ball_level`, `spares_level`, `focus` | `src/app/actions.ts` |
