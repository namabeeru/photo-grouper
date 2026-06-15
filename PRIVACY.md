<!--
  DRAFT — review before publishing:
    - Fill in a contact method ([your-contact-email] below) if you want one beyond GitHub issues.
    - Confirm the wording fits your obligations in your jurisdiction (e.g. GDPR, CCPA).
  This document is a good-faith description of how the app works; it is not legal advice.
-->

# Privacy Policy

**Effective date:** June 15, 2026

Photo Grouper is built privacy-first. This policy explains, in plain language, what happens to your data when you use the app at [photogrouper.com](https://photogrouper.com).

## The short version

- **Your photos never leave your device.** All processing happens locally in your browser.
- **No account, no sign-up.** We don't ask for your name, email, or any personal details.
- **No photo uploads, ever.** There is no server that receives, stores, or sees your images.
- The only data collected is **anonymous, aggregated usage analytics** on the official hosted site — and even that is turned off in self-hosted copies by default.

## Your photos

When you add photos, they are read directly by your browser and held only in your device's memory for the current session. They are:

- **Processed entirely on-device** — compression, editing, filters, layout, and final export all run as client-side JavaScript using the HTML Canvas API.
- **Never transmitted** — no photo, thumbnail, or derived image is sent to Photo Grouper, our host, or any third party.
- **Not persisted** — photos are not saved to a server or to long-term browser storage. Closing or reloading the tab discards them.

## What we collect

On the **official hosted site** ([photogrouper.com](https://photogrouper.com)):

- **Vercel Web Analytics** — anonymous, aggregated usage data such as page views and general device, browser, and country-level information. It does not use tracking cookies, does not follow you across other sites, does not collect your photos, and does not identify you personally. See [Vercel's analytics privacy documentation](https://vercel.com/docs/analytics/privacy-policy).
- **Standard server logs** — our hosting provider (Vercel) processes routine request metadata (such as IP address and browser user-agent) for the sole purpose of delivering the web page to you, as happens with essentially any website.

## What we do **not** collect

- Your photos or anything derived from them.
- Names, email addresses, or account credentials (there are no accounts).
- Precise location.
- Cross-site tracking or advertising profiles.

## Cookies & local storage

Photo Grouper does not use tracking or advertising cookies. As a Progressive Web App, it uses a service worker to cache the application's own code and assets so it can work offline — this cache contains app files, **not** your photos.

## Fonts & third parties

- **Fonts are self-hosted.** The app serves its fonts from its own domain and does not make requests to Google Fonts at runtime.
- The only third party involved in the hosted site is **Vercel**, which provides hosting and the optional analytics described above.

## Self-hosted and forked versions

Photo Grouper is open source, and anyone can run their own copy. In self-hosted or forked deployments, analytics is **disabled by default** and only runs if the operator explicitly opts in. If you use a copy hosted by someone else, their data practices — not this policy — apply.

## Children's privacy

Photo Grouper does not knowingly collect personal information from anyone, including children, because it does not collect personal information at all.

## Changes to this policy

If this policy changes, the updated version will be posted here with a revised effective date.

## Contact

Questions about privacy? Open an issue on [GitHub](https://github.com/namabeeru/photo-grouper/issues)<!-- or email [your-contact-email] -->.
