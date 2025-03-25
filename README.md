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
- [API 文件](#-api-文件)
- [專案目錄結構](#-專案目錄結構)
- [指令列表](#-指令列表)

---

## 專案架構

本專案採用以下技術架構：

- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL（使用 Docker 容器
- **ORM:** TypeORM
- **API 測試:** Postman
- **開發環境:** Docker

---

## 建置里程碑
1. Milestone 1 - Hello World from Node.js! : 使用Node.js 原生的 http 模組建立 API 伺服器 (Git tag: milestone1)
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

1. **啟動 Backend Server**
   ```bash
   npm run dev - 啟動開發伺服器
   ```

2. **確認 API 伺服器是否啟動成功**（預設在 `http://localhost:3000`） 

---

## 環境變數設定 

請在專案根目錄建立 `.env` 檔案，並填入設定值 (.env包含機敏資料，預設已加入 .gitignore)： 

```env
** 補上 **
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
│   ├── server.js      # 伺服器啟動檔
│   └── ...
├── 📂 docs            # API 文件
├── package.json       # Node.js 依賴與指令
└── README.md          # 本文件
```

---

## 指令列表 (**補上**)

| 指令 | 說明 |
|------|------|

---

### 聯絡方式** 
如果有任何問題或建議，歡迎聯繫開發團隊！ 

**Let's build a better pet service together!**