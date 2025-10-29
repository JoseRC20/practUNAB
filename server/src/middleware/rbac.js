module.exports = function allow(...roles) {
  return (req, res, next) => {
    console.log("RBAC - Roles permitidos:", roles);
    console.log("RBAC - Rol del usuario:", req.user ? req.user.role : "No autenticado");
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden" });
    next();
  };
};