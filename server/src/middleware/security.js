const helmet = require("helmet");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));

module.exports = (app, origin) => {
    app.use(helmet());
    app.disable("x-powered-by");
    app.use(cors({ origin, credentials: true }));
    app.use(rateLimit( { windowMs: 15*60*1000, max: 100 } )); // Limita a 100 solicitudes cada 15 minutos
};