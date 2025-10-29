const Joi = require("joi");
module.exports = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly:false });
  if (error) return res.status(400).json({ error: "Validation failed", details: error.details });
  req.body = value; next();
};

