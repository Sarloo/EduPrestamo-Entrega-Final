const express = require('express');
const { AppError } = require('../errors');
const { now } = require('../users');
const validate = require('../validation');

function resourceDto(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    category: row.category,
    condition: row.condition,
    quantityTotal: row.quantity_total,
    quantityAvailable: row.quantity_available,
    quantityOnLoan: row.quantity_total - row.quantity_available,
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function resourceRoutes({ db, authenticate, authorize }) {
  const router = express.Router();
  router.use(authenticate);

  router.get('/', (req, res) => {
    const conditions = [];
    const parameters = [];
    const includeInactive =
      req.user.role === 'ADMIN' &&
      req.query.includeInactive !== undefined &&
      validate.boolean(req.query.includeInactive, 'includeInactive');

    if (!includeInactive) conditions.push('active = 1');
    if (req.query.category !== undefined) {
      conditions.push('category = ? COLLATE NOCASE');
      parameters.push(
        validate.requiredString(req.query.category, 'category', { min: 1, max: 80 }),
      );
    }
    if (req.query.search !== undefined) {
      const search = validate.requiredString(req.query.search, 'search', { min: 1, max: 100 });
      conditions.push(`(
        code LIKE ? ESCAPE '\\' OR name LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\'
      )`);
      const escaped = search.replace(/[\\%_]/g, '\\$&');
      parameters.push(`%${escaped}%`, `%${escaped}%`, `%${escaped}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = db
      .prepare(`SELECT * FROM resources ${where} ORDER BY name COLLATE NOCASE, id`)
      .all(...parameters);
    res.json({ data: rows.map(resourceDto) });
  });

  router.get('/:id', (req, res) => {
    const resourceId = validate.id(req.params.id);
    const row = db.prepare('SELECT * FROM resources WHERE id = ?').get(resourceId);
    if (!row || (!row.active && req.user.role !== 'ADMIN')) {
      throw new AppError(404, 'RESOURCE_NOT_FOUND', 'El recurso no existe.');
    }
    res.json({ data: resourceDto(row) });
  });

  router.post('/', authorize('ADMIN'), (req, res) => {
    const code = validate
      .requiredString(req.body?.code, 'code', { min: 2, max: 30 })
      .toUpperCase();
    const name = validate.requiredString(req.body?.name, 'name', { min: 2, max: 120 });
    const description = validate.optionalString(req.body?.description, 'description', { max: 500 }) ?? '';
    const category = validate.requiredString(req.body?.category, 'category', { min: 2, max: 80 });
    const condition = validate.condition(req.body?.condition);
    const quantityTotal = validate.positiveInteger(req.body?.quantityTotal, 'quantityTotal', {
      allowZero: true,
    });
    const timestamp = now();
    let result;
    try {
      result = db.prepare(`
        INSERT INTO resources (
          code, name, description, category, condition, quantity_total,
          quantity_available, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        code,
        name,
        description,
        category,
        condition,
        quantityTotal,
        quantityTotal,
        timestamp,
        timestamp,
      );
    } catch (error) {
      if (error.errcode === 2067) {
        throw new AppError(409, 'RESOURCE_CODE_IN_USE', 'El codigo del recurso ya existe.');
      }
      throw error;
    }
    const row = db
      .prepare('SELECT * FROM resources WHERE id = ?')
      .get(Number(result.lastInsertRowid));
    res.status(201).json({ data: resourceDto(row) });
  });

  function updateResource(req, res) {
    const resourceId = validate.id(req.params.id);
    const current = db.prepare('SELECT * FROM resources WHERE id = ?').get(resourceId);
    if (!current) throw new AppError(404, 'RESOURCE_NOT_FOUND', 'El recurso no existe.');

    const supplied = ['code', 'name', 'description', 'category', 'condition', 'quantityTotal'].filter(
      (field) => req.body?.[field] !== undefined,
    );
    if (supplied.length === 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Debe proporcionar al menos un campo.');
    }

    const code =
      req.body.code === undefined
        ? current.code
        : validate.requiredString(req.body.code, 'code', { min: 2, max: 30 }).toUpperCase();
    const name =
      req.body.name === undefined
        ? current.name
        : validate.requiredString(req.body.name, 'name', { min: 2, max: 120 });
    const description =
      req.body.description === undefined
        ? current.description
        : validate.optionalString(req.body.description, 'description', { max: 500 }) ?? '';
    const category =
      req.body.category === undefined
        ? current.category
        : validate.requiredString(req.body.category, 'category', { min: 2, max: 80 });
    const condition =
      req.body.condition === undefined
        ? current.condition
        : validate.condition(req.body.condition);
    const quantityTotal =
      req.body.quantityTotal === undefined
        ? current.quantity_total
        : validate.positiveInteger(req.body.quantityTotal, 'quantityTotal', { allowZero: true });
    const quantityOnLoan = current.quantity_total - current.quantity_available;
    if (quantityTotal < quantityOnLoan) {
      throw new AppError(
        409,
        'QUANTITY_IN_USE',
        `No puede reducir el total por debajo de ${quantityOnLoan} unidades prestadas.`,
      );
    }
    const quantityAvailable = quantityTotal - quantityOnLoan;
    try {
      db.prepare(`
        UPDATE resources
        SET code = ?, name = ?, description = ?, category = ?, condition = ?,
            quantity_total = ?, quantity_available = ?, updated_at = ?
        WHERE id = ?
      `).run(
        code,
        name,
        description,
        category,
        condition,
        quantityTotal,
        quantityAvailable,
        now(),
        resourceId,
      );
    } catch (error) {
      if (error.errcode === 2067) {
        throw new AppError(409, 'RESOURCE_CODE_IN_USE', 'El codigo del recurso ya existe.');
      }
      throw error;
    }
    res.json({ data: resourceDto(db.prepare('SELECT * FROM resources WHERE id = ?').get(resourceId)) });
  }

  router.put('/:id', authorize('ADMIN'), updateResource);
  router.patch('/:id', authorize('ADMIN'), updateResource);

  router.delete('/:id', authorize('ADMIN'), (req, res) => {
    const resourceId = validate.id(req.params.id);
    const current = db.prepare('SELECT * FROM resources WHERE id = ?').get(resourceId);
    if (!current) throw new AppError(404, 'RESOURCE_NOT_FOUND', 'El recurso no existe.');
    const activeLoans = db.prepare(`
      SELECT COUNT(*) AS total FROM loans
      WHERE resource_id = ? AND status IN ('APPROVED', 'DELIVERED')
    `).get(resourceId).total;
    if (activeLoans > 0) {
      throw new AppError(
        409,
        'RESOURCE_IN_USE',
        'No puede dar de baja un recurso con prestamos activos.',
      );
    }
    db.prepare('UPDATE resources SET active = 0, updated_at = ? WHERE id = ?').run(
      now(),
      resourceId,
    );
    res.json({ message: 'Recurso dado de baja.', data: resourceDto({ ...current, active: 0 }) });
  });

  return router;
}

module.exports = { resourceDto, resourceRoutes };
