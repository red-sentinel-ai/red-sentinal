We are using bun package manager but never run these build, tsc commands, just let me know when changes are done and I'll check manually 

## Living docs — keep in sync

- **Followers / Following feature** — whenever you change anything in the follow feature
  (`lib/auth-api.ts` follow functions, `hooks/social/*`, `components/profile/Follow*`, the
  `app/u/[identifier]/page.tsx` / `app/profile/page.tsx` wiring, or the backend `/social` route),
  you MUST also update the developer guide at `sui-sentinel/FOLLOWERS_FEATURE.md` (one level up from
  this `frontend/` folder) so it stays accurate end-to-end. Treat the doc as part of the change, not
  an afterthought.
