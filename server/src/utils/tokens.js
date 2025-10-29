const jwt =require("jsonwebtoken");
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES } = require("../config/env");

// Firma un token de acceso
exports.signAccess = (payload) => {
    console.log("Firmando token de acceso con payload:", payload);
    return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES });
};
// Firma un token de refresco
exports.signRefresh = (payload) => {
    console.log("Firmando token de refresco con payload:", payload);
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES });
};
// Verifica un token de acceso
exports.verifyAccess = (token) => {
    try {
        return jwt.verify(token, JWT_ACCESS_SECRET);
    } catch (err) {
        console.error("Error al verificar token de acceso:", err.message);
        throw new Error("Token inválido o expirado");
    }
};
// Verifica un token de refresco
exports.verifyResfresh = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (err) {
        console.error("Error al verificar token de refresco:", err.message);
        throw new Error("Token inválido o expirado");
    }
};
