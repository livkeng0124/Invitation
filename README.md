# 邀請卡製作器

這是一個純靜態網頁，可以直接放在 GitHub Pages 免費公開使用。使用者能建立邀請卡、選擇五種風格、填入活動日期與三個可參加時間，並產生可複製、Email 寄送或 LINE 分享的邀請連結。受邀者可以在卡片上直接點選可參加時間，或點選「已有安排，無法參加」。

## 放到 GitHub Pages

1. 建立一個 GitHub repository。
2. 上傳 `index.html`、`styles.css`、`script.js`、`README.md` 和 `assets` 資料夾。
3. 到 repository 的 `Settings` > `Pages`。
4. 在 `Build and deployment` 選擇 `Deploy from a branch`。
5. Branch 選 `main`，資料夾選 `/root`，儲存後等待 GitHub 產生網址。

## 回覆方式

GitHub Pages 是靜態網站，沒有資料庫或後端，所以受邀者按下回覆後，網站會開啟一封已填好內容的 Email，寄給製卡時填入的回覆 Email。

如果之後需要自動收集回覆統計，可以再接 Google Forms、Apps Script、Formspree 或自己的後端 API。

## 分享注意

在本機直接打開 `index.html` 時，產生的連結會是本機檔案路徑，只適合自己測試。正式分享給朋友前，請先部署到 GitHub Pages，或在表單的「公開網站網址」欄位填入你的 GitHub Pages 網址後再生成邀請卡連結。
