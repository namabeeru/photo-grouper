# Photo Grouper - Architecture

> **AI AGENT INSTRUCTION**: You must read this file before starting any major refactor. If you change the tech stack or add a new major feature, you MUST update this file to reflect the new state of the project.

---

## Project Overview

**Photo Grouper** is a privacy-first photo collage maker web application. It allows users to create beautiful photo collages without uploading photos to any server. All image processing happens locally in the browser.

### Core Philosophy
- **Privacy-First**: Photos never leave the user's device
- **Offline-Capable**: Works as a PWA with service worker support
- **Client-Side Processing**: All image manipulation happens in the browser

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js (App Router) | 16.0.10 |
| **UI Library** | React | 19.2.1 |
| **Language** | TypeScript | ^5 |
| **Styling** | Tailwind CSS | ^4 |
| **Icons** | Lucide React | ^0.561.0 |
| **Image Compression** | browser-image-compression | ^2.0.2 |
| **PWA** | next-pwa | ^5.6.0 |
| **Build Tool** | Turbopack (via Next.js) | - |

---

## Project Structure

```
photo-grouper/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with metadata & fonts
│   ├── page.tsx            # Main page component (state machine)
│   ├── globals.css         # Global styles
│   └── favicon.ico         # App favicon
├── components/             # React components
│   ├── HomePage.tsx        # Landing/welcome screen
│   ├── PhotoSelection.tsx  # Photo picker & grid
│   ├── CollageEditor.tsx   # Collage layout editor
│   └── InstallPrompt.tsx   # PWA install prompt
├── utils/                  # Utility functions
│   ├── templates.ts        # Collage template definitions
│   ├── photoEdits.ts       # Per-slot edit + filter types and presets
│   └── collageGenerator.ts # Canvas-based collage rendering
├── public/                 # Static assets
│   ├── site.webmanifest    # PWA manifest
│   ├── apple-touch-icon.png
│   ├── android-chrome-*.png
│   └── favicon-*.png
├── next.config.ts          # Next.js + PWA configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies & scripts
```

---

## Application Flow

The app operates as a **three-phase state machine**:

```
┌──────────┐    Select    ┌─────────────┐    Group It    ┌──────────┐
│   Home   │ ──────────▶ │  Selection  │ ────────────▶ │  Editor  │
└──────────┘    Photos    └─────────────┘                └──────────┘
                                │                             │
                                │◀────── Cancel ──────────────┘
```

| Phase | Component | Description |
|-------|-----------|-------------|
| `home` | `HomePage.tsx` | Welcome screen with "Select Photos" CTA |
| `selection` | `PhotoSelection.tsx` | Photo picker with add/remove functionality |
| `editor` | `CollageEditor.tsx` | Template selection, photo arrangement, save |

---

## Key Features

### 1. Image Compression
- Uses `browser-image-compression` library
- Settings: `maxSizeMB: 1.5`, `maxWidthOrHeight: 1920`, `useWebWorker: true`
- Prevents app freeze when handling large images

### 2. Collage Templates
- Defined in `utils/templates.ts`
- Support for 2-9 photos with many layout options each (~4-7 per count)
- Each template has: `id`, `name`, `slots`, `aspectRatio`, `style`
- Styles: `clean`, `polaroid`, `rounded`, `artistic`

### 3. Per-Photo Editing (Adjust tab)
- Each slot can be tapped to open inline edit controls
- Adjustments: rotation, zoom (scale), pan (offsetX/Y), brightness, contrast,
  saturation, blur, and a `Swap photo` action
- Edits are stored as a `Map<slotId, PhotoEdits>` in page-level state
- Reset clears the slot back to defaults
- Reassigning a layout resets all edits (slot IDs may not map cleanly)

### 4. Instagram-Style Filters (Filters tab)
- Defined in `utils/photoEdits.ts` (`FILTER_OPTIONS`, `FILTER_PRESETS`)
- Presets: Mono, Noir, Sepia, Vintage, Fade, Warm, Cool, Vivid, Dramatic,
  Cinematic, Pastel, Lush, Matte (plus Original)
- Live thumbnails per preset render the selected photo with the filter via
  CSS `filter`
- `Apply to all` propagates the active filter to every slot
- Canvas export uses `ctx.filter` so JPEG output matches preview

### 5. Collage Style (Style tab)
- Background colour swatches + free colour picker
- Sliders for photo gap, corner radius, outer padding
- Stored as `CollageStyle` in page-level state, applied both in editor and
  during export

### 6. Canvas-Based Export
- `utils/collageGenerator.ts` renders collages using HTML Canvas API
- Replicates the CSS pipeline: cover-fit → translate → scale → rotate, then
  applies `ctx.filter` and clips with rounded rects
- Editor px values (gap/padding/radius) scale via
  `EXPORT_WIDTH / REFERENCE_WIDTH (448)` so output matches preview

### 7. PWA Support
- Configured via `next-pwa` in `next.config.ts`
- Service worker generated for offline capability
- Web manifest at `/public/site.webmanifest`

---

## State Management

- **No external state library** - Uses React's built-in `useState` and `useCallback`
- All state is managed in `app/page.tsx` and passed down as props
- Key state:
  - `phase`: Current app phase (`home` | `selection` | `editor`)
  - `photos`: Array of `PhotoData` objects with file & preview URL
  - `selectedTemplate`: Currently active collage template
  - `photoAssignments`: `Map<slotId, photoIndex>`
  - `slotEdits`: `Map<slotId, PhotoEdits>` — per-slot rotation/zoom/pan/filter
  - `collageStyle`: `CollageStyle` — background, gap, corner radius, padding

---

## Styling

- **Tailwind CSS v4** for utility-first styling
- **Geist font family** (Sans + Mono) via `next/font/google`
- Dark theme by default (`#1a1a2e` theme color)

---

## Development Commands

```bash
npm run dev     # Start dev server (Turbopack)
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

---

## Deployment

- Designed for static/edge deployment
- Recommended platform: **Vercel**
- No server-side data storage or API routes

---

## Future Considerations

When adding new features, consider:

1. **Maintain Privacy**: Any new feature must continue to process data client-side only
2. **PWA Compatibility**: Ensure new features work offline
3. **Template System**: New layouts should follow the `CollageTemplate` interface
4. **Performance**: Use image compression and web workers for heavy operations
