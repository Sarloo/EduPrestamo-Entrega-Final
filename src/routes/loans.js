const express = require('express');
const { AppError } = require('../errors');
const { transaction } = require('../db');
const { now } = require('../users');
const validate = require('../validation');

const LOAN_SELECT = `
  SELECT
    l.*,
    u.name AS user_name,
    u.email AS user_email,
    r.name AS resource_name,
    r.category AS resource_category,
    reviewer.name AS reviewer_name
  FROM loans l
  JOIN users u ON u.id = l.user_id
  JOIN resources r ON r.id = l.resource_id
  LEFT JOIN users reviewer ON reviewer.id = l.reviewed_by
`;

function loanDto(row) {
  return {
    id: row.id,
    quantity: row.quantity,
    purpose: row.purpose,
    status: row.status,
    dueDate: row.due_date,
    rejectionReason: row.rejection_reason,
    notes: row.notes,
    requestedAt: row.requested_at,
    reviewedAt: row.reviewed_at,
    deliveredAt: row.delivered_at,
    returnedAt: row.returned_at,
    updatedAt: row.updated_at,
    user: { id: row.user_id, name: row.user_name, email: row.user_email },
    resource: {
      id: row.resource_id,
      name: row.resource_name,
      category: row.resource_category,
    },
    reviewedBy: row.reviewed_by
      ? { id: row.reviewed_by, name: row.reviewer_name }
      : null,
  };
}

function getLoan(db, loanId) {
  return db.prepare(`${LOAN_SELECT} WHERE l.id = ?`).get(loanId);
}

function ensureVisibleLoan(req, row) {
  if (!row || (req.user.role !== 'ADMIN' && row.user_id !== req.user.id)) {
    throw new AppError(404, 'LOAN_NOT_FOUND', 'La solicitud no existe.');
  }
}

