# Slice Log

A shared log of pizza restaurants you've tried across NYC/NJ — search a place via Google, each of you rates it 0–10 and writes a short review independently, attach photos, and browse the list sorted or filtered however you like. Meghan and Tommy both log from their own phones against one shared backend — either through the native app (Expo Go today, TestFlight later) or a [web build](#web-build-a-second-way-in) that runs in any browser.

## Stack

- **Expo (React Native) + TypeScript**, using **Expo Router** for file-based navigation (`app/`).
- **Supabase** (Postgres + Storage) as the shared backend — both phones read/write the same dataset. Chosen over Firebase because the app's data is inherently relational (restaurants with child tables for photos/tags/order-types, filtered and sorted with SQL-style logic), which maps directly onto Postgres and would've fought against Firestore's document/NoSQL model.
- **Google Places API (New)** via direct `fetch` calls (Autocomplete + Place Details), biased to a NYC/NJ bounding box. Results aren't restricted by Google's place type — plenty of real pizzerias are tagged `restaurant` or `italian_restaurant` rather than `pizza_restaurant`, so narrowing by type was hiding legitimate results.
- **expo-image-picker** for picking photos from the camera/library; they upload straight to Supabase Storage so both people can see them.

## Ratings

Each restaurant has two independent rating/review pairs — **Tommy's Rating/Review** and **Meghan's Rating/Review** — either of which can be left blank. **Tommy's Rating is the only one used for sorting/filtering/ranking anywhere in the app**; Meghan's is informational and shown alongside it on the detail screen but never affects order.

## Who's using the app right now?

There's no login — on first launch (or via the "👤" pill on the home screen), you pick "Meghan" or "Tommy." This is purely local to that phone (stored with AsyncStorage, never synced) and only affects which rating/review section is shown first on the add/edit screen, with a small "(You)" label — **both people's fields are always fully visible and editable regardless of whose profile is active**, in case one of you fills in the other's rating.

