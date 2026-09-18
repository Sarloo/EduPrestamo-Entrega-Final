const { createTestContext, demoSessions } = require('./helpers');

describe('ciclo de prestamos', () => {
  let context;
  let sessions;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    context = createTestContext();
    sessions = await demoSessions(context.api);
  });

  afterEach(() => context.db.close());

  async function requestLoan(overrides = {}) {
    return context.api
      .post('/api/loans')
      .set('Authorization', sessions.user.authorization)
      .send({ resourceId: 1, quantity: 2, purpose: 'Proyecto de programacion', ...overrides });
  }

  test('usuario solicita y consulta solo sus prestamos', async () => {
    const created = await requestLoan();
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ status: 'PENDING', quantity: 2 });

    const mine = await context.api
      .get('/api/loans')
      .set('Authorization', sessions.user.authorization);
    expect(mine.status).toBe(200);
    expect(mine.body.data).toHaveLength(1);

    const admin = await context.api
      .get('/api/loans?status=PENDING')
      .set('Authorization', sessions.admin.authorization);
    expect(admin.body.data).toHaveLength(1);
  });

  test('administrador aprueba, entrega y registra devolucion restaurando existencias', async () => {
    const created = await requestLoan();
    const id = created.body.data.id;
    const dueDate = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);

    const approved = await context.api
      .patch(`/api/loans/${id}/approve`)
      .set('Authorization', sessions.admin.authorization)
      .send({ dueDate, notes: 'Entregar con cargador.' });
    expect(approved.status).toBe(200);
    expect(approved.body.data.status).toBe('APPROVED');

    let resource = await context.api
      .get('/api/resources/1')
      .set('Authorization', sessions.user.authorization);
    expect(resource.body.data.quantityAvailable).toBe(6);

    const delivered = await context.api
      .patch(`/api/loans/${id}/deliver`)
      .set('Authorization', sessions.admin.authorization);
    expect(delivered.body.data.status).toBe('DELIVERED');

    const returned = await context.api
      .patch(`/api/loans/${id}/return`)
      .set('Authorization', sessions.admin.authorization);
    expect(returned.body.data.status).toBe('RETURNED');

    resource = await context.api
      .get('/api/resources/1')
      .set('Authorization', sessions.user.authorization);
    expect(resource.body.data.quantityAvailable).toBe(8);
  });

  test('administrador rechaza y usuario cancela solicitudes pendientes', async () => {
    const rejectedLoan = await requestLoan();
    const rejected = await context.api
      .patch(`/api/loans/${rejectedLoan.body.data.id}/reject`)
      .set('Authorization', sessions.admin.authorization)
      .send({ reason: 'Recurso reservado para mantenimiento.' });
    expect(rejected.status).toBe(200);
    expect(rejected.body.data.status).toBe('REJECTED');

    const cancellable = await requestLoan({ resourceId: 2, quantity: 1 });
    const cancelled = await context.api
      .patch(`/api/loans/${cancellable.body.data.id}/cancel`)
      .set('Authorization', sessions.user.authorization);
    expect(cancelled.body.data.status).toBe('CANCELLED');
  });

  test('impide sobreasignacion, fechas pasadas y transiciones invalidas', async () => {
    const unavailable = await requestLoan({ quantity: 99 });
    expect(unavailable.status).toBe(409);
    expect(unavailable.body.error.code).toBe('INSUFFICIENT_STOCK');

    const created = await requestLoan();
    const id = created.body.data.id;
    const past = await context.api
      .patch(`/api/loans/${id}/approve`)
      .set('Authorization', sessions.admin.authorization)
      .send({ dueDate: '2000-01-01' });
    expect(past.status).toBe(400);

    const premature = await context.api
      .patch(`/api/loans/${id}/deliver`)
      .set('Authorization', sessions.admin.authorization);
    expect(premature.status).toBe(409);

    const userApprove = await context.api
      .patch(`/api/loans/${id}/approve`)
      .set('Authorization', sessions.user.authorization)
      .send({ dueDate: '2099-01-01' });
    expect(userApprove.status).toBe(403);
  });

  test('recurso con prestamo aprobado no puede darse de baja ni reducirse bajo uso', async () => {
    const created = await requestLoan({ quantity: 3 });
    await context.api
      .patch(`/api/loans/${created.body.data.id}/approve`)
      .set('Authorization', sessions.admin.authorization)
      .send({ dueDate: '2099-01-01' });

    const remove = await context.api
      .delete('/api/resources/1')
      .set('Authorization', sessions.admin.authorization);
    expect(remove.status).toBe(409);
    expect(remove.body.error.code).toBe('RESOURCE_IN_USE');

    const shrink = await context.api
      .patch('/api/resources/1')
      .set('Authorization', sessions.admin.authorization)
      .send({ quantityTotal: 2 });
    expect(shrink.status).toBe(409);
    expect(shrink.body.error.code).toBe('QUANTITY_IN_USE');
  });

  test('mantiene la privacidad entre usuarios y valida filtros', async () => {
    const created = await requestLoan();
    const registration = await context.api.post('/api/auth/register').send({
      name: 'Segundo Usuario', email: 'segundo@example.com', password: 'Segundo123',
    });
    const otherAuthorization = `Bearer ${registration.body.data.accessToken}`;

    const hidden = await context.api
      .get(`/api/loans/${created.body.data.id}`)
      .set('Authorization', otherAuthorization);
    expect(hidden.status).toBe(404);

    const filtered = await context.api
      .get(`/api/loans?userId=${sessions.user.user.id}&resourceId=1`)
      .set('Authorization', sessions.admin.authorization);
    expect(filtered.body.data).toHaveLength(1);

    const missing = await context.api
      .get('/api/loans/999')
      .set('Authorization', sessions.admin.authorization);
    expect(missing.status).toBe(404);
  });

  test('detecta falta de existencias durante dos aprobaciones concurrentes', async () => {
    const first = await requestLoan({ quantity: 6 });
    const second = await requestLoan({ quantity: 6, purpose: 'Segundo proyecto academico' });

    const accepted = await context.api
      .patch(`/api/loans/${first.body.data.id}/approve`)
      .set('Authorization', sessions.admin.authorization)
      .send({ dueDate: '2099-01-01' });
    expect(accepted.status).toBe(200);

    const rejected = await context.api
      .patch(`/api/loans/${second.body.data.id}/approve`)
      .set('Authorization', sessions.admin.authorization)
      .send({ dueDate: '2099-01-01' });
    expect(rejected.status).toBe(409);
    expect(rejected.body.error.code).toBe('INSUFFICIENT_STOCK');
  });

  test('maneja prestamos inexistentes y transiciones repetidas', async () => {
    const rejectMissing = await context.api
      .patch('/api/loans/999/reject')
      .set('Authorization', sessions.admin.authorization)
      .send({ reason: 'No existe' });
    const deliverMissing = await context.api
      .patch('/api/loans/999/deliver')
      .set('Authorization', sessions.admin.authorization);
    const returnMissing = await context.api
      .patch('/api/loans/999/return')
      .set('Authorization', sessions.admin.authorization);
    expect([rejectMissing.status, deliverMissing.status, returnMissing.status]).toEqual([404, 404, 404]);

    const created = await requestLoan();
    const cancelled = await context.api
      .patch(`/api/loans/${created.body.data.id}/cancel`)
      .set('Authorization', sessions.user.authorization);
    expect(cancelled.status).toBe(200);
    const repeated = await context.api
      .patch(`/api/loans/${created.body.data.id}/cancel`)
      .set('Authorization', sessions.user.authorization);
    expect(repeated.status).toBe(409);
  });
});