function loanRoutes({ db, authenticate, authorize }) {
  const router = express.Router();
  router.use(authenticate);

  router.get('/', (req, res) => {
    const conditions = [];
    const parameters = [];
    if (req.user.role !== 'ADMIN') {
      conditions.push('l.user_id = ?');
      parameters.push(req.user.id);
    } else if (req.query.userId !== undefined) {
      conditions.push('l.user_id = ?');
      parameters.push(validate.id(req.query.userId, 'userId'));
    }
    if (req.query.resourceId !== undefined) {
      conditions.push('l.resource_id = ?');
      parameters.push(validate.id(req.query.resourceId, 'resourceId'));
    }
    if (req.query.status !== undefined) {
      conditions.push('l.status = ?');
      parameters.push(validate.status(req.query.status));
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = db
      .prepare(`${LOAN_SELECT} ${where} ORDER BY l.requested_at DESC, l.id DESC`)
      .all(...parameters);
    res.json({ data: rows.map(loanDto) });
  });

  router.get('/:id', (req, res) => {
    const loanId = validate.id(req.params.id);
    const row = getLoan(db, loanId);
    ensureVisibleLoan(req, row);
    res.json({ data: loanDto(row) });
  });

  router.post('/', (req, res) => {
    const resourceId = validate.id(req.body?.resourceId, 'resourceId');
    const quantity = validate.positiveInteger(req.body?.quantity, 'quantity');
    const purpose = validate.requiredString(req.body?.purpose, 'purpose', { min: 5, max: 500 });
    const resource = db.prepare('SELECT * FROM resources WHERE id = ? AND active = 1').get(resourceId);
    if (!resource) throw new AppError(404, 'RESOURCE_NOT_FOUND', 'El recurso no existe.');
    if (quantity > resource.quantity_available) {
      throw new AppError(409, 'INSUFFICIENT_STOCK', 'No hay suficientes unidades disponibles.');
    }
    const timestamp = now();
    const result = db.prepare(`
      INSERT INTO loans (user_id, resource_id, quantity, purpose, requested_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.id, resourceId, quantity, purpose, timestamp, timestamp);
    res.status(201).json({ data: loanDto(getLoan(db, Number(result.lastInsertRowid))) });
  });

  router.patch('/:id/cancel', (req, res) => {
    const loanId = validate.id(req.params.id);
    const row = getLoan(db, loanId);
    ensureVisibleLoan(req, row);
    if (row.status !== 'PENDING') {
      throw new AppError(409, 'INVALID_TRANSITION', 'Solo se puede cancelar una solicitud pendiente.');
    }
    if (req.user.role !== 'ADMIN' && row.user_id !== req.user.id) {
      throw new AppError(403, 'FORBIDDEN', 'No puede cancelar esta solicitud.');
    }
    db.prepare("UPDATE loans SET status = 'CANCELLED', updated_at = ? WHERE id = ?").run(
      now(),
      loanId,
    );
    res.json({ message: 'Solicitud cancelada.', data: loanDto(getLoan(db, loanId)) });
  });

  router.patch('/:id/approve', authorize('ADMIN'), (req, res) => {
    const loanId = validate.id(req.params.id);
    const dueDate = validate.date(req.body?.dueDate, 'dueDate');
    const notes = validate.optionalString(req.body?.notes, 'notes', { max: 500 }) ?? null;
    if (dueDate < new Date().toISOString().slice(0, 10)) {
      throw new AppError(400, 'VALIDATION_ERROR', 'La fecha de devolucion no puede estar en el pasado.');
    }

    transaction(db, () => {
      const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);
      if (!loan) throw new AppError(404, 'LOAN_NOT_FOUND', 'La solicitud no existe.');
      if (loan.status !== 'PENDING') {
        throw new AppError(409, 'INVALID_TRANSITION', 'Solo se puede aprobar una solicitud pendiente.');
      }
      const stockChange = db.prepare(`
        UPDATE resources
        SET quantity_available = quantity_available - ?, updated_at = ?
        WHERE id = ? AND active = 1 AND quantity_available >= ?
      `).run(loan.quantity, now(), loan.resource_id, loan.quantity);
      if (stockChange.changes !== 1) {
        throw new AppError(409, 'INSUFFICIENT_STOCK', 'No hay suficientes unidades disponibles.');
      }
      const timestamp = now();
      db.prepare(`
        UPDATE loans
        SET status = 'APPROVED', reviewed_by = ?, reviewed_at = ?, due_date = ?,
            notes = ?, updated_at = ?
        WHERE id = ?
      `).run(req.user.id, timestamp, dueDate, notes, timestamp, loanId);
    });

    res.json({ message: 'Solicitud aprobada.', data: loanDto(getLoan(db, loanId)) });
  });

  router.patch('/:id/reject', authorize('ADMIN'), (req, res) => {
    const loanId = validate.id(req.params.id);
    const reason = validate.requiredString(req.body?.reason, 'reason', { min: 3, max: 500 });
    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);
    if (!loan) throw new AppError(404, 'LOAN_NOT_FOUND', 'La solicitud no existe.');
    if (loan.status !== 'PENDING') {
      throw new AppError(409, 'INVALID_TRANSITION', 'Solo se puede rechazar una solicitud pendiente.');
    }
    const timestamp = now();
    db.prepare(`
      UPDATE loans
      SET status = 'REJECTED', reviewed_by = ?, reviewed_at = ?, rejection_reason = ?, updated_at = ?
      WHERE id = ?
    `).run(req.user.id, timestamp, reason, timestamp, loanId);
    res.json({ message: 'Solicitud rechazada.', data: loanDto(getLoan(db, loanId)) });
  });

  router.patch('/:id/deliver', authorize('ADMIN'), (req, res) => {
    const loanId = validate.id(req.params.id);
    const timestamp = now();
    const result = db.prepare(`
      UPDATE loans SET status = 'DELIVERED', delivered_at = ?, updated_at = ?
      WHERE id = ? AND status = 'APPROVED'
    `).run(timestamp, timestamp, loanId);
    if (result.changes !== 1) {
      const exists = db.prepare('SELECT 1 FROM loans WHERE id = ?').get(loanId);
      if (!exists) throw new AppError(404, 'LOAN_NOT_FOUND', 'La solicitud no existe.');
      throw new AppError(409, 'INVALID_TRANSITION', 'Solo se puede entregar un prestamo aprobado.');
    }
    res.json({ message: 'Recurso entregado.', data: loanDto(getLoan(db, loanId)) });
  });

  router.patch('/:id/return', authorize('ADMIN'), (req, res) => {
    const loanId = validate.id(req.params.id);
    transaction(db, () => {
      const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);
      if (!loan) throw new AppError(404, 'LOAN_NOT_FOUND', 'La solicitud no existe.');
      if (loan.status !== 'DELIVERED') {
        throw new AppError(409, 'INVALID_TRANSITION', 'Solo se puede devolver un prestamo entregado.');
      }
      const timestamp = now();
      db.prepare(`
        UPDATE resources
        SET quantity_available = quantity_available + ?, updated_at = ?
        WHERE id = ?
      `).run(loan.quantity, timestamp, loan.resource_id);
      db.prepare(`
        UPDATE loans SET status = 'RETURNED', returned_at = ?, updated_at = ? WHERE id = ?
      `).run(timestamp, timestamp, loanId);
    });
    res.json({ message: 'Recurso devuelto.', data: loanDto(getLoan(db, loanId)) });
  });

  return router;
}

module.exports = { LOAN_SELECT, getLoan, loanDto, loanRoutes };
