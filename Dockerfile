FROM node:20-alpine3.19

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . . 

CMD ["node", "src/bin/www.js"]
