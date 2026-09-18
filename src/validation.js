const { AppError } = require('./errors');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function validationError(details) {
  throw new AppError(400, 'VALIDATION_ERROR', 'Los datos enviados no son validos.', details);
}

function requiredString(value, field, options = {}) {
  const { min = 1, max = 255 } = options;
  if (typeof value !== 'string') validationError({ [field]: 'Debe ser texto.' });
  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) {
    validationError({ [field]: `Debe contener entre ${min} y ${max} caracteres.` });
  }
  return normalized;
}

function optionalString(value, field, options = {}) {
  if (value === undefined || value === null) return undefined;
  return requiredString(value, field, { min: 0, ...options });
}

function email(value) {
  const normalized = requiredString(value, 'email', { min: 5, max: 254 }).toLowerCase();
  if (!EMAIL_PATTERN.test(normalized)) validationError({ email: 'Formato de correo invalido.' });
  return normalized;
}

function password(value) {
  const normalized = requiredString(value, 'password', { min: 8, max: 72 });
  if (!/[a-z]/.test(normalized) || !/[A-Z]/.test(normalized) || !/\d/.test(normalized)) {
    validationError({
      password: 'Debe incluir al menos una mayuscula, una minuscula y un numero.',
    });
  }
  return normalized;
}

function positiveInteger(value, field, options = {}) {
  const { allowZero = false } = options;
  const number = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
  const minimum = allowZero ? 0 : 1;
  if (!Number.isSafeInteger(number) || number < minimum) {
    validationError({ [field]: `Debe ser un entero mayor o igual a ${minimum}.` });
  }
  return number;
}

function id(value, field = 'id') {
  return positiveInteger(value, field);
}

function role(value) {
  if (!['ADMIN', 'USER'].includes(value)) {
    validationError({ role: 'Debe ser ADMIN o USER.' });
  }
  return value;
}

function status(value) {
  const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'DELIVERED', 'RETURNED', 'CANCELLED'];
  if (!statuses.includes(value)) validationError({ status: 'Estado de prestamo invalido.' });
  return value;
}

function condition(value) {
  if (!['GOOD', 'FAIR', 'DAMAGED'].includes(value)) {
    validationError({ condition: 'Debe ser GOOD, FAIR o DAMAGED.' });
  }
  return value;
}

function date(value, field, options = {}) {
  if (value === undefined || value === null || value === '') {
    if (options.optional) return undefined;
    validationError({ [field]: 'La fecha es obligatoria.' });
  }
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    validationError({ [field]: 'Use el formato YYYY-MM-DD.' });
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    validationError({ [field]: 'La fecha no existe.' });
  }
  return value;
}

function boolean(value, field) {
  if (value === true || value === false) return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  validationError({ [field]: 'Debe ser verdadero o falso.' });
}

module.exports = {
  boolean,
  condition,
  date,
  email,
  id,
  optionalString,
  password,
  positiveInteger,
  requiredString,
  role,
  status,
};
