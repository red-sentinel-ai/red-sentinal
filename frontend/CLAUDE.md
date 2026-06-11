We are using bun package manager but never run these build, tsc commands, just let me know when changes are done and I'll check manually 

## Living docs — keep in sync

- **Followers / Following feature** — whenever you change anything in the follow feature
  (`lib/auth-api.ts` follow functions, `hooks/social/*`, `components/profile/Follow*`, the
  `app/u/[identifier]/page.tsx` / `app/profile/page.tsx` wiring, or the backend `/social` route),
  you MUST also update the developer guide at `sui-sentinel/FOLLOWERS_FEATURE.md` (one level up from
  this `frontend/` folder) so it stays accurate end-to-end. Treat the doc as part of the change, not
  an afterthought.

- **Novu notifications feature** — whenever you change anything in the Novu notification flow
  (`components/layout/NovuInbox.tsx`, the Novu constants in `constants/index.ts`, the backend
  `backend-service/api/services/novu.ts`, the trigger sites in `backend-service/api/routes/auth/index.ts`,
  the Novu env vars, or the `welcome` workflow / integrations in the Novu dashboard UI), you MUST
  also update the developer guide at `sui-sentinel/docs/NOVU_NOTIFICATIONS.md` so it stays accurate
  end-to-end (frontend Inbox + backend triggers + Novu dashboard). Treat the doc as part of the change.
