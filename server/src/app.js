const express = require("express");
const morgan = require("morgan");
const cors = require("cors"); // Import cors
const { CORS_ORIGIN } = require("./config/env");
const mountSecurity = require("./middleware/security");
const routes = require("./routes");
const errorHandler = require("./middleware/error");


const app = express(); // Initialize app before using it


app.use(cors({ origin: 'http://localhost:5173' }));

app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));


mountSecurity(app, CORS_ORIGIN);
app.use("/api", routes);
app.use(errorHandler);

app.use((req, res, next) => {
    console.log(`Solicitud recibida: ${req.method} ${req.url}`);
    next();
});

module.exports = app;