const { createTestContext, demoSessions } = require('./helpers');

describe('solicitudes de materiales no disponibles', () => {
  let context;
  let sessions;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    context = createTestContext();
    sessions = await demoSessions(context.api);
  });

  afterEach(() => context.db.close());

  async function createMaterialRequest(overrides = {}) {
    return context.api
      .post('/api/material-requests')
      .set('Authorization', sessions.user.authorization)
      .send({
        name: 'Microscopio digital',
        category: 'Laboratorio',
        quantity: 2,
        justification: 'Se necesita para prácticas de ciencias.',
        ...overrides,
      });
  }

  test('usuario solicita un material y consulta solamente sus solicitudes', async () => {
    const created = await createMaterialRequest();
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({
      name: 'Microscopio digital',
      status: 'PENDING',
      quantity: 2,
      user: { id: sessions.user.user.id },
    });

    const duplicate = await createMaterialRequest();
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('MATERIAL_REQUEST_PENDING');

    const own = await context.api
      .get('/api/material-requests')
      .set('Authorization', sessions.user.authorization);
    expect(own.status).toBe(200);
    expect(own.body.data).toHaveLength(1);
    expect(own.body.data[0].user.email).toBe('usuario@eduprestamo.local');
  });

  test('administrador ve la solicitud y la convierte en un recurso disponible', async () => {
    const created = await createMaterialRequest();
    const requestId = created.body.data.id;

    const pending = await context.api
      .get('/api/material-requests?status=PENDING')
      .set('Authorization', sessions.admin.authorization);
    expect(pending.status).toBe(200);
    expect(pending.body.data).toHaveLength(1);

    const fulfilled = await context.api
      .post(`/api/material-requests/${requestId}/fulfill`)
      .set('Authorization', sessions.admin.authorization)
      .send({
        code: 'MIC-DIG-001',
        name: 'Microscopio digital',
        description: 'Equipo solicitado por estudiantes.',
        category: 'Laboratorio',
        condition: 'GOOD',
        quantityTotal: 2,
      });
    expect(fulfilled.status).toBe(201);
    expect(fulfilled.body.data).toMatchObject({
      status: 'FULFILLED',
      resource: { code: 'MIC-DIG-001' },
      reviewedBy: { id: sessions.admin.user.id },
    });

    const resource = context.db.prepare(
      'SELECT * FROM resources WHERE code = ?',
    ).get('MIC-DIG-001');
    expect(resource).toMatchObject({ quantity_total: 2, quantity_available: 2, active: 1 });
  });

  test('administrador puede rechazar y el usuario puede cancelar solicitudes pendientes', async () => {
    const rejectedRequest = await createMaterialRequest();
    const rejected = await context.api
      .patch(`/api/material-requests/${rejectedRequest.body.data.id}/reject`)
      .set('Authorization', sessions.admin.authorization)
      .send({ reason: 'Ya existe un equipo equivalente.' });
    expect(rejected.status).toBe(200);
    expect(rejected.body.data).toMatchObject({
      status: 'REJECTED',
      rejectionReason: 'Ya existe un equipo equivalente.',
    });

    const cancellable = await createMaterialRequest({ name: 'Cámara térmica' });
    const cancelled = await context.api
      .patch(`/api/material-requests/${cancellable.body.data.id}/cancel`)
      .set('Authorization', sessions.user.authorization);
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.status).toBe('CANCELLED');
  });

  test('protege permisos, valida entradas y conserva transiciones válidas', async () => {
    const forbidden = await context.api
      .post('/api/material-requests')
      .set('Authorization', sessions.admin.authorization)
      .send({
        name: 'Material', category: 'General', quantity: 1, justification: 'Solicitud admin',
      });
    expect(forbidden.status).toBe(403);

    const invalid = await createMaterialRequest({ quantity: 0, justification: 'x' });
    expect(invalid.status).toBe(400);

    const created = await createMaterialRequest({ name: 'Tableta gráfica' });
    const cancelled = await context.api
      .patch(`/api/material-requests/${created.body.data.id}/cancel`)
      .set('Authorization', sessions.user.authorization);
    expect(cancelled.status).toBe(200);

    const cannotFulfill = await context.api
      .post(`/api/material-requests/${created.body.data.id}/fulfill`)
      .set('Authorization', sessions.admin.authorization)
      .send({
        code: 'TAB-001', name: 'Tableta gráfica', description: '', category: 'Cómputo',
        condition: 'GOOD', quantityTotal: 1,
      });
    expect(cannotFulfill.status).toBe(409);
    expect(cannotFulfill.body.error.code).toBe('INVALID_TRANSITION');
  });

  test('la creación del recurso revierte si el código ya existe', async () => {
    const created = await createMaterialRequest({ name: 'Proyector portátil' });
    const conflict = await context.api
      .post(`/api/material-requests/${created.body.data.id}/fulfill`)
      .set('Authorization', sessions.admin.authorization)
      .send({
        code: 'PROY-001', name: 'Proyector portátil', description: '', category: 'Audiovisual',
        condition: 'GOOD', quantityTotal: 1,
      });
    expect(conflict.status).toBe(409);
    expect(conflict.body.error.code).toBe('RESOURCE_CODE_IN_USE');
    const stored = context.db.prepare(
      'SELECT status, resource_id FROM material_requests WHERE id = ?',
    ).get(created.body.data.id);
    expect(stored).toMatchObject({ status: 'PENDING', resource_id: null });
  });
});