Currently pinned to **Expo SDK 54** to match what the Expo Go app on the App/Play Store supports as of this writing. If you update Expo Go and want to move to a newer SDK, bump `"expo"` in `package.json` and then run `npx expo install --fix` (this project's dependency versions were aligned the same way) followed by `npx expo-doctor` to confirm everything lines up — and double-check `app.json`'s `plugins` array afterward, since not every `expo-*` package ships a config plugin in every SDK (`expo-status-bar` doesn't in SDK 54, for example; an unsupported entry there will break `expo config`/the dev server with a `PluginError`).

## One-time setup

### 1. Get a Google Places API key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/), create or select a project.
2. **APIs & Services → Library** → enable **Places API (New)**.
3. **APIs & Services → Credentials** → **Create Credentials → API key**.
4. Restrict the key (important — this key ships inside the app bundle, so restriction is your main protection):
   - **Application restrictions**: choose iOS/Android, and enter:
     - iOS bundle ID: `com.slicelog.app`
     - Android package name: `com.slicelog.app` (you'll also need its SHA-1 fingerprint once you create a real Android build/keystore — for Expo Go development this restriction won't yet apply, see note below)
   - **API restrictions**: restrict the key to **Places API (New)** only.

> Note: Expo Go itself doesn't run under your app's bundle ID, so an application-restricted key will reject requests made while testing inside Expo Go. During development, either leave the key unrestricted (fine for a personal project, just don't commit it) or temporarily restrict by API only (no app restriction) until you build a standalone app with EAS, at which point add the app restriction back.

### 2. Set up the shared Supabase backend

1. Create a free account and project at [supabase.com](https://supabase.com).
2. In the project's **SQL Editor**, paste and run everything in [`supabase/schema.sql`](supabase/schema.sql) — it creates the four tables (`restaurants`, `photos`, `restaurant_tags`, `restaurant_order_types`), their indexes, and explicitly disables Row Level Security on them.
   > This is a private, no-login, two-person app, so RLS is off for simplicity — the anon key below grants full read/write to these tables. Treat it like the Google Places key: don't commit it or post it publicly, but it's meant to be embedded in the client, so this isn't a "secret" in the same sense as a database password.
3. **Storage → New bucket** → name it `photos` → toggle **Public** on. (Public buckets allow the client to fetch photos via a plain URL without extra signed-URL logic — but this toggle only grants anonymous *read* access, see the next step.)
4. Back in the **SQL Editor**, paste and run [`supabase/storage-policies.sql`](supabase/storage-policies.sql). `storage.objects` has its own Row Level Security, separate from the bucket's public toggle, and ships locked down with no policies — without this step, photo uploads fail with `new row violates row-level security policy`.
5. **Settings → API** → copy the **Project URL** and the **`anon` `public`** key.

### 3. Configure both keys locally

```bash
cp .env.example .env
```

Edit `.env` and set:

```
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your-actual-key
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

`.env` is gitignored — never commit real keys.

### 4. Install dependencies

```bash
npm install
```

## Running the app

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app (iOS or Android) on your phone. The app will hot-reload as you edit code.

Useful variants:
- `npm run ios` — open in the iOS Simulator (requires Xcode, macOS only)
- `npm run android` — open in an Android emulator (requires Android Studio)
- `npx expo start --clear` — clear the Metro bundler cache if you hit stale-bundle issues

## How the data is stored

Everything lives in Supabase (Postgres) — four tables: `restaurants`, plus child tables `photos`, `restaurant_tags`, and `restaurant_order_types` (one-to-many off `restaurants`, matching the app's multi-select tags/order-types). Schema lives in [`supabase/schema.sql`](supabase/schema.sql); the client-side query/mutation logic lives in `src/db/*Repository.ts` and `src/lib/supabase.ts`.

Each restaurant is keyed by its Google `place_id` (unique constraint in Postgres), so searching for a place you've already logged routes you to the existing entry instead of creating a duplicate — same as before, just enforced by the shared database now instead of a local one.

Photos upload straight to the Supabase Storage `photos` bucket as soon as you pick them (see `PhotoPicker`/`uploadPhotoFile`), so they're visible to both of you immediately, not just on the phone that took them.

**Sync model**: not real-time — the list/map/detail screens refetch when a screen comes into focus (already the pattern before this change), and the home list also supports pull-to-refresh, so the other person's changes show up the next time you open the app, switch back to a screen, or pull down to refresh. If you want live updates while both apps are open at the same time later, Supabase Realtime (`supabase.channel(...).on('postgres_changes', ...)`) is a small, well-contained addition — not built now since it's not needed for "changes show up on next open."

## Setting Tommy up

Both of you point at the **exact same** `.env` values (`EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY`, and the Google Places key) — nothing in this project's config is per-device. There are now three ways Tommy can actually open the app:

- **Recommended for now**: the **web build** (see below) — just a URL in Safari, no computer of yours needs to be running, no TestFlight/Apple Developer Program needed. A few native niceties are simplified on web (see "What's different on web" below), but it's the lowest-friction option today.
- **Shared source + Expo Go**: Tommy gets a copy of this project folder plus your `.env` file, `npm install`, then `npx expo start` on his own computer, scanning the QR code with Expo Go on his phone. This requires a computer running Metro whenever he wants to open the app — not great for spontaneous use, and now superseded by the web build for that reason.
- **Later, if you want it**: a real installable native app via TestFlight (requires an Apple Developer Program membership, $99/year) so he can open the full native experience independently anytime with no computer involved. This is a separate, explicitly-deferred follow-up — ask whenever you're ready and I'll set up EAS Build + TestFlight distribution.

## Web build (a second way in)

Alongside the native app (Expo Go today, TestFlight later), Slice Log also runs as a website — same shared Supabase backend, so changes made from the browser and from the native app stay in sync with each other exactly like two native phones do.

### Running it locally

```bash
npm run web
```

Opens `npx expo start --web` and serves the app at `http://localhost:8081` (or whatever port it prints) in your default browser.

### What's different on web

A few native-only libraries don't have (or don't need) a real web equivalent, so the web build swaps in web-specific versions of these pieces. Everything else — search, ratings/reviews, tags, sorting/filtering, photo uploads, Supabase sync — is identical:

- **Map tab**: `react-native-maps` has no real web support at all (it renders a blank box), so the web build uses **Leaflet + OpenStreetMap** instead (free, no API key). It shows the same pins and "View details" links, but the look/feel and gestures are a plain web map rather than the native Apple/Google Maps widget.
- **Add Photo**: on native, tapping "+" shows a "Take Photo / Choose from Library" menu. On web, it opens the browser's file picker directly — mobile Safari already lets you choose your camera or photo library from that one dialog, so the extra menu wasn't needed there.
- **Photo lightbox**: the native swipe-through viewer doesn't have a web build, so the web version is a simpler tap-based viewer — click the ‹/› arrows (or use your keyboard's arrow keys) to move between photos, click outside the photo or press Escape to close.
- **Date field**: uses your browser's native date picker instead of the app's custom spinner — same underlying value, just a different picker UI.

### Deploying to Vercel

The project is already configured for this (`app.json`'s `web.output: "single"` + `vercel.json`). Vercel was chosen over Netlify mainly because its CLI/dashboard flow for a plain static SPA export needs zero extra configuration beyond the `vercel.json` already checked in — either host would work fine here.

1. Create a free account at [vercel.com](https://vercel.com) (you can sign up with GitHub).
2. Push this project to a GitHub repo if it isn't already, then in the Vercel dashboard: **Add New → Project** → import that repo. Vercel will read `vercel.json` automatically (build command `npx expo export -p web`, output directory `dist`).
3. Before the first deploy, go to **Project Settings → Environment Variables** and add the same three values from your `.env`:
   - `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

   These get baked into the static bundle at build time, so they must be set before you deploy (or trigger a redeploy after adding them).
4. Click **Deploy**. Vercel gives you a URL like `https://slice-log.vercel.app` — that's what you send Tommy.
5. **Security note**: the Google Places key is now visible in any visitor's browser Network tab (more discoverable than digging it out of a compiled app binary). Go back to the [Google Cloud Console](https://console.cloud.google.com/) credential you set up in step 1 and add an **HTTP referrer restriction** scoped to your Vercel domain (e.g. `https://slice-log.vercel.app/*`), the web equivalent of the iOS bundle ID / Android package restrictions already on that key.

Redeploying after future code changes is just `git push` to the connected branch (or `npx vercel --prod` from the CLI) — Vercel rebuilds automatically.

### What to send Tommy

Just the URL (e.g. `https://slice-log.vercel.app`). For an app-like icon on his home screen: open the link in **Safari** on his iPhone, tap the **Share** button, then **Add to Home Screen** — it'll use Slice Log's app icon and open full-screen without Safari's address bar, indistinguishable at a glance from a native app icon.

## Testing that both sides actually share data

Once both of you have `.env` pointed at the same Supabase project:
1. On one phone, log a new restaurant (or edit an existing one's rating).
2. Check the [Supabase Table Editor](https://supabase.com/dashboard) — confirm the row (and, if you attached a photo, the file in the Storage bucket) actually appears there.
3. On the other phone, open the app (or pull-to-refresh the home list, or navigate to that restaurant's detail screen) and confirm the change is visible.
4. Repeat in the other direction (edit from the second phone, confirm it shows up on the first) — this confirms both directions actually read/write the same data, not just that each phone can write to its own thing.

## Building a real app later

When you're ready for something beyond Expo Go (TestFlight, an APK, etc.), use [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npx eas-cli build --platform ios
npx eas-cli build --platform android
```

You'll need an Expo account and to run `eas build:configure` first. At that point, also tighten the Google API key's application restrictions using your real bundle ID/package name (and Android SHA-1) as noted above.
