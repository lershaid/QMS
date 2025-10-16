const Joi = require('joi');

/**
 * Input validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {String} property - req property to validate (body, query, params)
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        code: 400,
        message: 'Validation failed',
        errors,
      });
    }

    // Replace request data with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * Common validation schemas
 */
const schemas = {
  register: Joi.object({
    tenantId: Joi.string().uuid().required(),
    email: Joi.string().email().max(255).required(),
    password: Joi.string().min(8).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      }),
    firstName: Joi.string().min(1).max(100).required()
      .pattern(/^[a-zA-Z\s'-]+$/)
      .messages({
        'string.pattern.base': 'First name can only contain letters, spaces, hyphens and apostrophes',
      }),
    lastName: Joi.string().min(1).max(100).required()
      .pattern(/^[a-zA-Z\s'-]+$/)
      .messages({
        'string.pattern.base': 'Last name can only contain letters, spaces, hyphens and apostrophes',
      }),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  updateUser: Joi.object({
    firstName: Joi.string().min(1).max(100)
      .pattern(/^[a-zA-Z\s'-]+$/),
    lastName: Joi.string().min(1).max(100)
      .pattern(/^[a-zA-Z\s'-]+$/),
    email: Joi.string().email().max(255),
    isActive: Joi.boolean(),
  }).min(1), // At least one field must be provided

  uuid: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};

module.exports = {
  validate,
  schemas,
};
