# Jarvis Fit 1.3 — Android-first implementation plan

Status: specification; no runtime features implemented by this document.

## Goals
- Running: elapsed and moving time, average pace (min/km), per-km splits, distance, speed, timestamps and timezone, personal bests by distance (only comparable complete activities).
- Training: goals (5 km/10 km, weekly distance and frequency), progress, streaks based on completed training days, planned versus completed workouts, CrossFit WOD and loads.
- Evolution dashboard: weekly/monthly distance and duration, pace trend, goal progress, PRs, effort and recovery, filtering by date and activity.
- Routes: online map, saved route geometry, offline map packs and offline activity recording; clear offline availability/size and storage limits.
- Privacy: GPS opt-in, local-first storage, export/import, no location in public GitHub logs, no automatic upload of raw tracks.

## Architecture
- Keep React/TypeScript PWA for dashboard and manual logs.
- Android-only native shell via Capacitor is a candidate; GPS tracking with screen locked MUST use an Android foreground location service with ongoing notification, permission flow and on-device persistence. Web geolocation in a PWA is insufficient for reliable locked-screen tracking.
- MapLibre Native for Android map rendering; OpenStreetMap data with appropriate attribution and an offline tile provider or self-hosted tiles. Do not bulk-download OSM public tile servers.
- GPS comes from Android location APIs/GNSS; MapLibre renders maps, it does not supply GPS fixes.
- Persist tracks locally in a transactional database, batch location points, reject implausible jumps and record accuracy; resume safely after process interruption. Test power management restrictions per device.
- Route recording and offline map downloads are separate capabilities.

## Delivery gates
1. v1.3a: data model migration preserving v1.2 records, pace calculations, PRs, goals, streaks, dashboard; unit tests and backup restore tests.
2. v1.3b: Android prototype with foreground location service, start/pause/resume/stop, GPS accuracy and battery tests with screen locked.
3. v1.3c: online maps, route display, offline map packs, airplane-mode field tests, privacy and permission review.
4. Merge only after CI checks and manual verification; production branch is feat/pwa-initial. Back up existing data before any migration.

## Acceptance checks
- 5 km in 30 min displays 6:00 min/km; zero-distance entries never divide by zero.
- Date and time respect device timezone; imported v1.2 records remain readable.
- Dashboard totals match the underlying recorded workouts; personal bests exclude incomplete sessions.
- GPS recording continues while screen is locked during an explicit running session, with notification and stop control; record gaps and accuracy are visible.
- Offline route map remains viewable in airplane mode only for downloaded regions.
- No GPS permission requested before user starts a location feature.
