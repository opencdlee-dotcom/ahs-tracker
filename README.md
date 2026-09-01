# AHS Tryout Tracker

Attendance and evaluations for high-school athletic tryouts, as a single-page
web app that installs to a phone or tablet home screen and keeps working with
no signal.

**Open it:** https://opencdlee-dotcom.github.io/ahs-tryout-tracker/

## Putting it on a phone

- **iPhone / iPad** — open the link in **Safari** (Chrome on iOS cannot do
  this), then Share → **Add to Home Screen** → Add.
- **Android** — open the link in Chrome; it offers **Install app**, or use
  the ⋮ menu → Add to Home screen.

It then opens full screen with no browser bars, and works offline.

## What is in here

| file | what it is |
|---|---|
| `index.html` | the entire application — no build step, no dependencies to fetch |
| `manifest.webmanifest` | name, colours and icons once installed |
| `sw.js` | service worker; caches the app so it opens with no signal |
| `icon-*.png`, `apple-touch-icon.png` | home-screen icons |
| `.nojekyll` | tells GitHub Pages to serve the files as they are |

## No data lives here

This repository holds the application only. Rosters, attendance and
evaluations are never stored in it. Each coach's own data lives in their
browser on their own device, and — when the staff share one roster — in a
Google Sheet that the coaching staff owns. The address and token for that
Sheet are entered on each device and are never part of this repository.

Please keep it that way: no spreadsheets, no exports, no backup `.json`.

## Updating it

The app is built from sources kept outside this repository. Rebuild, then
replace the files here and push — every installed copy picks up the new
version on its next launch and offers a reload.
