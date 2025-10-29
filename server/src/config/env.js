require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const fromParts = process.env.DB_USER && process.env.DB_PASS && process.env.DB_HOST && process.env.DB_NAME;

const safePassword = process.env.DB_PASS ? encodeURIComponent(process.env.DB_PASS) : "";

const MONGODB_URI = process.env.MONGODB_URI
  || (fromParts
      ? `mongodb+srv://${process.env.DB_USER}:${safePassword}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=${process.env.APP_NAME || "App"}`
      : "");

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  MONGODB_URI,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "dev-secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "dev-refresh",
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "15m",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",
};