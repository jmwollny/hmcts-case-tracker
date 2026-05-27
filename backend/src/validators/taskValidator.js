const Joi = require('joi');

const createTaskSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title must not exceed 255 characters'
    }),
  description: Joi.string()
    .max(2000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description must not exceed 2000 characters'
    }),
  status: Joi.string()
    .valid('pending', 'in-progress', 'completed', 'cancelled')
    .default('pending')
    .messages({
      'any.only': 'Status must be one of: pending, in-progress, completed, cancelled'
    }),
  dueDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Due date must be a valid date'
    })
});

const updateTaskStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'in-progress', 'completed', 'cancelled')
    .required()
    .messages({
      'any.only': 'Status must be one of: pending, in-progress, completed, cancelled',
      'any.required': 'Status is required'
    })
});

const validateCreateTask = (data) => {
  return createTaskSchema.validate(data, { abortEarly: false });
};

const validateUpdateStatus = (data) => {
  return updateTaskStatusSchema.validate(data, { abortEarly: false });
};

module.exports = {
  validateCreateTask,
  validateUpdateStatus
};
