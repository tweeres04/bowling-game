# Analytics (Mixpanel)

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
- **Identity:** `distinct_id` is the player ID (`players.id`). Making an account keeps the same player, so it only adds `$email` to the profile. Logging in or out switches to a different player, so the browser SDK calls `reset()` before identifying the new one.
- **Naming:** event names are `snake_case`, past tense (`noun_verbed`). Property names are `snake_case`, and booleans start with `is_`.
- **When to track:** after the action succeeds (after the database write), never on click. Don't track in loops, like once per away shot.
- **Updates:** add new events to the table below.

| Event                            | Trigger                                                                                                  | Key properties                                                                                                                                           | File                         |
| -------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `player_created`                 | A visitor's first action (a shot, the play button, a focus) creates their player                         | `platform`                                                                                                                                               | `src/lib/player.ts`          |
| `away_progress_collected`        | Coming back after a game or more finished while away (the welcome back dialog)                           | `away_minutes`, `is_capped`, `games_completed`, `average_score`, `first_ball_xp_gained`, `spares_xp_gained`, `first_ball_level`, `spares_level`, `focus` | `src/app/actions.ts`         |
| `game_completed`                 | A game finishes while you're there, from Shoot or auto mode (not away)                                   | `score`, `strikes`, `spares`, `finished_by` (`manual` / `auto`), `first_ball_level`, `spares_level`, `focus`                                             | `src/app/actions.ts`         |
| `focus_changed`                  | The player picks a focus                                                                                 | `focus`, `previous_focus`                                                                                                                                | `src/app/actions.ts`         |
| `auto_mode_toggled`              | The play button turns auto mode on or off                                                                | `is_on`                                                                                                                                                  | `src/app/actions.ts`         |
| `away_cap_notifications_toggled` | The switch in settings or the welcome back dialog turns notifications for hitting the away cap on or off | `is_on`                                                                                                                                                  | `src/app/actions.ts`         |
| `account_created`                | Making an account, with a password or Google                                                             | `method` (`password` / `google`)                                                                                                                         | `src/lib/account.ts`         |
| `logged_in`                      | Logging into an existing account, which switches this device to its player                               | `method` (`password` / `google`)                                                                                                                         | `src/lib/account.ts`         |
| `logged_out`                     | Logging out, tracked on the player being left                                                            |                                                                                                                                                          | `src/app/account-actions.ts` |
