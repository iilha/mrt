[English](README.md) | 繁體中文

# Taiwan MRT

互動式捷運站地圖，支援台灣全部 4 個捷運系統，具備即時定位追蹤與雙語介面。

## 功能特色

- **4 個捷運系統**：台北 TRTC、高雄 KRTC、桃園 TYMC、台中 TMRT
- **167+ 車站**：所有車站內建座標資料（無需外部 API）
- **路線篩選**：依捷運路線篩選（例如：台北紅線、高雄環狀輕軌）
- **搜尋**：以中英文站名搜尋車站
- **定位**：將地圖中心移至使用者目前位置
- **雙語**：切換中英文介面（自動偵測瀏覽器語言）
- **PWA**：可安裝為獨立 app，支援離線使用
- **響應式設計**：桌面版側邊面板、行動版底部拖曳面板

## 技術架構

- **HTML5/CSS3/JavaScript**：全部內嵌，無需建置系統
- **Leaflet 1.9.4**：互動式地圖，含標記與彈出視窗
- **OpenStreetMap**：免費地圖圖磚（無需 API key）
- **Service Worker**：離線快取、PWA 安裝
- **localStorage**：持久化語言與系統選擇

## 快速開始

```bash
# 啟動本地伺服器
python3 -m http.server 8003

# 開啟瀏覽器
open http://localhost:8003
```

無需 npm install，無需建置指令。直接提供靜態檔案即可。

## 專案結構

```
mrt/
├── index.html          # 主程式（1126 行，all-in-one）
├── manifest.webapp     # PWA manifest
├── sw.js               # Service worker
├── js/
│   └── bottom-sheet.js # 行動版底部面板元件
├── img/                # 圖示（32px 至 512px）
├── android/            # Android 原生建置（Capacitor）
├── ios/                # iOS 原生建置（Capacitor）
└── tests/              # Playwright e2e 測試
```

## 資料

所有車站資料內嵌於 `index.html` 作為靜態 JSON：
- 車站座標（經緯度）
- 站名（中英文）
- 路線代碼與顏色
- 系統詮釋資料（中心點、縮放層級）

無需呼叫外部 API 取得車站資料。

## 捷運系統

| 系統 | 代碼 | 路線 | 車站數 |
|--------|------|-------|----------|
| 台北捷運 | TRTC | BR, R, G, O, BL, Y, LG | 130+ |
| 高雄捷運 | KRTC | KR, KO, KC | 40+ |
| 桃園捷運 | TYMC | A | 21 |
| 台中捷運 | TMRT | TG | 18 |

特色路線：
- **LG**：安坑輕軌（台北）
- **KC**：高雄環狀輕軌（37 站）

## 原生建置

使用 Capacitor WebView 包裝器建置 Android 與 iOS。

**Android**：`tw.pwa.mrt`
- 建置：`cd android && ./gradlew assembleDebug`
- 同步網頁：`./android/sync-web.sh`

**iOS**：`tw.pwa.mrt`
- 建置：在 Xcode 開啟 `ios/Mrt/Mrt.xcodeproj`
- 同步網頁：`./ios/sync-web.sh`

## 測試

使用 Playwright 進行 E2E 測試：

```bash
# 安裝相依套件
npm install

# 執行測試（headless）
npm test

# 執行測試（headed）
npm run test:headed
```

測試會自動在 port 8003 啟動 Python 伺服器。

## 開發

所有程式碼內嵌於 `index.html`：
- **CSS**：`<style>` 標籤（400+ 行）
- **JavaScript**：`<script>` 標籤（700+ 行）
- **資料**：內嵌 JSON 物件

外部相依套件透過 CDN 載入：
- Leaflet 1.9.4 (unpkg.com)
- OpenStreetMap tiles

## 部署

靜態網站託管於 GitHub Pages。透過推送至 `gh-pages` 分支進行部署。

## 授權

MIT
