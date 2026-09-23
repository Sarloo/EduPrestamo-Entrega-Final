const express = require('express');
const { AppError } = require('../errors');
const { transaction } = require('../db');
const { now } = require('../users');
const validate = require('../validation');

const MATERIAL_REQUEST_SELECT = `
  SELECT
    mr.*,
    requester.name AS user_name,
    requester.email AS user_email,
    reviewer.name AS reviewer_name,
    resource.code AS resource_code,
    resource.name AS resource_name
  FROM material_requests mr
  JOIN users requester ON requester.id = mr.user_id
  LEFT JOIN users reviewer ON reviewer.id = mr.reviewed_by
  LEFT JOIN resources resource ON resource.id = mr.resource_id
`;

function materialRequestDto(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    quantity: row.quantity,
    justification: row.justification,
    status: row.status,
    requestedAt: row.requested_at,
    reviewedAt: row.reviewed_at,
    rejectionReason: row.rejection_reason,
    updatedAt: row.updated_at,
    user: { id: row.user_id, name: row.user_name, email: row.user_email },
    reviewedBy: row.reviewed_by
      ? { id: row.reviewed_by, name: row.reviewer_name }
      : null,
    resource: row.resource_id
      ? { id: row.resource_id, code: row.resource_code, name: row.resource_name }
      : null,
  };
}

function getMaterialRequest(db, requestId) {
  return db.prepare(`${MATERIAL_REQUEST_SELECT} WHERE mr.id = ?`).get(requestId);
}

function ensurePending(row) {
  if (!row) {
    throw new AppError(404, 'MATERIAL_REQUEST_NOT_FOUND', 'La solicitud de material no existe.');
  }
  if (row.status !== 'PENDING') {
    throw new AppError(
      409,
      'INVALID_TRANSITION',
      'Solo se puede atender una solicitud de material pendiente.',
    );
  }
}

function requestedStatus(value) {
  const status = validate.requiredString(value, 'status', { min: 3, max: 20 }).toUpperCase();
  if (!['PENDING', 'FULFILLED', 'REJECTED', 'CANCELLED'].includes(status)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Estado de solicitud de material inválido.');
  }
  return status;
}

function materialRequestRoutes({ db, authenticate, authorize }) {
  const router = express.Router();
  router.use(authenticate);

  router.get('/', (req, res) => {
    const conditions = [];
    const parameters = [];
    if (req.user.role !== 'ADMIN') {
      conditions.push('mr.user_id = ?');
      parameters.push(req.user.id);
    }
    if (req.query.status !== undefined) {
      conditions.push('mr.status = ?');
      parameters.push(requestedStatus(req.query.status));
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = db.prepare(`
      ${MATERIAL_REQUEST_SELECT}
      ${where}
      ORDER BY mr.requested_at DESC, mr.id DESC
    `).all(...parameters);
    res.json({ data: rows.map(materialRequestDto) });
  });

  router.post('/', authorize('USER'), (req, res) => {
    const name = validate.requiredString(req.body?.name, 'name', { min: 2, max: 120 });
    const category = validate.requiredString(
      req.body?.category,
      'category',
      { min: 2, max: 80 },
    );
    const quantity = validate.positiveInteger(req.body?.quantity, 'quantity');
    const justification = validate.requiredString(
      req.body?.justification,
      'justification',
      { min: 5, max: 500 },
    );
    const duplicate = db.prepare(`
      SELECT id FROM material_requests
      WHERE user_id = ? AND status = 'PENDING' AND name = ? COLLATE NOCASE
    `).get(req.user.id, name);
    if (duplicate) {
      throw new AppError(
        409,
        'MATERIAL_REQUEST_PENDING',
        'Ya tienes una solicitud pendiente para ese material.',
      );
    }
    const timestamp = now();
    const result = db.prepare(`
      INSERT INTO material_requests (
        user_id, name, category, quantity, justification, requested_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, name, category, quantity, justification, timestamp, timestamp);
    const row = getMaterialRequest(db, Number(result.lastInsertRowid));
    res.status(201).json({ data: materialRequestDto(row) });
  });

  router.patch('/:id/cancel', authorize('USER'), (req, res) => {
    const requestId = validate.id(req.params.id);
    const row = getMaterialRequest(db, requestId);
    if (!row || row.user_id !== req.user.id) {
      throw new AppError(404, 'MATERIAL_REQUEST_NOT_FOUND', 'La solicitud de material no existe.');
    }
    ensurePending(row);
    db.prepare(`
      UPDATE material_requests SET status = 'CANCELLED', updated_at = ? WHERE id = ?
    `).run(now(), requestId);
    res.json({
      message: 'Solicitud de material cancelada.',
      data: materialRequestDto(getMaterialRequest(db, requestId)),
    });
  });

  router.patch('/:id/reject', authorize('ADMIN'), (req, res) => {
    const requestId = validate.id(req.params.id);
    const row = getMaterialRequest(db, requestId);
    ensurePending(row);
    const reason = validate.requiredString(req.body?.reason, 'reason', { min: 3, max: 500 });
    const timestamp = now();
    db.prepare(`
      UPDATE material_requests
      SET status = 'REJECTED', reviewed_by = ?, reviewed_at = ?,
          rejection_reason = ?, updated_at = ?
      WHERE id = ?
    `).run(req.user.id, timestamp, reason, timestamp, requestId);
    res.json({
      message: 'Solicitud de material rechazada.',
      data: materialRequestDto(getMaterialRequest(db, requestId)),
    });
  });

  router.post('/:id/fulfill', authorize('ADMIN'), (req, res) => {
    const requestId = validate.id(req.params.id);
    const code = validate
      .requiredString(req.body?.code, 'code', { min: 2, max: 30 })
      .toUpperCase();
    const name = validate.requiredString(req.body?.name, 'name', { min: 2, max: 120 });
    const description = validate.optionalString(
      req.body?.description,
      'description',
      { max: 500 },
    ) ?? '';
    const category = validate.requiredString(
      req.body?.category,
      'category',
      { min: 2, max: 80 },
    );
    const condition = validate.condition(req.body?.condition);
    const quantityTotal = validate.positiveInteger(
      req.body?.quantityTotal,
      'quantityTotal',
      { allowZero: true },
    );

    transaction(db, () => {
      const materialRequest = db.prepare(
        'SELECT * FROM material_requests WHERE id = ?',
      ).get(requestId);
      ensurePending(materialRequest);
      const timestamp = now();
      let resourceResult;
      try {
        resourceResult = db.prepare(`
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
          throw new AppError(409, 'RESOURCE_CODE_IN_USE', 'El código del recurso ya existe.');
        }
        throw error;
      }
      db.prepare(`
        UPDATE material_requests
        SET status = 'FULFILLED', reviewed_by = ?, reviewed_at = ?,
            resource_id = ?, updated_at = ?
        WHERE id = ?
      `).run(
        req.user.id,
        timestamp,
        Number(resourceResult.lastInsertRowid),
        timestamp,
        requestId,
      );
    });

    res.status(201).json({
      message: 'El material fue agregado al catálogo.',
      data: materialRequestDto(getMaterialRequest(db, requestId)),
    });
  });

  return router;
}

module.exports = { materialRequestDto, materialRequestRoutes };
