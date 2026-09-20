(() => {
  'use strict';

  const state = {
    token: localStorage.getItem('eduprestamo_token'),
    user: null,
    resources: [],
    loans: [],
    summary: null,
    route: 'catalogo',
    dialogSubmit: null,
  };

  const elements = {
    authView: document.querySelector('#auth-view'),
    appShell: document.querySelector('#app-shell'),
    loginForm: document.querySelector('#login-form'),
    loginEmail: document.querySelector('#login-email'),
    loginPassword: document.querySelector('#login-password'),
    loginError: document.querySelector('#login-error'),
    loginSubmit: document.querySelector('#login-submit'),
    loginPanel: document.querySelector('#login-panel'),
    registerPanel: document.querySelector('#register-panel'),
    registerForm: document.querySelector('#register-form'),
    registerName: document.querySelector('#register-name'),
    registerEmail: document.querySelector('#register-email'),
    registerPassword: document.querySelector('#register-password'),
    registerPasswordConfirmation: document.querySelector('#register-password-confirmation'),
    registerError: document.querySelector('#register-error'),
    registerSubmit: document.querySelector('#register-submit'),
    demoAccess: document.querySelector('#demo-access'),
    adminNavigation: document.querySelector('#admin-navigation'),
    pendingCount: document.querySelector('#pending-nav-count'),
    userName: document.querySelector('#user-name'),
    userRole: document.querySelector('#user-role'),
    userAvatar: document.querySelector('#user-avatar'),
    todayLabel: document.querySelector('#today-label'),
    pageTitle: document.querySelector('#page-title'),
    pageDescription: document.querySelector('#page-description'),
    pageEyebrow: document.querySelector('#page-eyebrow'),
    pageActions: document.querySelector('#page-actions'),
    pageFeedback: document.querySelector('#page-feedback'),
    pageContent: document.querySelector('#page-content'),
    mainContent: document.querySelector('#main-content'),
    dialog: document.querySelector('#app-dialog'),
    dialogForm: document.querySelector('#dialog-form'),
    dialogTitle: document.querySelector('#dialog-title'),
    dialogDescription: document.querySelector('#dialog-description'),
    dialogContent: document.querySelector('#dialog-content'),
    dialogAlert: document.querySelector('#dialog-alert'),
    dialogSubmit: document.querySelector('#dialog-submit'),
    toastRegion: document.querySelector('#toast-region'),
    connectionStatus: document.querySelector('#connection-status'),
  };

  const labels = {
    condition: { GOOD: 'Buen estado', FAIR: 'Estado regular', DAMAGED: 'Dañado' },
    status: {
      PENDING: 'Pendiente',
      APPROVED: 'Aprobado',
      REJECTED: 'Rechazado',
      DELIVERED: 'Entregado',
      RETURNED: 'Devuelto',
      CANCELLED: 'Cancelado',
    },
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function formatDate(value, options = {}) {
    if (!value) return 'Sin fecha';
    const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T12:00:00`)
      : new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric', ...options,
    }).format(date);
  }

  function setLoading(button, loading) {
    if (!button) return;
    button.disabled = loading;
    button.classList.toggle('is-loading', loading);
  }

  function toast(message, type = 'success') {
    const item = document.createElement('div');
    item.className = `toast${type === 'error' ? ' toast--error' : ''}`;
    item.textContent = message;
    elements.toastRegion.append(item);
    window.setTimeout(() => item.remove(), 4200);
  }

  function showPageLoading(message = 'Cargando información...') {
    elements.pageContent.setAttribute('aria-busy', 'true');
    elements.pageContent.innerHTML = `
      <div class="loading-state">
        <div><div class="loading-ring"></div><p>${escapeHtml(message)}</p></div>
      </div>`;
  }

  function emptyState(title, message) {
    return `<div class="empty-state"><div><h2>${escapeHtml(title)}</h2><p>${escapeHtml(message)}</p></div></div>`;
  }

  function errorMessage(error) {
    if (error?.details && typeof error.details === 'object') {
      const detail = Object.values(error.details)[0];
      if (detail) return `${error.message} ${detail}`;
    }
    return error?.message || 'No fue posible completar la operación.';
  }

  async function api(path, options = {}) {
    const headers = { Accept: 'application/json', ...(options.headers || {}) };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    if (state.token) headers.Authorization = `Bearer ${state.token}`;

    let response;
    try {
      response = await fetch(path, {
        method: options.method || 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });
      elements.connectionStatus?.classList.remove('is-offline');
      if (elements.connectionStatus) elements.connectionStatus.querySelector('span:last-child').textContent = 'Con conexión';
    } catch {
      elements.connectionStatus?.classList.add('is-offline');
      if (elements.connectionStatus) elements.connectionStatus.querySelector('span:last-child').textContent = 'Sin conexión';
      throw new Error('No hay conexión con el servidor. Verifica que EduPréstamo esté ejecutándose.');
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.error?.message || `La solicitud falló con código ${response.status}.`);
      error.code = payload.error?.code;
      error.details = payload.error?.details;
      error.status = response.status;
      if (response.status === 401 && !path.endsWith('/login')) logout(false);
      throw error;
    }
    return payload;
  }

  function showAuthenticated(user) {
    state.user = user;
    elements.authView.hidden = true;
    elements.appShell.hidden = false;
    elements.adminNavigation.hidden = user.role !== 'ADMIN';
    elements.userName.textContent = user.name;
    elements.userRole.textContent = user.role === 'ADMIN' ? 'Administrador' : 'Usuario';
    elements.userAvatar.textContent = user.name.trim().charAt(0).toUpperCase() || 'U';
    elements.todayLabel.textContent = new Intl.DateTimeFormat('es-MX', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).format(new Date());
  }

  function setAuthMode(mode) {
    const registering = mode === 'register';
    elements.loginPanel.hidden = registering;
    elements.registerPanel.hidden = !registering;
    elements.loginError.hidden = true;
    elements.registerError.hidden = true;
    elements.authView.setAttribute('aria-labelledby', registering ? 'register-title' : 'login-title');
    window.setTimeout(() => {
      (registering ? elements.registerName : elements.loginEmail).focus();
    }, 0);
  }

  function showLogin() {
    elements.authView.hidden = false;
    elements.appShell.hidden = true;
    elements.loginPassword.value = '';
    setAuthMode('login');
  }

  function logout(notify = true) {
    state.token = null;
    state.user = null;
    localStorage.removeItem('eduprestamo_token');
    showLogin();
    if (notify) toast('Sesión cerrada correctamente.');
  }

  function pageHeader({ eyebrow = 'EduPréstamo', title, description, actions = '' }) {
    elements.pageEyebrow.textContent = eyebrow;
    elements.pageTitle.textContent = title;
    elements.pageDescription.textContent = description;
    elements.pageActions.innerHTML = actions;
  }

  function statusBadge(status) {
    const classes = {
      PENDING: 'badge--warning', REJECTED: 'badge--danger', CANCELLED: 'badge--muted',
      RETURNED: 'badge--muted', DELIVERED: '', APPROVED: '',
    };
    return `<span class="badge ${classes[status] || ''}">${escapeHtml(labels.status[status] || status)}</span>`;
  }

  function resourceConditionBadge(condition) {
    let style = '';
    if (condition === 'DAMAGED') style = 'badge--danger';
    else if (condition === 'FAIR') style = 'badge--warning';
    return `<span class="badge ${style}">${escapeHtml(labels.condition[condition] || condition)}</span>`;
  }

  async function renderCatalog() {
    pageHeader({
      eyebrow: 'Recursos escolares',
      title: 'Catálogo',
      description: 'Consulta el inventario disponible y solicita el material que necesitas.',
    });
    showPageLoading('Consultando el inventario...');
    const response = await api('/api/resources');
    state.resources = response.data;
    const categoryOptions = [...new Set(state.resources.map((item) => item.category))]
      .sort((a, b) => a.localeCompare(b, 'es'))
      .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
      .join('');
    elements.pageContent.setAttribute('aria-busy', 'false');
    elements.pageContent.innerHTML = `
      <div class="filter-bar">
        <input id="catalog-search" type="search" placeholder="Buscar por nombre, código o descripción" aria-label="Buscar recursos" />
        <select id="catalog-category" aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>
          ${categoryOptions}
        </select>
      </div>
      <div id="resource-results"></div>`;
    const search = document.querySelector('#catalog-search');
    const category = document.querySelector('#catalog-category');
    const update = () => renderResourceCards(search.value, category.value);
    search.addEventListener('input', update);
    category.addEventListener('change', update);
    renderResourceCards('', '');
  }

  function renderResourceCards(search, category) {
    const normalized = search.trim().toLocaleLowerCase('es');
    const filtered = state.resources.filter((resource) => {
      const matchesSearch = !normalized || [resource.code, resource.name, resource.description]
        .some((value) => String(value).toLocaleLowerCase('es').includes(normalized));
      return matchesSearch && (!category || resource.category === category);
    });
    const container = document.querySelector('#resource-results');
    if (!container) return;
    if (!filtered.length) {
      container.innerHTML = emptyState('No encontramos recursos', 'Prueba con otra búsqueda o categoría.');
      return;
    }
    const resourceCards = filtered.map((resource) => `
      <article class="resource-card">
        <div class="resource-card__top">
          <span class="resource-card__code">${escapeHtml(resource.code)}</span>
          ${resourceConditionBadge(resource.condition)}
        </div>
        <h2>${escapeHtml(resource.name)}</h2>
        <p class="resource-card__category">${escapeHtml(resource.category)}</p>
        <p class="resource-card__description">${escapeHtml(resource.description || 'Sin descripción.')}</p>
        <div class="resource-card__footer">
          <span class="stock"><strong>${resource.quantityAvailable}</strong> de ${resource.quantityTotal} disponibles</span>
          <button class="button button--primary button--compact" type="button"
            data-action="request" data-id="${resource.id}" ${resource.quantityAvailable < 1 ? 'disabled' : ''}>
            ${resource.quantityAvailable < 1 ? 'No disponible' : 'Solicitar'}
          </button>
        </div>
      </article>`).join('');
    container.innerHTML = `<div class="resource-grid">${resourceCards}</div>`;
  }

  async function renderMyLoans() {
    pageHeader({
      eyebrow: 'Seguimiento personal',
      title: 'Mis préstamos',
      description: 'Revisa solicitudes, fechas de devolución y el historial de movimientos.',
    });
    showPageLoading('Consultando tus solicitudes...');
    const query = state.user.role === 'ADMIN' ? `?userId=${state.user.id}` : '';
    const response = await api(`/api/loans${query}`);
    state.loans = response.data;
    elements.pageContent.setAttribute('aria-busy', 'false');
    if (!state.loans.length) {
      elements.pageContent.innerHTML = emptyState('Aún no tienes solicitudes', 'Abre el catálogo y solicita un recurso disponible.');
      return;
    }
    elements.pageContent.innerHTML = loanTable(state.loans, false);
  }

  function loanTable(loans, admin) {
    return `<div class="panel"><div class="table-wrap"><table class="data-table">
      <thead><tr>
        <th>Recurso</th>${admin ? '<th>Solicitante</th>' : ''}<th>Cantidad</th><th>Estado</th><th>Fechas</th><th>Acciones</th>
      </tr></thead>
      <tbody>${loans.map((loan) => `
        <tr>
          <td><span class="table-primary"><strong>${escapeHtml(loan.resource.name)}</strong><small>${escapeHtml(loan.purpose)}</small></span></td>
          ${admin ? `<td><span class="table-primary"><strong>${escapeHtml(loan.user.name)}</strong><small>${escapeHtml(loan.user.email)}</small></span></td>` : ''}
          <td>${loan.quantity}</td>
          <td>${statusBadge(loan.status)}</td>
          <td><span class="table-primary"><small>Solicitud ${formatDate(loan.requestedAt)}</small><small>${loan.dueDate ? `Límite ${formatDate(loan.dueDate)}` : 'Sin fecha límite'}</small></span></td>
          <td>${loanActions(loan, admin)}</td>
        </tr>`).join('')}</tbody>
    </table></div></div>`;
  }

  function loanActions(loan, admin) {
    const actions = [];
    if (!admin && loan.status === 'PENDING') {
      actions.push(`<button class="button button--ghost button--compact" data-action="cancel-loan" data-id="${loan.id}">Cancelar</button>`);
    }
    if (admin && loan.status === 'PENDING') {
      actions.push(`<button class="button button--secondary button--compact" data-action="approve-loan" data-id="${loan.id}">Aprobar</button>`);
      actions.push(`<button class="button button--danger button--compact" data-action="reject-loan" data-id="${loan.id}">Rechazar</button>`);
    }
    if (admin && loan.status === 'APPROVED') {
      actions.push(`<button class="button button--primary button--compact" data-action="deliver-loan" data-id="${loan.id}">Entregar</button>`);
    }
    if (admin && loan.status === 'DELIVERED') {
      actions.push(`<button class="button button--secondary button--compact" data-action="return-loan" data-id="${loan.id}">Registrar devolución</button>`);
    }
    return `<div class="row-actions">${actions.join('') || '<span class="badge badge--muted">Sin acciones</span>'}</div>`;
  }

  async function renderSummary() {
    pageHeader({
      eyebrow: 'Control administrativo',
      title: 'Resumen',
      description: 'Indicadores actuales del inventario, las solicitudes y los usuarios.',
    });
    showPageLoading('Calculando indicadores...');
    const [summaryResponse, loansResponse] = await Promise.all([
      api('/api/reports/summary'), api('/api/loans'),
    ]);
    state.summary = summaryResponse.data;
    state.loans = loansResponse.data;
    updatePendingCount();
    const { inventory, loans, overdue } = state.summary;
    elements.pageContent.setAttribute('aria-busy', 'false');
    elements.pageContent.innerHTML = `
      <div class="metrics">
        ${metric('Recursos activos', inventory.resources, `${inventory.totalUnits} unidades registradas`)}
        ${metric('Unidades disponibles', inventory.availableUnits, `${inventory.loanedUnits} asignadas`)}
        ${metric('Solicitudes pendientes', loans.PENDING, 'Requieren revisión')}
        ${metric('Préstamos vencidos', overdue, overdue ? 'Requieren seguimiento' : 'Sin atrasos registrados')}
      </div>
      <section class="panel">
        <div class="panel__heading"><div><h2>Actividad reciente</h2><p>Últimas solicitudes registradas en el sistema.</p></div></div>
        ${state.loans.length ? `<div class="table-wrap">${loanTableRowsOnly(state.loans.slice(0, 5))}</div>` : emptyState('Sin actividad', 'Las solicitudes aparecerán aquí.')}
      </section>`;
  }

  function metric(label, value, note) {
    return `<article class="metric"><p>${escapeHtml(label)}</p><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note)}</small></article>`;
  }

  function loanTableRowsOnly(loans) {
    return `<table class="data-table"><thead><tr><th>Recurso</th><th>Usuario</th><th>Estado</th><th>Registro</th></tr></thead><tbody>
      ${loans.map((loan) => `<tr><td>${escapeHtml(loan.resource.name)}</td><td>${escapeHtml(loan.user.name)}</td><td>${statusBadge(loan.status)}</td><td>${formatDate(loan.requestedAt)}</td></tr>`).join('')}
    </tbody></table>`;
  }

  async function renderAdminResources() {
    pageHeader({
      eyebrow: 'Control de inventario',
      title: 'Recursos',
      description: 'Registra materiales, actualiza existencias y conserva las bajas en el historial.',
      actions: '<button class="button button--primary" type="button" data-action="new-resource">Nuevo recurso</button>',
    });
    showPageLoading('Consultando inventario administrativo...');
    const response = await api('/api/resources?includeInactive=true');
    state.resources = response.data;
    elements.pageContent.setAttribute('aria-busy', 'false');
    elements.pageContent.innerHTML = `<div class="panel"><div class="table-wrap"><table class="data-table">
      <thead><tr><th>Código y recurso</th><th>Categoría</th><th>Condición</th><th>Existencias</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>${state.resources.map((resource) => `<tr>
        <td><span class="table-primary"><strong>${escapeHtml(resource.name)}</strong><small>${escapeHtml(resource.code)}</small></span></td>
        <td>${escapeHtml(resource.category)}</td>
        <td>${resourceConditionBadge(resource.condition)}</td>
        <td>${resource.quantityAvailable} / ${resource.quantityTotal}</td>
        <td><span class="badge ${resource.active ? '' : 'badge--muted'}">${resource.active ? 'Activo' : 'Baja'}</span></td>
        <td><div class="row-actions">
          <button class="button button--ghost button--compact" data-action="edit-resource" data-id="${resource.id}">Editar</button>
          ${resource.active ? `<button class="button button--danger button--compact" data-action="delete-resource" data-id="${resource.id}">Dar de baja</button>` : ''}
        </div></td>
      </tr>`).join('')}</tbody>
    </table></div></div>`;
  }

  async function renderAdminLoans() {
    pageHeader({
      eyebrow: 'Flujo de préstamos',
      title: 'Solicitudes',
      description: 'Autoriza, entrega y cierra las solicitudes con trazabilidad por usuario.',
    });
    showPageLoading('Consultando todas las solicitudes...');
    const response = await api('/api/loans');
    state.loans = response.data;
    updatePendingCount();
    const statusOptions = Object.entries(labels.status)
      .map(([value, label]) => `<option value="${value}">${label}</option>`)
      .join('');
    elements.pageContent.setAttribute('aria-busy', 'false');
    elements.pageContent.innerHTML = state.loans.length
      ? `<div class="filter-bar"><input id="loan-search" type="search" placeholder="Buscar usuario o recurso" aria-label="Buscar solicitudes" />
          <select id="loan-status" aria-label="Filtrar por estado"><option value="">Todos los estados</option>${statusOptions}</select></div><div id="loan-results"></div>`
      : emptyState('Sin solicitudes', 'Las solicitudes de usuarios aparecerán aquí.');
    if (!state.loans.length) return;
    const search = document.querySelector('#loan-search');
    const status = document.querySelector('#loan-status');
    const update = () => {
      const term = search.value.trim().toLocaleLowerCase('es');
      const filtered = state.loans.filter((loan) => {
        const text = `${loan.resource.name} ${loan.user.name} ${loan.user.email}`.toLocaleLowerCase('es');
        return (!term || text.includes(term)) && (!status.value || loan.status === status.value);
      });
      document.querySelector('#loan-results').innerHTML = filtered.length
        ? loanTable(filtered, true)
        : emptyState('Sin coincidencias', 'Ajusta la búsqueda o el filtro de estado.');
    };
    search.addEventListener('input', update);
    status.addEventListener('change', update);
    update();
  }

  function updatePendingCount() {
    if (!state.user || state.user.role !== 'ADMIN') return;
    const pending = state.loans.filter((loan) => loan.status === 'PENDING').length;
    elements.pendingCount.textContent = String(pending);
    elements.pendingCount.hidden = pending === 0;
  }

  async function renderRoute() {
    if (!state.user) return;
    const requested = (window.location.hash || '#catalogo').slice(1);
    const adminRoutes = ['resumen', 'recursos', 'solicitudes'];
    state.route = adminRoutes.includes(requested) && state.user.role !== 'ADMIN' ? 'catalogo' : requested;
    if (!['catalogo', 'mis-prestamos', ...adminRoutes].includes(state.route)) state.route = 'catalogo';
    if (window.location.hash !== `#${state.route}`) window.history.replaceState(null, '', `#${state.route}`);

    document.querySelectorAll('[data-route]').forEach((link) => {
      link.classList.toggle('is-active', link.dataset.route === state.route);
    });
    elements.pageFeedback.innerHTML = '';
    document.body.classList.remove('sidebar-open');

    try {
      if (state.route === 'catalogo') await renderCatalog();
      if (state.route === 'mis-prestamos') await renderMyLoans();
      if (state.route === 'resumen') await renderSummary();
      if (state.route === 'recursos') await renderAdminResources();
      if (state.route === 'solicitudes') await renderAdminLoans();
      elements.mainContent.focus({ preventScroll: true });
    } catch (error) {
      elements.pageContent.setAttribute('aria-busy', 'false');
      elements.pageContent.innerHTML = emptyState('No fue posible cargar la sección', errorMessage(error));
    }
  }

  function openDialog({ title, description, content, submitLabel = 'Guardar', onSubmit }) {
    elements.dialogTitle.textContent = title;
    elements.dialogDescription.textContent = description;
    elements.dialogContent.innerHTML = content;
    elements.dialogSubmit.querySelector('.button__label').textContent = submitLabel;
    elements.dialogAlert.hidden = true;
    state.dialogSubmit = onSubmit;
    elements.dialog.showModal();
    const first = elements.dialogContent.querySelector('input, select, textarea');
    window.setTimeout(() => first?.focus(), 20);
  }

  function closeDialog() {
    if (elements.dialog.open) elements.dialog.close();
    state.dialogSubmit = null;
  }

  function requestDialog(resource) {
    openDialog({
      title: 'Solicitar recurso',
      description: `${resource.name} · ${resource.quantityAvailable} unidades disponibles`,
      submitLabel: 'Enviar solicitud',
      content: `<div class="form-grid">
        <div class="field"><label for="loan-quantity">Cantidad</label><input id="loan-quantity" name="quantity" type="number" min="1" max="${resource.quantityAvailable}" value="1" required /></div>
        <div class="field field--wide"><label for="loan-purpose">Uso del recurso</label><textarea id="loan-purpose" name="purpose" minlength="5" maxlength="500" placeholder="Describe la clase o actividad" required></textarea><p class="field__hint">Mínimo 5 caracteres.</p></div>
      </div>`,
      onSubmit: async (data) => {
        await api('/api/loans', { method: 'POST', body: { resourceId: resource.id, quantity: Number(data.get('quantity')), purpose: data.get('purpose') } });
        toast('Solicitud registrada. Puedes darle seguimiento en Mis préstamos.');
      },
    });
  }

  function resourceDialog(resource = null) {
    const editing = Boolean(resource);
    openDialog({
      title: editing ? 'Editar recurso' : 'Nuevo recurso',
      description: editing ? 'Actualiza la ficha y las existencias del material.' : 'Registra un material en el inventario escolar.',
      submitLabel: editing ? 'Guardar cambios' : 'Crear recurso',
      content: `<div class="form-grid">
        <div class="field"><label for="resource-code">Código</label><input id="resource-code" name="code" maxlength="30" value="${escapeHtml(resource?.code || '')}" required /></div>
        <div class="field"><label for="resource-category">Categoría</label><input id="resource-category" name="category" maxlength="80" value="${escapeHtml(resource?.category || '')}" required /></div>
        <div class="field field--wide"><label for="resource-name">Nombre</label><input id="resource-name" name="name" maxlength="120" value="${escapeHtml(resource?.name || '')}" required /></div>
        <div class="field"><label for="resource-condition">Condición</label><select id="resource-condition" name="condition">${Object.entries(labels.condition).map(([value, label]) => `<option value="${value}" ${resource?.condition === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div>
        <div class="field"><label for="resource-total">Cantidad total</label><input id="resource-total" name="quantityTotal" type="number" min="0" value="${resource?.quantityTotal ?? 1}" required /></div>
        <div class="field field--wide"><label for="resource-description">Descripción</label><textarea id="resource-description" name="description" maxlength="500">${escapeHtml(resource?.description || '')}</textarea></div>
      </div>`,
      onSubmit: async (data) => {
        const body = {
          code: data.get('code'), name: data.get('name'), category: data.get('category'),
          condition: data.get('condition'), quantityTotal: Number(data.get('quantityTotal')),
          description: data.get('description'),
        };
        await api(editing ? `/api/resources/${resource.id}` : '/api/resources', {
          method: editing ? 'PATCH' : 'POST', body,
        });
        toast(editing ? 'Recurso actualizado.' : 'Recurso registrado.');
      },
    });
  }

  function approveDialog(loan) {
    const defaultDate = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
    openDialog({
      title: 'Aprobar solicitud',
      description: `${loan.user.name} solicita ${loan.quantity} unidad(es) de ${loan.resource.name}.`,
      submitLabel: 'Aprobar préstamo',
      content: `<div class="field"><label for="due-date">Fecha límite de devolución</label><input id="due-date" name="dueDate" type="date" min="${new Date().toISOString().slice(0, 10)}" value="${defaultDate}" required /></div>
        <div class="field"><label for="approval-notes">Indicaciones de entrega</label><textarea id="approval-notes" name="notes" maxlength="500" placeholder="Opcional"></textarea></div>`,
      onSubmit: async (data) => {
        await api(`/api/loans/${loan.id}/approve`, { method: 'PATCH', body: { dueDate: data.get('dueDate'), notes: data.get('notes') || undefined } });
        toast('Solicitud aprobada y existencias reservadas.');
      },
    });
  }

  function rejectDialog(loan) {
    openDialog({
      title: 'Rechazar solicitud',
      description: `La decisión quedará registrada para ${loan.user.name}.`,
      submitLabel: 'Confirmar rechazo',
      content: '<div class="field"><label for="rejection-reason">Motivo</label><textarea id="rejection-reason" name="reason" minlength="3" maxlength="500" required></textarea></div>',
      onSubmit: async (data) => {
        await api(`/api/loans/${loan.id}/reject`, { method: 'PATCH', body: { reason: data.get('reason') } });
        toast('Solicitud rechazada.');
      },
    });
  }

  async function directAction(path, confirmation, success) {
    if (!window.confirm(confirmation)) return;
    try {
      await api(path, { method: path.includes('/resources/') ? 'DELETE' : 'PATCH' });
      toast(success);
      await renderRoute();
    } catch (error) {
      toast(errorMessage(error), 'error');
    }
  }

  elements.loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    elements.loginError.hidden = true;
    setLoading(elements.loginSubmit, true);
    try {
      const response = await api('/api/auth/login', {
        method: 'POST', body: { email: elements.loginEmail.value, password: elements.loginPassword.value },
      });
      state.token = response.data.accessToken;
      localStorage.setItem('eduprestamo_token', state.token);
      showAuthenticated(response.data.user);
      window.location.hash = response.data.user.role === 'ADMIN' ? 'resumen' : 'catalogo';
      await renderRoute();
    } catch (error) {
      elements.loginError.textContent = errorMessage(error);
      elements.loginError.hidden = false;
    } finally {
      setLoading(elements.loginSubmit, false);
    }
  });

  elements.registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    elements.registerError.hidden = true;
    if (!elements.registerForm.reportValidity()) return;
    if (elements.registerPassword.value !== elements.registerPasswordConfirmation.value) {
      elements.registerError.textContent = 'Las contraseñas no coinciden.';
      elements.registerError.hidden = false;
      return;
    }
    setLoading(elements.registerSubmit, true);
    try {
      const response = await api('/api/auth/register', {
        method: 'POST',
        body: {
          name: elements.registerName.value,
          email: elements.registerEmail.value,
          password: elements.registerPassword.value,
        },
      });
      state.token = response.data.accessToken;
      localStorage.setItem('eduprestamo_token', state.token);
      elements.registerForm.reset();
      showAuthenticated(response.data.user);
      window.location.hash = 'catalogo';
      await renderRoute();
      toast('Cuenta creada correctamente. Tu rol es Usuario.');
    } catch (error) {
      elements.registerError.textContent = errorMessage(error);
      elements.registerError.hidden = false;
    } finally {
      setLoading(elements.registerSubmit, false);
    }
  });

  document.querySelector('#show-register').addEventListener('click', () => setAuthMode('register'));
  document.querySelector('#show-login').addEventListener('click', () => setAuthMode('login'));

  document.querySelectorAll('.demo-credential').forEach((button) => {
    button.addEventListener('click', () => {
      elements.loginEmail.value = button.dataset.demoEmail;
      elements.loginPassword.value = button.dataset.demoPassword;
      elements.loginEmail.focus();
    });
  });

  document.querySelector('#toggle-password').addEventListener('click', (event) => {
    const button = event.currentTarget;
    const show = elements.loginPassword.type === 'password';
    elements.loginPassword.type = show ? 'text' : 'password';
    button.setAttribute('aria-pressed', String(show));
    button.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });

  document.querySelector('#logout-button').addEventListener('click', () => logout());
  document.querySelector('#open-sidebar').addEventListener('click', () => document.body.classList.add('sidebar-open'));
  document.querySelector('#close-sidebar').addEventListener('click', () => document.body.classList.remove('sidebar-open'));
  document.querySelector('#sidebar-scrim').addEventListener('click', () => document.body.classList.remove('sidebar-open'));
  window.addEventListener('hashchange', renderRoute);

  async function handleActionButton(button) {
    const id = Number(button.dataset.id);
    const resource = state.resources.find((item) => item.id === id);
    const loan = state.loans.find((item) => item.id === id);
    const actions = {
      request: async () => resource && requestDialog(resource),
      'new-resource': async () => resourceDialog(),
      'edit-resource': async () => resource && resourceDialog(resource),
      'delete-resource': async () => resource && directAction(
        `/api/resources/${id}`,
        `¿Dar de baja ${resource.name}?`,
        'Recurso dado de baja.',
      ),
      'approve-loan': async () => loan && approveDialog(loan),
      'reject-loan': async () => loan && rejectDialog(loan),
      'deliver-loan': async () => loan && directAction(
        `/api/loans/${id}/deliver`,
        '¿Confirmar que el recurso fue entregado?',
        'Entrega registrada.',
      ),
      'return-loan': async () => loan && directAction(
        `/api/loans/${id}/return`,
        '¿Confirmar la devolución del recurso?',
        'Devolución registrada.',
      ),
      'cancel-loan': async () => loan && directAction(
        `/api/loans/${id}/cancel`,
        '¿Cancelar esta solicitud pendiente?',
        'Solicitud cancelada.',
      ),
    };
    const action = actions[button.dataset.action];
    if (action) await action();
  }

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    await handleActionButton(button);
  });

  elements.dialogForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!state.dialogSubmit || !elements.dialogForm.reportValidity()) return;
    elements.dialogAlert.hidden = true;
    setLoading(elements.dialogSubmit, true);
    try {
      await state.dialogSubmit(new FormData(elements.dialogForm));
      closeDialog();
      await renderRoute();
    } catch (error) {
      elements.dialogAlert.textContent = errorMessage(error);
      elements.dialogAlert.hidden = false;
    } finally {
      setLoading(elements.dialogSubmit, false);
    }
  });

  document.querySelectorAll('[data-dialog-close]').forEach((button) => button.addEventListener('click', closeDialog));

  async function initialize() {
    const localDemoHosts = new Set(['localhost', '127.0.0.1', '::1']);
    elements.demoAccess.hidden = !localDemoHosts.has(window.location.hostname);

    if (!state.token) {
      showLogin();
      return;
    }
    try {
      const response = await api('/api/auth/me');
      showAuthenticated(response.data);
      await renderRoute();
    } catch {
      logout(false);
    }
  }

  initialize();
})();
