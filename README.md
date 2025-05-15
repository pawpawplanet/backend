# 寵物服務媒合平台 Backend Server

 **專案簡介**
本專案的目標為建立 **寵物服務媒合平台** 的後端測試系統。這個系統會基於 **Node.js + Express**，並使用 **PostgreSQL 作為資料庫**，透過 **Docker 容器** 部署 PostgreSQL，提供 API 服務，讓前端或其他應用程式串接。

REAME會介紹專案相關資訊並記錄建置的里程碑。


## 目錄 

- [專案架構](#-專案架構)
- [建置里程碑](#-建置里程碑)
- [開發環境設置](#-開發環境設置)
  - [1. 安裝必要工具](#1-安裝必要工具)
  - [2. 專案初始化](#2-專案初始化)
  - [3. 啟動開發環境](#3-啟動開發環境)
- [環境變數設定](#-環境變數設定)
- [資料庫](#資料庫migration)
- [API 文件](#-api-文件)
- [專案目錄結構](#-專案目錄結構)
- [指令列表](#-指令列表)

---

## 專案架構

本專案採用以下技術架構：

- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL（使用 Docker 容器)
- **ORM:** TypeORM
- **API 測試:** Postman
- **環境:** Docker

---

## 建置里程碑
1. Milestone 1 - Hello World from Node.js! : 使用Node.js 原生的 http 模組建立 API 伺服器 (Git tag: milestone1)
2. Milestone 2 - 安裝 Express web 應用程式框架，並以 Router() 處理路由、加入 middleware 處理異常狀態
---

## 開發環境設置

### **1. 安裝必要工具**

請確保您的環境已安裝以下工具：

- [Node.js](https://nodejs.org/)（建議版本：LTS）
- [Docker](https://www.docker.com/)

### **2. 專案初始化**

1. **Clone 專案**
   ```bash
   git clone https://github.com/pawpawplanet/backend.git
   ```
2. **建立 `.env` 檔案**（參考 [環境變數設定](#-環境變數設定))

### **3. 啟動開發環境**
1. **安裝套件**
    ```bash
   npm ci - 依據 package-lock.json 版本資訊安裝套件
   ```
2. **啟動 Backend Server**
   ```bash
   npm run dev - 啟動開發伺服器
   ```

3. **確認 API 伺服器是否啟動成功**（預設在 `http://localhost:PORT`）
    ```bash
   http://localhost:PORT/api/test/helloworld?receiver=輸入名字 - 在 Postman 收到 response 'Hello World to ${receiver}!' 
   ```

---

## 環境變數設定 

請參考.env.example，在專案根目錄建立 `.env` 檔案，並填入設定值 (.env包含機敏資料，預設已加入 .gitignore)： 

```env
PORT=...
...
```

---

## 資料庫 migration 

若專案中的 EntitySchema 調整了，可依據 migration file，更新(遷移)資料庫： 

1. **安裝套件**
   ```bash
   npm ci - 依據 package-lock.json 版本資訊安裝套件
   ```
2. **調整環境變數**
   ```env
   DB_SYNCHRONIZE=false... - 調整資料庫同步設定為 false
   ...
   ```
3. **migration**
   ```bash
   npm run typeorm:migrate
   ```
---

## API 文件 

本專案的 API 文件使用 Postman Collection** 提供，** 補上 **：

- [Postman Collection](#) 

---

## 專案目錄結構

```
📦 
├── 📂 src
│   ├── 📂 bin
|   |   |── www.js              # 伺服器啟動檔
|── |── 📂 config               # 設定檔目錄
|   |   |── index.js            # 設定檔管理器
|   |   |── web.js              # web 伺服器設定
|── |── 📂 middlewares          # 中介軟體
|   |   |── testMiddleWare.js   # 判斷參數是否正確填寫 (測試用)
|── |── 📂 routes               # 路由處理
|   |   |── testRoute.js        # 處理 /api/test/... 路由 (測試用)
│   ├── app.js                  # Express 應用程式主檔
│   └── ...
├── 📂 docs                     # API 文件
|── .env.example                # 環境變數設定檔案 .env 的參考檔案
├── package.json                # Node.js 依賴與指令
└── README.md                   # 本文件
```

---

## 指令列表 (**補上**)

| 指令 | 說明 |
|------|------|

---

### 聯絡方式** 
如果有任何問題或建議，歡迎聯繫開發團隊！ 

**Let's build a better pet service together!**