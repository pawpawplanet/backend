const { Client } = require("pg");

const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || "testHexschool",
    password: process.env.DB_PASSWORD || "pgStartkit4test",
    database: process.env.DB_DATABASE || "test",
});

client.connect()
    .then(() => console.log("PostgreSQL 連接成功"))
    .catch(err => console.error("PostgreSQL 連接失敗", err));

module.exports = client;