const { verifyAccess } = require("../utils/tokens");

module.exports = function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) {
    console.error("Token no proporcionado");
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    console.log("Token recibido:", token);
    const decoded = verifyAccess(token);
    console.log("Payload decodificado:", decoded);
    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    console.error("Error al verificar el token:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  console.log("Middleware auth completado, llamando a next()");
  console.log("req.user en /api/practices:", req.user);
};