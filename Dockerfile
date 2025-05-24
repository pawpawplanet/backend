FROM node:20-alpine3.19

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . . 

# 確保 start.sh 有執行權限
RUN chmod +x ./start.sh

# 安裝 netcat 用於檢查 DB 是否連線
RUN apk add --no-cache netcat-openbsd

# 容器啟動時執行腳本
CMD ["sh", "./start.sh"]
