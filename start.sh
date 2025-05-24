#!/bin/sh

echo "Container started..."

# 預設 DB 設定，可透過環境變數覆蓋 (${VAR:-default}：表示「如果環境變數 VAR 沒有值，就使用 default」)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

MAX_RETRIES=30
RETRY_COUNT=0

echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."

# 使用 nc（netcat）來檢查 $DB_HOST:$DB_PORT 是否能成功連線（是否開啟了 port）。如果無法連線就持續重試。
while ! nc -z $DB_HOST $DB_PORT; do
  RETRY_COUNT=$((RETRY_COUNT+1))
  # 如果重試次數達到上限，輸出錯誤訊息並終止腳本（exit 1 表示異常終止）。
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "Could not connect to PostgreSQL after $MAX_RETRIES attempts."
    exit 1
  fi
  # 示目前第幾次等待，然後暫停 2 秒，準備下一輪重試。
  echo "Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done

echo "PostgreSQL is up!"

# 是否執行 migration
if [ "$RUN_MIGRATION" = "true" ]; then
  echo "RUN_MIGRATION=true → Running migrations..."
  npm run typeorm:migrate
else
  echo "RUN_MIGRATION not true → Skipping migrations..."
fi

# 啟動應用
echo "Starting app..."
node src/bin/www.js