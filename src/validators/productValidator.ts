import Joi from 'joi';

export const productSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'any.required': 'Название обязательно',
  }),
  quantity: Joi.number().positive().required().messages({
    'number.positive': 'Количество должно быть положительным числом',
    'any.required': 'Количество обязательно',
  }),
  unit: Joi.string().valid('шт', 'кг', 'л', 'г', 'мл', 'уп').required().messages({
    'any.only': 'Единица измерения должна быть одной из: шт, кг, л, г, мл, уп',
    'any.required': 'Единица измерения обязательна',
  }),
  expiryDate: Joi.date().iso().required().messages({
    'date.iso': 'Срок годности должен быть в формате ГГГГ-ММ-ДД',
    'any.required': 'Срок годности обязателен',
  }),
  category: Joi.string().trim().optional().allow(''),
  price: Joi.number().positive().optional().messages({
    'number.positive': 'Цена должна быть положительным числом',
  }),
});