import Joi from 'joi';

export const productSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Название обязательно',
    'string.empty': 'Название обязательно',
  }),
  quantity: Joi.number().positive().required().messages({
    'any.required': 'Количество обязательно',
    'number.base': 'Количество должно быть числом',
    'number.positive': 'Количество должно быть больше 0',
  }),
  unit: Joi.string().trim().required().messages({
    'any.required': 'Единица измерения обязательна',
    'string.empty': 'Единица измерения обязательна',
  }),
  expiryDate: Joi.date().required().messages({
    'any.required': 'Срок годности обязателен',
  }),
  category: Joi.string().allow('', null).optional(),
  price: Joi.number().min(0).optional(),
  ownerType: Joi.string().valid('personal', 'family').required().messages({
    'any.required': 'Тип владельца обязателен',
  }),
  ownerId: Joi.string().required().messages({
    'any.required': 'ID владельца обязателен',
    'string.empty': 'ID владельца обязателен',
  }),
});

export const productUpdateSchema = Joi.object({
  name: Joi.string().trim().optional(),
  quantity: Joi.number().positive().optional().messages({
    'number.base': 'Количество должно быть числом',
    'number.positive': 'Количество должно быть больше 0',
  }),
  unit: Joi.string().trim().optional(),
  expiryDate: Joi.date().optional(),
  category: Joi.string().allow('', null).optional(),
  price: Joi.number().min(0).optional(),
}).min(1);