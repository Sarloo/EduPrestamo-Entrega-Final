const { createTestContext, demoSessions } = require('./helpers');

describe('inventario de recursos', () => {
  let context;
  let sessions;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    context = createTestContext();
    sessions = await demoSessions(context.api);
  });

  afterEach(() => context.db.close());

  test('lista, busca y filtra recursos activos', async () => {
    const list = await context.api
      .get('/api/resources')
      .set('Authorization', sessions.user.authorization);
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(3);
    expect(list.body.data[0]).toEqual(expect.objectContaining({ code: expect.any(String) }));

    const search = await context.api
      .get('/api/resources?search=robotica')
      .set('Authorization', sessions.user.authorization);
    expect(search.body.data).toHaveLength(1);
    expect(search.body.data[0].code).toBe('KIT-ROB-001');

    const category = await context.api
      .get('/api/resources?category=Computo')
      .set('Authorization', sessions.user.authorization);
    expect(category.body.data).toHaveLength(1);
  });

  test('administrador crea y actualiza un recurso con codigo unico', async () => {
    const created = await context.api
      .post('/api/resources')
      .set('Authorization', sessions.admin.authorization)
      .send({
        code: 'CALC-001',
        name: 'Calculadora cientifica',
        description: 'Calculadora para matematicas.',
        category: 'Matematicas',
        condition: 'GOOD',
        quantityTotal: 12,
      });
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ code: 'CALC-001', quantityAvailable: 12 });

    const duplicate = await context.api
      .post('/api/resources')
      .set('Authorization', sessions.admin.authorization)
      .send({
        code: 'calc-001', name: 'Otra', category: 'Matematicas', condition: 'GOOD', quantityTotal: 1,
      });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error.code).toBe('RESOURCE_CODE_IN_USE');

    const updated = await context.api
      .patch(`/api/resources/${created.body.data.id}`)
      .set('Authorization', sessions.admin.authorization)
      .send({ condition: 'FAIR', quantityTotal: 10 });
    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({ condition: 'FAIR', quantityTotal: 10 });

    const clearedDescription = await context.api
      .patch(`/api/resources/${created.body.data.id}`)
      .set('Authorization', sessions.admin.authorization)
      .send({ description: null });
    expect(clearedDescription.status).toBe(200);
    expect(clearedDescription.body.data.description).toBe('');
  });

  test('usuario no puede administrar recursos y se validan datos', async () => {
    const forbidden = await context.api
      .post('/api/resources')
      .set('Authorization', sessions.user.authorization)
      .send({ code: 'X-1', name: 'Recurso', category: 'Otra', condition: 'GOOD', quantityTotal: 1 });
    expect(forbidden.status).toBe(403);

    const invalid = await context.api
      .post('/api/resources')
      .set('Authorization', sessions.admin.authorization)
      .send({ code: 'X', name: '', category: 'O', condition: 'UNKNOWN', quantityTotal: -1 });
    expect(invalid.status).toBe(400);
  });

  test('realiza baja logica y oculta el recurso a usuarios', async () => {
    const deleted = await context.api
      .delete('/api/resources/1')
      .set('Authorization', sessions.admin.authorization);
    expect(deleted.status).toBe(200);
    expect(deleted.body.data.active).toBe(false);

    const userLookup = await context.api
      .get('/api/resources/1')
      .set('Authorization', sessions.user.authorization);
    expect(userLookup.status).toBe(404);

    const adminList = await context.api
      .get('/api/resources?includeInactive=true')
      .set('Authorization', sessions.admin.authorization);
    expect(adminList.body.data.some((item) => item.id === 1 && !item.active)).toBe(true);
  });

  test('informa actualizaciones vacias, codigos repetidos y recursos inexistentes', async () => {
    const empty = await context.api
      .patch('/api/resources/1')
      .set('Authorization', sessions.admin.authorization)
      .send({});
    expect(empty.status).toBe(400);

    const duplicateCode = await context.api
      .patch('/api/resources/1')
      .set('Authorization', sessions.admin.authorization)
      .send({ code: 'PROY-001' });
    expect(duplicateCode.status).toBe(409);
    expect(duplicateCode.body.error.code).toBe('RESOURCE_CODE_IN_USE');

    const missingGet = await context.api
      .get('/api/resources/999')
      .set('Authorization', sessions.admin.authorization);
    const missingUpdate = await context.api
      .put('/api/resources/999')
      .set('Authorization', sessions.admin.authorization)
      .send({ name: 'No existe' });
    const missingDelete = await context.api
      .delete('/api/resources/999')
      .set('Authorization', sessions.admin.authorization);
    expect([missingGet.status, missingUpdate.status, missingDelete.status]).toEqual([404, 404, 404]);
  });
});
