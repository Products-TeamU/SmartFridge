import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: ['com', 'ru', 'рф', 'net', 'org', 'by', 'kz', 'ua'] } })
    .trim()
    .required()
    .messages({
      'string.email': 'Некорректный email или неподдерживаемый домен',
      'any.required': 'Email обязателен',
    }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Пароль должен быть не менее 6 символов',
    'any.required': 'Пароль обязателен',
  }),
  name: Joi.string().min(2).required().messages({
    'string.min': 'Имя должно быть не менее 2 символов',
    'any.required': 'Имя обязательно',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: ['com', 'ru', 'рф', 'net', 'org', 'by', 'kz', 'ua'] } })
    .trim()
    .required()
    .messages({
      'string.email': 'Некорректный email или неподдерживаемый домен',
      'any.required': 'Email обязателен',
    }),
  password: Joi.string().required().messages({
    'any.required': 'Пароль обязателен',
  }),
});