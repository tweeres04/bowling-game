# Onboarding prompts

The welcome back dialog (`src/components/away-summary.tsx`) shows at most one onboarding prompt at a time, so each return visit asks for one thing.

The order:

1. Make an account (players who aren't logged in)
2. Turn on away cap notifications (logged in, at the cap, and this device has them off)
3. Add to home screen (not built yet)

A new prompt slots into this order instead of showing alongside the others. Adding the home screen step means the dialog needs to know whether this browser has notifications on, so expose that as a hook from `src/components/away-cap-notifications.tsx` and pick a single next step in the dialog.
