# Taiwan MRT Design Document

## Architecture Overview

Taiwan MRT is a Progressive Web App (PWA) that displays metro station information for all four Taiwan metro systems: Taipei (TRTC), Kaohsiung (KRTC), Taoyuan (TYMC), and Taichung (TMRT). The app uses a fully static data approach with no external API calls. All 167+ stations (including light rail lines) are embedded as JSON within the HTML file.

The app provides an interactive Leaflet map with system/line filtering, search capabilities, and bilingual support. It can be served via HTTP, loaded in native WebView wrappers, or installed as a PWA.

## Data Flow

### Data Sources
- **Embedded Static JSON**: All station data hardcoded in `<script>` tag within `index.html`
  - 167+ stations across 4 metro systems (TRTC, KRTC, TYMC, TMRT)
  - Includes station name (Chinese/English), line code, coordinates (lat/lng), exit count
  - No external API required, fully offline-capable from first load

### Data Structure
```javascript
const STATIONS = [
  {
    system: 'TRTC',
    line: 'BR',      // Brown Line (Wenhu)
    code: 'BR01',
    name: '動物園',
    nameEn: 'Taipei Zoo',
    lat: 24.9983,
    lng: 121.5794,
    exits: 2
  },
  // ... 166 more stations
];
```

### Render Cycle
1. On page load, parse embedded `STATIONS` array
2. Apply system filter (default: all systems)
3. Apply line filter (default: all lines)
4. Apply search filter (if user typed query)
5. Render filtered stations as Leaflet markers on map
6. Populate station list in sidebar panel
7. No network requests required (instant rendering)

## UI Components

### Navigation Header
- Language toggle button (EN/中文)
- Active state highlighting

### Filter Controls (Sidebar)
- **System Filter**: Radio buttons for TRTC, KRTC, TYMC, TMRT, or All
- **Line Filter**: Dropdown with all lines (BR, R, G, O, BL, Y, LG, KR, KO, KC, A, TG)
- **Search Box**: Text input for station name filtering (fuzzy match)

### Map View
- Leaflet 1.9.4 map with OpenStreetMap tiles
- Line-colored markers: Brown (BR), Red (R), Green (G), Orange (O), Blue (BL), Yellow (Y), Light Green (LG), Red (KR), Orange (KO), Circular (KC), Purple (A), Green (TG)
- Popup shows station name (bilingual), line, exits, distance from user
- Route polylines connecting stations by line (optional, can be enabled)

### Station List (Sidebar)
- Scrollable list of filtered stations
- Displays: line badge, station name (bilingual), distance
- Click to center map and open popup
- Distance sorted when user location available

### Locate Button
- Bottom-right floating action button (📍)
- Triggers Geolocation API to get user GPS
- Centers map to user location, adds blue marker
- Calculates and displays distance to all stations

### Mobile Layout (≤768px)
- Bottom sheet with drag handle
- Snap points: collapsed (56px), half (50vh), full (90vh)
- Summary line: "🚇 TRTC • 131 stations" (updates dynamically)

## Caching Strategy

### Service Worker (`sw.js`)
| Resource Type | Strategy | TTL |
|---------------|----------|-----|
| Static assets (HTML, CSS, JS) | Cache-first | 24 hours |
| Map tiles (OSM) | Cache-first | 7 days |
| Station data | N/A (embedded, no fetch) | Permanent |

### Cache Benefits
- **Instant offline access**: No API dependency means app works immediately after install
- **No rate limits**: No external API calls to throttle or fail
- **Zero latency**: Station data already in memory, no network delay
- **Version controlled**: Station updates require HTML file change (tracked in Git)

### Update Strategy
- Station data changes pushed via GitHub commit
- Service worker detects new HTML version, prompts user to reload
- Update frequency: quarterly (new lines/stations rare)

## Localization

### Language Toggle
- Default: `navigator.language` (zh-TW/zh-CN → Chinese, else English)
- Persistence: `localStorage.setItem('mrt-lang', lang)`
- Text elements: `data-en` and `data-zh` attributes
- Station names: dual fields `name` (Chinese) and `nameEn` (English)

### Bilingual Rendering
```javascript
function renderStationName(station, lang) {
  return lang === 'zh' ? station.name : station.nameEn;
}
```

## Native Wrappers

### Android WebView
- Loads `file:///android_asset/index.html` from APK
- WebView settings: JavaScript enabled, geolocation permission
- No internet permission required (fully offline)
- JavaScript bridge: `Android.shareStation(stationCode)` for native share

### iOS WKWebView
- Loads local HTML via `WKWebView.loadFileURL()`
- Configuration: `allowsBackForwardNavigationGestures`
- Swift bridge: `window.webkit.messageHandlers.shareStation.postMessage(code)`
- Core Location for GPS (user location on map)

### Asset Sync
- CI/CD: Copy `index.html` to native repos on merge
- Git submodule: `ios/MRT/Resources/` and `android/app/src/main/assets/`
- Build script validates station JSON schema

## State Management

### localStorage Keys
| Key | Purpose | Values |
|-----|---------|--------|
| `mrt-lang` | Language preference | `'en'` \| `'zh'` |
| `mrt-system` | Selected metro system | `'TRTC'` \| `'KRTC'` \| `'TYMC'` \| `'TMRT'` \| `'All'` |
| `mrt-line` | Selected line | Line code (e.g., `'BR'`, `'R'`) or `'All'` |

### In-Memory State
- `STATIONS`: Immutable hardcoded array (loaded once on page load)
- `filteredStations`: Subset after system/line/search filters applied
- `userLocation`: GPS coordinates `{lat, lng}` from Geolocation API
- `selectedMarker`: Currently highlighted station on map
- `markers`: Leaflet marker objects keyed by station code

### State Persistence
- System, line filters: persisted to localStorage on change
- User location: ephemeral, re-fetched each session
- Station data: immutable, no persistence needed
- Search query: not persisted (ephemeral UI state)

### No Dynamic Data
- MRT stations change infrequently (new lines every 2-5 years)
- Static data approach avoids API downtime, rate limits, CORS issues
- Tradeoff: Must redeploy app for station updates (acceptable for slow-changing data)

## Future Plan

### Short-term
- Add real-time train arrival data via TDX API
- Implement station exit information and POI
- Add fare calculator between any two stations
- Show transfer walkway times at interchange stations

### Medium-term
- Journey planner with optimal route suggestions
- First/last train time display per station
- Crowd level indicators (if data available)
- Station facility info (elevators, restrooms, lockers)

### Long-term
- AR navigation inside stations
- Integration with bus for last-mile
- Service disruption alerts with alternative routes

## TODO

- [ ] Integrate TDX API for real-time arrivals
- [ ] Add station exit map/diagram
- [ ] Implement fare matrix calculator
- [ ] Add first/last train times per line
- [ ] Show travel time between stations
- [ ] Add accessibility info (elevator locations)
- [ ] Implement dark mode
