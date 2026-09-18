const express = require('express');

function reportRoutes({ db, authenticate, authorize }) {
  const router = express.Router();
  router.use(authenticate, authorize('ADMIN'));

  router.get('/summary', (_req, res) => {
    const inventory = db.prepare(`
      SELECT
        COUNT(*) AS resources,
        COALESCE(SUM(quantity_total), 0) AS total_units,
        COALESCE(SUM(quantity_available), 0) AS available_units,
        COALESCE(SUM(quantity_total - quantity_available), 0) AS loaned_units
      FROM resources
      WHERE active = 1
    `).get();

    const loanRows = db.prepare(`
      SELECT status, COUNT(*) AS total
      FROM loans
      GROUP BY status
    `).all();
    const loans = Object.fromEntries(
      ['PENDING', 'APPROVED', 'REJECTED', 'DELIVERED', 'RETURNED', 'CANCELLED']
        .map((status) => [status, 0]),
    );
    for (const row of loanRows) loans[row.status] = row.total;

    const overdue = db.prepare(`
      SELECT COUNT(*) AS total
      FROM loans
      WHERE status = 'DELIVERED' AND due_date < date('now')
    `).get().total;

    const users = db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN role = 'ADMIN' THEN 1 ELSE 0 END) AS administrators,
        SUM(CASE WHEN role = 'USER' THEN 1 ELSE 0 END) AS standard_users
      FROM users
    `).get();

    res.json({
      data: {
        inventory: {
          resources: inventory.resources,
          totalUnits: inventory.total_units,
          availableUnits: inventory.available_units,
          loanedUnits: inventory.loaned_units,
        },
        loans,
        overdue,
        users: {
          total: users.total,
          administrators: users.administrators || 0,
          standardUsers: users.standard_users || 0,
        },
      },
    });
  });

  return router;
}

module.exports = reportRoutes;
