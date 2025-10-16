const Joi = require('joi');

/**
 * Validation middleware factory
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
const validate = (schema) => (req, res, next) => {
  const validSchema = {
    body: schema.body || Joi.object(),
    query: schema.query || Joi.object(),
    params: schema.params || Joi.object(),
  };

  const object = {
    body: req.body,
    query: req.query,
    params: req.params,
  };

  const { error, value } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(', ');
    return res.status(400).json({
      code: 400,
      message: 'Validation Error',
      details: errorMessage,
    });
  }

  Object.assign(req, value);
  return next();
};

/**
 * Common validation schemas
 */
const commonSchemas = {
  uuid: Joi.string().uuid(),
  email: Joi.string().email(),
  password: Joi.string().min(8).max(128),
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  },
};

module.exports = {
  validate,
  commonSchemas,
  Joi,
};
