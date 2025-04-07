# 寵物服務媒合平台 Backend Server

 **專案簡介**
本專案的目標為建立 **寵物服務媒合平台** 的後端測試系統。這個系統會基於 **Node.js + Express**，並使用 **PostgreSQL 作為資料庫**，透過 **Docker 容器** 部署 PostgreSQL，提供 API 服務，讓前端或其他應用程式串接。

REAME會介紹專案相關資訊並記錄建置的里程碑。


## 開發指令
- step1 : `docker-compose up -d` 使用docker-compose.yml這個建立Postgre SQL
- step2 : `docker ps` 檢查是否建立成功
![alt text](image.png)
- step3 : `docker exec -it pawpawplant-backend-postgres-1 psql -U testHexschool -d test` - 進入Postgre SQL container 
- step4 : 在test資料庫中建立資料表
  ```
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,       
        name VARCHAR(100) NOT NULL,     
        email VARCHAR(100) UNIQUE NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  ``` 
- step5 : 新增資料
 ```
  INSERT INTO users (name, email) 
  VALUES ('John', 'john@example.com'),
       ('Jane', 'jane@example.com');
 ```
- step6 : `node .\server.js` - 啟動開發伺服器

- step7 : 使用Postman 測試API
- 如果需要將資料庫倒出到本地端，可以使用以下指令:
`docker exec -it pawpawplant-backend-postgres-1 pg_dump -U testHexschool -d test -f /var/lib/postgresql/ data/test_dump.sql`

### 聯絡方式** 
如果有任何問題或建議，歡迎聯繫開發團隊！ 

**Let's build a better pet service together!**