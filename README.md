# Taiwan MRT

Interactive metro station map for all 4 Taiwan MRT systems with real-time location tracking and bilingual support.

## Features

- **4 Metro Systems**: Taipei TRTC, Kaohsiung KRTC, Taoyuan TYMC, Taichung TMRT
- **167+ Stations**: All stations with embedded coordinate data (no external API)
- **Line Filters**: Filter by metro line (e.g., Taipei Red, Kaohsiung Circular LRT)
- **Search**: Find stations by name in English or Chinese
- **Locate**: Center map to user's current location
- **Bilingual**: Toggle between English and Chinese (auto-detect from browser)
- **PWA**: Installable as standalone app with offline support
- **Responsive**: Desktop side panel, mobile bottom sheet with drag gestures

## Tech Stack

- **HTML5/CSS3/JavaScript**: All inline, no build system required
- **Leaflet 1.9.4**: Interactive maps with markers and popups
- **OpenStreetMap**: Free map tiles (no API key)
- **Service Worker**: Offline caching, PWA installation
- **localStorage**: Persist language and system selection

## Quick Start

```bash
# Start local server
python3 -m http.server 8003

# Open browser
open http://localhost:8003
```

No npm install, no build commands. Just serve static files.

## Project Structure

```
mrt/
├── index.html          # Main app (1126 lines, all-in-one)
├── manifest.webapp     # PWA manifest
├── sw.js               # Service worker
├── js/
│   └── bottom-sheet.js # Mobile bottom sheet component
├── img/                # Icons (32px to 512px)
├── android/            # Android native build (Capacitor)
├── ios/                # iOS native build (Capacitor)
└── tests/              # Playwright e2e tests
```

## Data

All station data embedded in `index.html` as static JSON:
- Station coordinates (latitude/longitude)
- Names (Chinese and English)
- Line codes and colors
- System metadata (centers, zoom levels)

No external API calls for station data.

## MRT Systems

| System | Code | Lines | Stations |
|--------|------|-------|----------|
| Taipei Metro | TRTC | BR, R, G, O, BL, Y, LG | 130+ |
| Kaohsiung Metro | KRTC | KR, KO, KC | 40+ |
| Taoyuan Metro | TYMC | A | 21 |
| Taichung Metro | TMRT | TG | 18 |

Notable lines:
- **LG**: Ankeng Light Rail (Taipei)
- **KC**: Kaohsiung Circular Light Rail (37 stations)

## Native Builds

Android and iOS builds using Capacitor WebView wrapper.

**Android**: `tw.pwa.mrt`
- Build: `cd android && ./gradlew assembleDebug`
- Sync web: `./android/sync-web.sh`

**iOS**: `tw.pwa.mrt`
- Build: Open `ios/Mrt/Mrt.xcodeproj` in Xcode
- Sync web: `./ios/sync-web.sh`

## Testing

E2E tests with Playwright:

```bash
# Install dependencies
npm install

# Run tests (headless)
npm test

# Run tests (headed)
npm run test:headed
```

Tests auto-start Python server on port 8003.

## Development

All code is inline in `index.html`:
- **CSS**: `<style>` tag (400+ lines)
- **JavaScript**: `<script>` tag (700+ lines)
- **Data**: Embedded JSON objects

External dependencies loaded via CDN:
- Leaflet 1.9.4 (unpkg.com)
- OpenStreetMap tiles

## Deployment

Static site hosted on GitHub Pages. Deploy by pushing to `gh-pages` branch.

## License

MIT
