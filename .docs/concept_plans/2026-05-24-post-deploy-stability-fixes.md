# Post-deploy stability fixes — stale session, broken restore, data persistence

Three bugs surface together whenever the SQLite database is reset (fresh server, `./data` accidentally cleared, or restoring from backup after a re-install).

---

## Bug 1 — Stale session crashes the app after a DB reset

### What
After a deploy where `./data/contekst.db` is empty or new, the browser still holds a valid JWT session cookie from the previous installation. The JWT signature is valid so Auth.js accepts it, but the `user_id` inside it refers to an account that no longer exists. This puts the app in a broken state — API calls fail silently, and somewhere in the Server Component render tree Next.js throws:

```
Error: Cookies can only be modified in a Server Action or Route Handler.
```

The user has to manually delete browser cookies to recover, then create a new account.

### Why
Auth.js v5 uses JWT sessions (`strategy: 'jwt'`). The JWT is self-contained and verified by signature — it never checks the database on every request. When something downstream detects the user is missing and tries to call `signOut()` or clear the session cookie, it does so during Server Component rendering, which Next.js forbids.

### Fix
Add a database existence check inside the `jwt` callback in `lib/auth.ts`. When this is a token *refresh* (not a fresh login), query for the user. Return `null` if the user no longer exists — Auth.js interprets a null token as "no session" and the cookie expires cleanly without touching `cookies()` from a component.

```ts
// lib/auth.ts — jwt callback
async jwt({ token, user }) {
  if (user) {
    token.id = user.id
    return token
  }
  if (token.id) {
    const exists = await db.query.users.findFirst({
      where: eq(users.id, token.id as string),
      columns: { id: true },
    })
    if (!exists) return null   // stale token → no session, no cookie error
  }
  return token
},
```

---

## Bug 2 — Backup restore fails with FOREIGN KEY constraint

### What
Importing a backup JSON via Settings → Restore throws:

```
SqliteError: FOREIGN KEY constraint failed (SQLITE_CONSTRAINT_FOREIGNKEY)
```

The restore completes nothing — all existing data was already deleted, leaving the user with an empty app.

### Why
The backup JSON stores the *original* account's UUID in every `userId` field across all content tables (`contexts`, `todos`, `dates`, `notes`, `habits`, `links`, `people`). After creating a new account on a fresh install, the authenticated user has a *different* UUID. The restore route (`app/api/restore/route.ts`) inserts backup rows verbatim, so the first insert — `contexts` — hits the FK constraint `contexts.user_id → users.id` because the old UUID doesn't exist in `users`.

### Fix
In the restore route, detect the old `userId` from the backup data, then remap every `userId` field to the current authenticated user's id before inserting.

```ts
// Detect old userId from any userId-bearing record in the backup
const backupUserId: string | undefined =
  ctx?.[0]?.userId ?? td?.[0]?.userId ?? dt?.[0]?.userId

function remap<T extends { userId?: string }>(arr: T[] | undefined): T[] {
  if (!arr?.length) return []
  if (!backupUserId || backupUserId === userId) return arr
  return arr.map(item =>
    item.userId === backupUserId ? { ...item, userId } : item
  )
}
```

Applied to tables with a `userId` field: `contexts`, `todos`, `dates`, `notes`, `habits`, `links`, `people`.

Not needed for: `widgetConfigs`, `todoLists`, `habitLogs` — these only carry `contextId` or `habitId` foreign keys, which remain valid because context UUIDs are preserved from the backup as-is.

---

## Bug 3 — Data loss across deploys (operational)

### What
Each new deploy starts with an empty database, forcing the user to create a new account.

### Why
This is not a code bug. The Docker Compose config correctly uses a bind mount:

```yaml
volumes:
  - ./data:/app/data
```

The host `./data` directory must exist and be preserved between deploys. If the container is recreated on a new host, or `./data` is deleted, the database is lost.

### Fix
No code change required. The correct deploy workflow is:

1. **Before updating the image:** export a backup from Settings → Export backup JSON. Save it locally.
2. Update and restart the container: `docker-compose pull && docker-compose up -d`
3. **If `./data` was preserved:** data is intact, nothing else to do.
4. **If `./data` was lost:** log in, create a new account, then Settings → Restore to import the backup.

Add a comment to `docker-compose.yml` noting that `./data` must be preserved.

---

## Files affected

| File | Change |
|------|--------|
| `lib/auth.ts` | Add DB lookup in `jwt` callback; return `null` when user missing |
| `app/api/restore/route.ts` | Add `remap()` helper; apply to userId-bearing table inserts |
| `docker-compose.yml` | Add comment about preserving `./data` across deploys |
