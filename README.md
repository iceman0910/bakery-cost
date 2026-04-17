# 🥐 烘焙成本計算

React + Firebase Firestore 烘焙成本管理工具，支援手機與電腦。

## 功能

- **原料食材**：記錄進貨量、單位（kg/g/cc/個）、進貨價格，自動計算每g單價
- **備料食材**：組合原料配方（麵糰、餡料等），計算每g食材成本
- **成品成本**：組合原料＋備料，輸入售價推算毛利率，或依目標毛利率反推建議售價
- 每頁都有搜尋功能，支援新增、編輯、刪除

## 設定步驟

### 1. 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 新增專案
3. 在「建構」→「Firestore Database」中建立資料庫（選擇測試模式）
4. 在「專案設定」→「您的應用程式」中新增 Web 應用程式，複製設定資訊

### 2. 填入 Firebase 設定

編輯 `src/lib/firebase.js`，將設定換成你的專案資訊：

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  ...
}
```

### 3. 部署到 GitHub Pages

1. 建立 GitHub repo（例如 `bakery-cost`）
2. 推送程式碼到 `main` branch
3. 在 repo 設定 → Pages → Source 選擇「GitHub Actions」
4. 推送後自動 build + deploy，約 1～2 分鐘完成

網址會是：`https://你的帳號.github.io/bakery-cost/`

## 本地開發

```bash
npm install
npm run dev
```

## 專案結構

```
src/
  lib/
    firebase.js     # Firebase 設定
    calc.js         # 成本計算邏輯
  hooks/
    useCollection.js  # Firestore CRUD hook
  components/
    UI.jsx          # 共用元件
  pages/
    RawPage.jsx     # 原料食材
    PrepPage.jsx    # 備料食材
    FinishedPage.jsx # 成品成本
  App.jsx
  index.css
```
