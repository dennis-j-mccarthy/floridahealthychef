# Connecting the Social tool to Facebook (and Instagram)

This wires `/admin/social` to Beth's real Facebook Page so the app can
**publish and schedule posts itself** — no browser automation. When the Page
has a linked Instagram Business account, the same composer can publish a photo
post to **Instagram** too.

## What you get after setup

- An admin page at **`/admin/social`** with a **Connect Facebook** button and a
  composer that publishes or schedules posts to Beth's Page via Meta's Graph
  API, with a per-channel checkbox for Facebook and Instagram.

## The one-time setup (≈15 min)

### 1. Create a Meta app

1. Go to **developers.facebook.com → My Apps → Create App**.
2. Type: **Business**. Name it e.g. "Florida Healthy Chef Tools".
3. Note the **App ID** and **App Secret** (Settings → Basic).

### 2. Add the Facebook Login product

1. In the app dashboard: **Add product → Facebook Login → Set up**.
2. Facebook Login → **Settings → Valid OAuth Redirect URIs**, add both:
   - `http://localhost:3000/api/admin/meta/callback` (local dev)
   - `https://floridahealthychef.com/api/admin/meta/callback` (production)
3. Save.

### 3. Give the app its permissions (Development mode is enough for Beth)

While the app is in **Development mode**, people with a **role on the app**
(admin / developer / tester) can use the advanced permissions on their **own**
Pages **without full App Review**. So:

1. App dashboard → **App roles → Roles** → add **Beth's Facebook account** as an
   **Admin** or **Tester** (she accepts the invite from her account).
2. The scopes the app requests: `pages_show_list`, `pages_read_engagement`,
   `pages_manage_posts`, `pages_manage_engagement`, `business_management`,
   `read_insights`, `instagram_basic`, `instagram_content_publish`.
   > Full **App Review** is only needed later, if people *other than* app-role
   > users will use the tool.

### 4. Set the environment variables

In `.env.local` (dev) and in Vercel (prod):

```
META_APP_ID=<your app id>
META_APP_SECRET=<your app secret>
# optional:
# META_GRAPH_VERSION=v21.0
# META_REDIRECT_BASE=https://floridahealthychef.com
```

### 5. Apply the database migration

The `MetaConnection` table stores the OAuth tokens (and `BlogSettings` stores
the blog tone). They ship as migration
`20261022000000_meta_connection_and_blog_settings`.

> ⚠️ **This repo's build is `prisma generate && next build` — it does NOT run
> `prisma migrate deploy`.** The migration is **not** applied automatically on
> deploy. Apply it manually once against the database before using the Social
> tool or the blog tone settings:

```
npx prisma migrate deploy
```

(Local dev uses the same Neon database via `DATABASE_URL`, so this only needs
to run once.)

### 6. Connect

1. Sign in to `/admin`, open **Social**.
2. Click **Connect Facebook**, log in as Beth (or as a user with a role on the
   app), and approve the Page.
3. You'll land back on the Social page showing **Connected to Florida Healthy
   Chef** (and the linked Instagram handle, if any).

## Simplest activation: a direct Page token (recommended for one Page)

If the app uses **Facebook Login for Business** (the "Manage everything on your
Page" use case), the interactive login needs a *configuration*. For a single
Page it's easier to skip that and provide a long-lived Page token directly:

1. Go to **developers.facebook.com/tools/explorer** (Graph API Explorer).
2. Top right: **Meta App** → select your app.
3. **User or Page Access Token** dropdown → **Get User Access Token** → check
   `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, and — for
   Instagram — `instagram_basic` and `instagram_content_publish` → Generate →
   log in / approve as the Page admin.
4. In the same dropdown, pick the **Page** to get a **Page access token**.
5. Make it long-lived: open **Access Token Debugger**
   (developers.facebook.com/tools/debug/accesstoken), paste the Page token →
   **Extend Access Token**. A Page token derived from a long-lived user token
   does not expire.
6. Find the **Page ID**: on the Page → About, or GET `/me?fields=id` with the
   Page token selected.
7. Put them in `.env.local` (and Vercel):
   ```
   META_PAGE_ID=<page id>
   META_PAGE_TOKEN=<long-lived page token>
   META_PAGE_NAME=Florida Healthy Chef
   # Instagram (optional — enables the Instagram channel):
   META_IG_USER_ID=<ig business account id>
   META_IG_USERNAME=<ig handle>
   ```
8. Reload `/admin/social` — it shows **Connected** and the composer is live.
   (No "Connect Facebook" click needed on this path; the env values take
   precedence over any stored OAuth connection, and Reconnect/Disconnect are
   hidden.)

To find `META_IG_USER_ID`: with the Page token selected in the Graph API
Explorer, GET `/{page-id}?fields=instagram_business_account{id,username}`.

## Using it

- **Publish now**: writes the post to the selected channels immediately.
- **Schedule** (Facebook only): set a date/time ≥ ~15 min out (Meta's rule:
  10 min–6 months). The composer sends an absolute timestamp so the schedule
  lands in the right timezone.
- **Image**: paste a **public https** image URL, or pick one of the captioned
  gallery photos (shown as thumbnails). Graph fetches it server-side, so it
  must be reachable from the public internet — a relative `/images/...` path or
  `localhost` won't work.
- **Instagram**: requires a public **JPEG** image (no text-only posts; Meta
  rejects PNG/WebP for Instagram) and publishes immediately. The Instagram
  channel is active **only when `META_IG_USER_ID` is set** in the environment —
  even on the OAuth path, where the linked IG account is captured but not used
  for publishing until that env var is present.

## Tokens

- The Page access token is long-lived and doesn't normally expire.
- The user token is long-lived (~60 days); the Social page shows when to
  reconnect. Click **Reconnect** to refresh.

## Notes / limits

- A Facebook Page post with an image uses `/{page-id}/photos`; text-only uses
  `/{page-id}/feed`. Scheduling sets `published=false` +
  `scheduled_publish_time`.
- Instagram uses the Content Publishing API: create a media container
  (`/{ig-user-id}/media`), poll until it finishes processing, then publish
  (`/{ig-user-id}/media_publish`).
- Disconnecting here forgets the stored OAuth token; Beth can also remove the
  app from **facebook.com → Settings → Business Integrations**. (The direct
  env-token path can only be removed by clearing the env vars.)
