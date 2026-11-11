import {
  DEMO_STORES,
  DEMO_ADMIN_KPIS,
  DEMO_REVENUE_BY_STORE,
  DEMO_ITEM_RANKINGS,
  DEMO_PENDING_CLOSURES,
  DEMO_RAW_MATERIALS,
  DEMO_MANAGER_INVENTORY,
  DEMO_MANAGER_SALES,
  DEMO_ADMIN_SALES,
  DEMO_WORKFORCE_SUMMARY,
  DEMO_DISTRIBUTIONS,
  DEMO_CHANGE_REQUESTS,
  DEMO_USERS,
} from '../utils/demoData';

const STORAGE_KEYS = {
  MATERIALS: 'annam_mock_raw_materials_v5',
  STORES: 'annam_mock_stores_v5',
  CHANGE_REQUESTS: 'annam_mock_change_requests_v5',
  DISTRIBUTION_DEFAULTS: 'annam_mock_dist_defaults_v5',
  OVERRIDES: 'annam_mock_overrides_v5',
  USERS: 'annam_mock_users_v5',
  BUDGETS: 'annam_mock_budgets_v5',
  SALES: 'annam_mock_sales_v5',
  INVENTORY_UPDATES: 'annam_mock_inventory_updates_v5',
  ATTENDANCE: 'annam_mock_attendance_v5',
  WORKFORCE_TARGETS: 'annam_mock_wf_targets_v5',
  CLOSURE_REQUESTS: 'annam_mock_closures_v5',
  LEAVE_REQUESTS: 'annam_mock_leaves_v5',
  HISTORY: 'annam_mock_history_v5',
};

function getStorage(key, defaultData) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch (e) {
    return defaultData;
  }
}

function setStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage quota or access issue', e);
  }
}

export function isMockEnvironment() {
  if (typeof window === 'undefined') return false;
  const isVercel = window.location.hostname.includes('vercel.app');
  const hasExternalBackend =
    import.meta.env.VITE_API_BASE_URL &&
    !import.meta.env.VITE_API_BASE_URL.startsWith('/api') &&
    !import.meta.env.VITE_API_BASE_URL.includes('localhost');
  return isVercel && !hasExternalBackend;
}

export async function handleMockRequest(url, method = 'GET', data = null, params = {}) {
  const [rawPath, queryString] = url.replace(/^\/api/, '').split('?');
  const cleanUrl = rawPath;
  const httpMethod = method.toUpperCase();

  // Combine query parameters from URL string and params argument
  const queryParams = { ...(params || {}) };
  if (queryString) {
    const urlParams = new URLSearchParams(queryString);
    urlParams.forEach((val, key) => {
      queryParams[key] = val;
    });
  }

  await new Promise((r) => setTimeout(r, 60));

  // ---------------------------------------------------------------------------
  // 1. RAW MATERIALS
  // ---------------------------------------------------------------------------
  if (cleanUrl === '/raw-materials' && httpMethod === 'GET') {
    return getStorage(STORAGE_KEYS.MATERIALS, DEMO_RAW_MATERIALS);
  }

  if (cleanUrl === '/admin/raw-materials' && httpMethod === 'POST') {
    const materials = getStorage(STORAGE_KEYS.MATERIALS, DEMO_RAW_MATERIALS);
    const newId = materials.length > 0 ? Math.max(...materials.map((m) => m.id)) + 1 : 1;
    const newMat = {
      id: newId,
      materialCode: data.materialCode || `MAT${String(newId).padStart(3, '0')}`,
      name: data.name,
      unitOfMeasure: data.unitOfMeasure || 'KG',
      costPerUnit: Number(data.costPerUnit || 0),
      reorderThreshold: Number(data.reorderThreshold || 0),
      isActive: true,
    };
    materials.unshift(newMat);
    setStorage(STORAGE_KEYS.MATERIALS, materials);
    return newMat;
  }

  if (cleanUrl.startsWith('/admin/raw-materials/') && httpMethod === 'PUT') {
    const id = Number(cleanUrl.split('/').pop());
    const materials = getStorage(STORAGE_KEYS.MATERIALS, DEMO_RAW_MATERIALS);
    const idx = materials.findIndex((m) => m.id === id);
    if (idx !== -1) {
      materials[idx] = { ...materials[idx], ...data };
      setStorage(STORAGE_KEYS.MATERIALS, materials);
      return materials[idx];
    }
    return { ...data, id };
  }

  // ---------------------------------------------------------------------------
  // 2. STORES FLEET MANAGEMENT
  // ---------------------------------------------------------------------------
  if ((cleanUrl === '/admin/stores' || cleanUrl === '/stores') && httpMethod === 'GET') {
    return getStorage(STORAGE_KEYS.STORES, DEMO_STORES);
  }

  if (cleanUrl.match(/^\/stores\/\d+$/) && httpMethod === 'GET') {
    const id = Number(cleanUrl.split('/').pop());
    const stores = getStorage(STORAGE_KEYS.STORES, DEMO_STORES);
    const store = stores.find((s) => Number(s.id) === id) || stores[0];
    return store;
  }

  if (cleanUrl === '/admin/stores' && httpMethod === 'POST') {
    const stores = getStorage(STORAGE_KEYS.STORES, DEMO_STORES);
    const newId = stores.length > 0 ? Math.max(...stores.map((s) => Number(s.id))) + 1 : 1;
    const newStore = {
      id: newId,
      storeCode: data.storeCode,
      name: data.name,
      location: data.location || 'Tamil Nadu',
      address: data.address || '',
      phone: data.phone || '',
      managerName: `Manager ${data.storeCode}`,
      isActive: true,
    };
    stores.push(newStore);
    setStorage(STORAGE_KEYS.STORES, stores);
    return newStore;
  }

  if (cleanUrl.match(/^\/admin\/stores\/\d+$/) && httpMethod === 'PUT') {
    const id = Number(cleanUrl.split('/').pop());
    const stores = getStorage(STORAGE_KEYS.STORES, DEMO_STORES);
    const idx = stores.findIndex((s) => Number(s.id) === id);
    if (idx !== -1) {
      stores[idx] = { ...stores[idx], ...data };
      setStorage(STORAGE_KEYS.STORES, stores);
      return stores[idx];
    }
    return { ...data, id };
  }

  if (cleanUrl.match(/^\/admin\/stores\/\d+\/assign-manager$/) && httpMethod === 'POST') {
    const id = Number(cleanUrl.split('/')[3]);
    const stores = getStorage(STORAGE_KEYS.STORES, DEMO_STORES);
    const users = getStorage(STORAGE_KEYS.USERS, DEMO_USERS);
    const storeIdx = stores.findIndex((s) => Number(s.id) === id);
    const manager = users.find((u) => u.id === data.managerUserId);

    if (storeIdx !== -1 && manager) {
      stores[storeIdx].managerUserId = manager.id;
      stores[storeIdx].managerName = manager.fullName;
      stores[storeIdx].managerEmail = manager.email;
      setStorage(STORAGE_KEYS.STORES, stores);
      return stores[storeIdx];
    }
    return { success: true };
  }

  if (cleanUrl.match(/^\/admin\/stores\/\d+\/status$/) && httpMethod === 'PATCH') {
    const id = Number(cleanUrl.split('/')[3]);
    const stores = getStorage(STORAGE_KEYS.STORES, DEMO_STORES);
    const idx = stores.findIndex((s) => Number(s.id) === id);
    if (idx !== -1) {
      stores[idx].isActive = !stores[idx].isActive;
      setStorage(STORAGE_KEYS.STORES, stores);
      return stores[idx];
    }
    return { success: true };
  }

  // ---------------------------------------------------------------------------
  // 3. MATERIAL DISTRIBUTIONS & DEFAULT BASELINE
  // ---------------------------------------------------------------------------
  if (cleanUrl === '/admin/distributions' && httpMethod === 'GET') {
    const storeId = Number(queryParams.storeId || 1);
    const queryDate = queryParams.date || new Date().toISOString().split('T')[0];
    const materials = getStorage(STORAGE_KEYS.MATERIALS, DEMO_RAW_MATERIALS);
    const defaults = getStorage(STORAGE_KEYS.DISTRIBUTION_DEFAULTS, {});
    const overrides = getStorage(STORAGE_KEYS.OVERRIDES, []);

    return materials.map((m) => {
      const defaultKey = `${storeId}_${m.id}`;
      const defaultQty = defaults[defaultKey] !== undefined ? defaults[defaultKey] : 15.0;
      const activeOverride = overrides.find(
        (o) => Number(o.storeId) === storeId && Number(o.materialId) === Number(m.id) && o.overrideDate === queryDate
      );
      return {
        id: m.id,
        storeId,
        materialId: m.id,
        materialCode: m.materialCode,
        materialName: m.name,
        unitOfMeasure: m.unitOfMeasure,
        defaultQuantity: defaultQty,
        effectiveQuantity: activeOverride ? activeOverride.overrideQuantity : defaultQty,
        isOverridden: !!activeOverride,
        overrideReason: activeOverride ? activeOverride.reason : null,
      };
    });
  }

  if (cleanUrl === '/admin/distributions/defaults' && httpMethod === 'PUT') {
    const defaults = getStorage(STORAGE_KEYS.DISTRIBUTION_DEFAULTS, {});
    const defaultKey = `${data.storeId}_${data.materialId}`;
    defaults[defaultKey] = Number(data.defaultQuantity);
    setStorage(STORAGE_KEYS.DISTRIBUTION_DEFAULTS, defaults);

    const history = getStorage(STORAGE_KEYS.HISTORY, []);
    const materials = getStorage(STORAGE_KEYS.MATERIALS, DEMO_RAW_MATERIALS);
    const stores = getStorage(STORAGE_KEYS.STORES, DEMO_STORES);
    const mat = materials.find((m) => Number(m.id) === Number(data.materialId));
    const st = stores.find((s) => Number(s.id) === Number(data.storeId));

    history.unshift({
      id: Date.now(),
      storeCode: st ? st.storeCode : `S00${data.storeId}`,
      storeName: st ? st.name : 'Store',
      materialName: mat ? mat.name : 'Material',
      unitOfMeasure: mat ? mat.unitOfMeasure : 'KG',
      effectiveDate: new Date().toISOString().split('T')[0],
      previousQuantity: 15.0,
      newQuantity: Number(data.defaultQuantity),
      changeType: 'DEFAULT_UPDATE',
      reason: data.reason || 'Central Admin baseline adjustment',
      changedByName: 'Central Executive Admin',
      createdAt: new Date().toISOString(),
    });
    setStorage(STORAGE_KEYS.HISTORY, history);

    return { success: true, ...data };
  }

  if (cleanUrl === '/admin/distributions/overrides' && httpMethod === 'POST') {
    const overrides = getStorage(STORAGE_KEYS.OVERRIDES, []);
    overrides.push({ id: Date.now(), ...data });
    setStorage(STORAGE_KEYS.OVERRIDES, overrides);

    const history = getStorage(STORAGE_KEYS.HISTORY, []);
    const materials = getStorage(STORAGE_KEYS.MATERIALS, DEMO_RAW_MATERIALS);
    const stores = getStorage(STORAGE_KEYS.STORES, DEMO_STORES);
    const mat = materials.find((m) => Number(m.id) === Number(data.materialId));
    const st = stores.find((s) => Number(s.id) === Number(data.storeId));

    history.unshift({
      id: Date.now(),
      storeCode: st ? st.storeCode : `S00${data.storeId}`,
      storeName: st ? st.name : 'Store',
      materialName: mat ? mat.name : 'Material',
      unitOfMeasure: mat ? mat.unitOfMeasure : 'KG',
      effectiveDate: data.overrideDate,
      previousQuantity: 15.0,
      newQuantity: Number(data.overrideQuantity),
      changeType: 'OVERRIDE',
      reason: data.reason || 'Single Day Demand Surge',
      changedByName: 'Central Executive Admin',
      createdAt: new Date().toISOString(),
    });
    setStorage(STORAGE_KEYS.HISTORY, history);

    return { success: true, ...data };
  }

  if (cleanUrl === '/admin/distributions/history' && httpMethod === 'GET') {
    return getStorage(STORAGE_KEYS.HISTORY, [
      {
        id: 1,
        storeCode: 'S001',
        storeName: 'Annam Anna Nagar',
        materialName: 'Rice',
        unitOfMeasure: 'KG',
        effectiveDate: new Date().toISOString().split('T')[0],
        previousQuantity: 10,
        newQuantity: 25,
        changeType: 'OVERRIDE',
        reason: 'Weekend replenishment demand',
        changedByName: 'Central Executive Admin',
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  // ---------------------------------------------------------------------------
  // 4. MANAGER MATERIAL CHANGE REQUESTS & ADMIN REVIEW FLOW (Strict Store Isolation)
  // ---------------------------------------------------------------------------
  if (cleanUrl.includes('/inventory/change-requests') && httpMethod === 'GET') {
    const parts = cleanUrl.split('/');
    const storeIdx = parts.indexOf('stores');
    const storeSegment = storeIdx !== -1 && parts[storeIdx + 1] ? parts[storeIdx + 1] : '1';
    const numPart = String(storeSegment).match(/\d+/);
    const storeId = numPart ? parseInt(numPart[0], 10) : 1;
    const requests = getStorage(STORAGE_KEYS.CHANGE_REQUESTS, DEMO_CHANGE_REQUESTS);
    return requests.filter((r) => Number(r.storeId) === storeId);
  }

  if (cleanUrl.includes('/inventory/change-request') && !cleanUrl.includes('/change-requests') && httpMethod === 'POST') {
    const parts = cleanUrl.split('/');
    const storeIdx = parts.indexOf('stores');
    const storeSegment = storeIdx !== -1 && parts[storeIdx + 1] ? parts[storeIdx + 1] : '1';
    const numPart = String(storeSegment).match(/\d+/);
    const storeId = numPart ? parseInt(numPart[0], 10) : 1;

    const reqData = data || {};
    const requests = getStorage(STORAGE_KEYS.CHANGE_REQUESTS, DEMO_CHANGE_REQUESTS);
    const materials = getStorage(STORAGE_KEYS.MATERIALS, DEMO_RAW_MATERIALS);
    const stores = getStorage(STORAGE_KEYS.STORES, DEMO_STORES);
    const defaults = getStorage(STORAGE_KEYS.DISTRIBUTION_DEFAULTS, {});

    const mat = materials.find((m) => Number(m.id) === Number(reqData.materialId)) || materials[0];
    const st = stores.find((s) => Number(s.id) === storeId) || stores[0];
    const defaultQty = defaults[`${storeId}_${mat?.id}`] !== undefined ? defaults[`${storeId}_${mat?.id}`] : 15.0;

    const formattedCode = st ? st.storeCode : (storeId < 10 ? `S00${storeId}` : `S0${storeId}`);

    const newReq = {
      id: requests.length > 0 ? Math.max(...requests.map((r) => Number(r.id) || 0)) + 1 : 1,
      storeId,
      storeCode: formattedCode,
      storeName: st ? st.name : `Annam Branch #${storeId}`,
      managerName: st ? (st.managerName || `Manager ${formattedCode}`) : `Manager (${formattedCode})`,
      materialId: mat ? mat.id : (Number(reqData.materialId) || 1),
      materialName: mat ? mat.name : 'Material',
      unitOfMeasure: mat ? mat.unitOfMeasure : 'KG',
      defaultQuantity: defaultQty,
      requestedQuantity: Number(reqData.requestedQuantity || 20),
      reason: reqData.reason || 'Store replenishment demand',
      status: 'PENDING',
      requestDate: reqData.requestDate || new Date().toISOString().split('T')[0],
      adminRemarks: null,
      createdAt: new Date().toISOString(),
    };

    requests.unshift(newReq);
    setStorage(STORAGE_KEYS.CHANGE_REQUESTS, requests);
    return newReq;
  }

  if (cleanUrl === '/admin/distributions/change-requests' && httpMethod === 'GET') {
    const requests = getStorage(STORAGE_KEYS.CHANGE_REQUESTS, DEMO_CHANGE_REQUESTS);
    return requests.filter((r) => r.status === 'PENDING');
  }

  if (cleanUrl.match(/^\/admin\/distributions\/change-requests\/\d+\/review$/) && httpMethod === 'PUT') {
    const requestId = Number(cleanUrl.split('/')[4]);
    const requests = getStorage(STORAGE_KEYS.CHANGE_REQUESTS, DEMO_CHANGE_REQUESTS);
    const req = requests.find((r) => r.id === requestId);

    if (req) {
      req.status = data.status || 'APPROVED';
      req.adminRemarks = data.adminRemarks || (req.status === 'APPROVED' ? 'Approved by Admin' : 'Rejected by Admin');
      req.reviewedByName = 'Central Executive Admin';
      req.reviewedAt = new Date().toISOString();
      setStorage(STORAGE_KEYS.CHANGE_REQUESTS, requests);

      if (req.status === 'APPROVED') {
        const overrides = getStorage(STORAGE_KEYS.OVERRIDES, []);
        overrides.push({
          id: Date.now(),
          storeId: req.storeId || 1,
          materialId: req.materialId || 1,
          overrideDate: req.requestDate || new Date().toISOString().split('T')[0],
          overrideQuantity: req.requestedQuantity,
          reason: `Approved request #${requestId}: ${req.reason}`,
        });
        setStorage(STORAGE_KEYS.OVERRIDES, overrides);
      }

      const history = getStorage(STORAGE_KEYS.HISTORY, []);
      history.unshift({
        id: Date.now(),
        storeCode: req.storeCode,
        storeName: req.storeName,
        materialName: req.materialName,
        unitOfMeasure: req.unitOfMeasure,
        effectiveDate: req.requestDate,
        previousQuantity: req.defaultQuantity,
        newQuantity: req.requestedQuantity,
        changeType: req.status === 'APPROVED' ? 'APPROVED_REQUEST' : 'REJECTED_REQUEST',
        reason: `${req.reason} (Admin: ${req.adminRemarks})`,
        changedByName: 'Central Executive Admin',
        createdAt: new Date().toISOString(),
      });
      setStorage(STORAGE_KEYS.HISTORY, history);

      return req;
    }
    return { id: requestId, status: data.status || 'APPROVED' };
  }

  // ---------------------------------------------------------------------------
  // 5. WORKFORCE, DAILY ATTENDANCE & MANAGER LEAVE REQUESTS
  // ---------------------------------------------------------------------------

  // Admin Workforce Overview (All Stores, Dynamic)
  if ((cleanUrl === '/admin/workforce/overview' || cleanUrl === '/admin/workforce/summary') && httpMethod === 'GET') {
    const stores = getStorage(STORAGE_KEYS.STORES, DEMO_STORES);
    const targetDate = String(queryParams.date || new Date().toISOString().split('T')[0]).trim();
    const attendanceRecords = getStorage(STORAGE_KEYS.ATTENDANCE, []);
    const targets = getStorage(STORAGE_KEYS.WORKFORCE_TARGETS, {});

    return stores.map((s) => {
      const storeTarget = targets[s.id] || {
        targetCooks: 5,
        targetServants: 4,
        targetWaiters: 4,
        targetCleaners: 2,
        targetBillers: 1,
        targetManagers: 1,
        totalTargetStaff: 17,
      };

      // Match by storeId (numeric comparison) OR storeCode, matching query date
      const att = attendanceRecords.find(
        (a) =>
          (Number(a.storeId) === Number(s.id) || String(a.storeCode).toUpperCase() === String(s.storeCode).toUpperCase()) &&
          String(a.attendanceDate).trim() === targetDate
      );

      const presentCooks = att ? Number(att.presentCooks || 0) : 0;
      const presentServants = att ? Number(att.presentServants || 0) : 0;
      const presentWaiters = att ? Number(att.presentWaiters || 0) : 0;
      const presentCleaners = att ? Number(att.presentCleaners || 0) : 0;
      const presentBillers = att ? Number(att.presentBillers || 0) : 0;
      const presentManagers = att ? Number(att.presentManagers || 0) : 0;
      const totalPresent = presentCooks + presentServants + presentWaiters + presentCleaners + presentBillers + presentManagers;

      return {
        storeId: s.id,
        storeCode: s.storeCode,
        storeName: s.name,
        presentCooks,
        targetCooks: storeTarget.targetCooks,
        presentServants,
        targetServants: storeTarget.targetServants,
        presentWaiters,
        targetWaiters: storeTarget.targetWaiters,
        presentCleaners,
        targetCleaners: storeTarget.targetCleaners,
        presentBillers,
        targetBillers: storeTarget.targetBillers,
        presentManagers,
        targetManagers: storeTarget.targetManagers,
        totalPresentStaff: totalPresent,
        totalTargetStaff: storeTarget.totalTargetStaff || 17,
        staffingStatus: !att ? 'PENDING_LOG' : (totalPresent < 10 ? 'SHORTAGE_ALERT' : 'OPTIMAL'),
      };
    });
  }

  // Admin sets workforce baseline target
  if (cleanUrl.match(/^\/admin\/stores\/\d+\/workforce\/target$/) && httpMethod === 'PUT') {
    const storeId = Number(cleanUrl.split('/')[3]);
    const targets = getStorage(STORAGE_KEYS.WORKFORCE_TARGETS, {});
    const total =
      Number(data.targetCooks || 0) +
      Number(data.targetServants || 0) +
      Number(data.targetWaiters || 0) +
      Number(data.targetCleaners || 0) +
      Number(data.targetBillers || 0) +
      Number(data.targetManagers || 0);

    targets[storeId] = {
      ...data,
      totalTargetStaff: total,
    };
    setStorage(STORAGE_KEYS.WORKFORCE_TARGETS, targets);
    return { success: true, ...targets[storeId] };
  }

  // Manager: GET own store target
  if (cleanUrl.match(/^\/stores\/\d+\/workforce\/target$/) && httpMethod === 'GET') {
    const storeId = Number(cleanUrl.split('/')[2]);
    const stores = getStorage(STORAGE_KEYS.STORES, DEMO_STORES);
    const targets = getStorage(STORAGE_KEYS.WORKFORCE_TARGETS, {});
    const st = stores.find((s) => Number(s.id) === storeId) || stores[0];

    const target = targets[storeId] || {
      targetCooks: 5,
      targetServants: 4,
      targetWaiters: 4,
      targetCleaners: 2,
      targetBillers: 1,
      targetManagers: 1,
      totalTargetStaff: 17,
    };

    return {
      storeId,
      storeCode: st ? st.storeCode : 'S001',
      storeName: st ? st.name : 'Store',
      ...target,
    };
  }

  // Manager: SUBMIT daily attendance
  if (cleanUrl.match(/^\/stores\/\d+\/workforce\/attendance$/) && httpMethod === 'POST') {
    const storeId = Number(cleanUrl.split('/')[2]);
    const stores = getStorage(STORAGE_KEYS.STORES, DEMO_STORES);
    const st = stores.find((s) => Number(s.id) === storeId) || stores[0];
    const attendanceRecords = getStorage(STORAGE_KEYS.ATTENDANCE, []);
    const targets = getStorage(STORAGE_KEYS.WORKFORCE_TARGETS, {});
    const target = targets[storeId] || { totalTargetStaff: 17 };

    const totalPresent =
      Number(data.presentCooks || 0) +
      Number(data.presentServants || 0) +
      Number(data.presentWaiters || 0) +
      Number(data.presentCleaners || 0) +
      Number(data.presentBillers || 0) +
      Number(data.presentManagers || 0);

    const record = {
      id: Date.now(),
      storeId: Number(storeId),
      storeCode: st ? st.storeCode : `S00${storeId}`,
      storeName: st ? st.name : 'Store',
      attendanceDate: String(data.attendanceDate || new Date().toISOString().split('T')[0]).trim(),
      presentCooks: Number(data.presentCooks || 0),
      presentServants: Number(data.presentServants || 0),
      presentWaiters: Number(data.presentWaiters || 0),
      presentCleaners: Number(data.presentCleaners || 0),
      presentBillers: Number(data.presentBillers || 0),
      presentManagers: Number(data.presentManagers || 0),
      totalPresentStaff: totalPresent,
      totalTargetStaff: target.totalTargetStaff || 17,
      staffingStatus: totalPresent < 10 ? 'SHORTAGE_ALERT' : 'OPTIMAL',
      notes: data.notes || '',
      submittedAt: new Date().toISOString(),
    };

    const existingIdx = attendanceRecords.findIndex(
      (a) => Number(a.storeId) === Number(storeId) && String(a.attendanceDate).trim() === record.attendanceDate
    );
    if (existingIdx !== -1) {
      attendanceRecords[existingIdx] = record;
    } else {
      attendanceRecords.unshift(record);
    }

    setStorage(STORAGE_KEYS.ATTENDANCE, attendanceRecords);
    return record;
  }

  // Manager: GET attendance history
  if (cleanUrl.match(/^\/stores\/\d+\/workforce\/attendance\/history$/) && httpMethod === 'GET') {
    const storeId = Number(cleanUrl.split('/')[2]);
    const records = getStorage(STORAGE_KEYS.ATTENDANCE, []);
    const storeRecords = records.filter((r) => Number(r.storeId) === storeId);
    if (storeRecords.length === 0) {
      return [
        {
          id: 1,
          storeId,
          attendanceDate: new Date().toISOString().split('T')[0],
          presentCooks: 5,
          presentServants: 4,
          presentWaiters: 4,
          presentCleaners: 2,
          presentBillers: 1,
          presentManagers: 1,
          totalPresentStaff: 17,
          totalTargetStaff: 17,
          staffingStatus: 'OPTIMAL',
          notes: 'Optimal store baseline strength',
        },
      ];
    }
    return storeRecords;
  }

  // Manager: GET manager leaves for own store
  if (cleanUrl.match(/^\/stores\/\d+\/manager-leave$/) && httpMethod === 'GET') {
    const storeId = Number(cleanUrl.split('/')[2]);
    const leaves = getStorage(STORAGE_KEYS.LEAVE_REQUESTS, []);
    return leaves.filter((l) => Number(l.storeId) === storeId);
  }

  // Manager: SUBMIT manager leave
  if (cleanUrl.match(/^\/stores\/\d+\/manager-leave$/) && httpMethod === 'POST') {
    const storeId = Number(cleanUrl.split('/')[2]);
    const stores = getStorage(STORAGE_KEYS.STORES, DEMO_STORES);
    const st = stores.find((s) => Number(s.id) === storeId) || stores[0];
    const leaves = getStorage(STORAGE_KEYS.LEAVE_REQUESTS, []);

    const newLeave = {
      id: Date.now(),
      storeId,
      storeCode: st ? st.storeCode : `S00${storeId}`,
      storeName: st ? st.name : 'Store',
      managerName: st ? st.managerName : 'Store Manager',
      startDate: data.startDate,
      endDate: data.endDate,
      leaveType: data.leaveType || 'PERSONAL_LEAVE',
      reason: data.reason,
      actingManagerNote: data.actingManagerNote || '',
      status: 'PENDING',
      adminRemarks: null,
      createdAt: new Date().toISOString(),
    };
    leaves.unshift(newLeave);
    setStorage(STORAGE_KEYS.LEAVE_REQUESTS, leaves);
    return newLeave;
  }

  // Admin: GET pending manager leaves
  if (cleanUrl === '/admin/manager-leave/pending' && httpMethod === 'GET') {
    const leaves = getStorage(STORAGE_KEYS.LEAVE_REQUESTS, []);
    const pending = leaves.filter((l) => l.status === 'PENDING');
    if (pending.length === 0) {
      return [
        {
          id: 101,
          storeId: 1,
          storeCode: 'S001',
          storeName: 'Annam Anna Nagar',
          managerName: 'K. Senthil Kumar',
          startDate: '2026-11-15',
          endDate: '2026-11-17',
          leaveType: 'PERSONAL_LEAVE',
          reason: 'Family wedding event',
          actingManagerNote: 'Assistant manager will oversee shift operations',
          status: 'PENDING',
          adminRemarks: null,
        },
      ];
    }
    return pending;
  }

  // Admin: REVIEW manager leave (Approve / Reject)
  if (cleanUrl.match(/^\/admin\/manager-leave\/\d+\/review$/) && httpMethod === 'PUT') {
    const leaveId = Number(cleanUrl.split('/')[3]);
    const leaves = getStorage(STORAGE_KEYS.LEAVE_REQUESTS, []);
    const l = leaves.find((item) => item.id === leaveId);
    if (l) {
      l.status = data.status || 'APPROVED';
      l.adminRemarks = data.adminRemarks || 'Approved by Central Admin';
      setStorage(STORAGE_KEYS.LEAVE_REQUESTS, leaves);
      return l;
    }
    return { id: leaveId, status: data.status || 'APPROVED' };
  }

  // ---------------------------------------------------------------------------
  // 6. STORE CLOSURE REQUESTS
  // ---------------------------------------------------------------------------
  if (cleanUrl.match(/^\/stores\/\d+\/closure-requests$/) && httpMethod === 'GET') {
    const storeId = Number(cleanUrl.split('/')[2]);
    const closures = getStorage(STORAGE_KEYS.CLOSURE_REQUESTS, []);
    return closures.filter((c) => Number(c.storeId) === storeId);
  }

  if (cleanUrl.match(/^\/stores\/\d+\/closure-requests$/) && httpMethod === 'POST') {
    const storeId = Number(cleanUrl.split('/')[2]);
    const stores = getStorage(STORAGE_KEYS.STORES, DEMO_STORES);
    const st = stores.find((s) => Number(s.id) === storeId) || stores[0];
    const closures = getStorage(STORAGE_KEYS.CLOSURE_REQUESTS, []);
    const newClosure = {
      id: Date.now(),
      storeId,
      storeCode: st ? st.storeCode : `S00${storeId}`,
      storeName: st ? st.name : 'Store',
      closureDate: data.closureDate,
      reason: data.reason,
      status: 'PENDING',
      adminRemarks: null,
      createdAt: new Date().toISOString(),
    };
    closures.unshift(newClosure);
    setStorage(STORAGE_KEYS.CLOSURE_REQUESTS, closures);
    return newClosure;
  }

  if (cleanUrl === '/admin/closure-requests/pending') {
    const closures = getStorage(STORAGE_KEYS.CLOSURE_REQUESTS, []);
    return closures.length > 0 ? closures : DEMO_PENDING_CLOSURES;
  }

  // ---------------------------------------------------------------------------
  // 7. MANAGER INVENTORY & USAGE
  // ---------------------------------------------------------------------------
  if (cleanUrl.match(/^\/stores\/\d+\/inventory$/) && httpMethod === 'GET') {
    const materials = getStorage(STORAGE_KEYS.MATERIALS, DEMO_RAW_MATERIALS);
    return materials.map((m) => ({
      id: m.id,
      materialId: m.id,
      materialCode: m.materialCode,
      materialName: m.name,
      currentStock: 25.0,
      reorderThreshold: m.reorderThreshold,
      unitOfMeasure: m.unitOfMeasure,
      isLowStock: false,
    }));
  }

  if (cleanUrl.match(/^\/stores\/\d+\/inventory\/distribution$/) && httpMethod === 'GET') {
    const storeId = Number(cleanUrl.split('/')[2]);
    const queryDate = queryParams.date || new Date().toISOString().split('T')[0];
    const materials = getStorage(STORAGE_KEYS.MATERIALS, DEMO_RAW_MATERIALS);
    const defaults = getStorage(STORAGE_KEYS.DISTRIBUTION_DEFAULTS, {});
    const overrides = getStorage(STORAGE_KEYS.OVERRIDES, []);

    return materials.map((m) => {
      const defaultKey = `${storeId}_${m.id}`;
      const defaultQty = defaults[defaultKey] !== undefined ? defaults[defaultKey] : 15.0;
      const activeOverride = overrides.find(
        (o) => Number(o.storeId) === storeId && Number(o.materialId) === Number(m.id) && o.overrideDate === queryDate
      );
      return {
        materialId: m.id,
        materialCode: m.materialCode,
        materialName: m.name,
        unitOfMeasure: m.unitOfMeasure,
        effectiveQuantity: activeOverride ? activeOverride.overrideQuantity : defaultQty,
      };
    });
  }

  if (cleanUrl.match(/^\/stores\/\d+\/inventory\/daily-update$/) && httpMethod === 'POST') {
    const updates = getStorage(STORAGE_KEYS.INVENTORY_UPDATES, []);
    updates.push({ id: Date.now(), ...data, submittedAt: new Date().toISOString() });
    setStorage(STORAGE_KEYS.INVENTORY_UPDATES, updates);
    return { success: true, count: data.items?.length || 0 };
  }

  // ---------------------------------------------------------------------------
  // 8. SALES & MENU CATALOG
  // ---------------------------------------------------------------------------
  if (cleanUrl === '/menu-items') {
    return DEMO_ITEM_RANKINGS.map((i) => ({
      id: i.rank,
      itemCode: i.itemCode,
      name: i.itemName,
      category: i.category,
      unitPrice: i.unitPrice,
      isActive: true,
    }));
  }

  if (cleanUrl.match(/^\/stores\/\d+\/sales\/daily$/) && httpMethod === 'POST') {
    const sales = getStorage(STORAGE_KEYS.SALES, DEMO_MANAGER_SALES);
    const newSale = {
      id: Date.now(),
      saleDate: data.saleDate || new Date().toISOString().split('T')[0],
      totalItemsSold: data.items ? data.items.reduce((acc, i) => acc + (i.quantity || 0), 0) : 50,
      totalAmount: 12500,
      submittedByName: 'Store Manager',
    };
    sales.unshift(newSale);
    setStorage(STORAGE_KEYS.SALES, sales);
    return newSale;
  }

  if (cleanUrl.match(/^\/stores\/\d+\/sales\/recent$/) || cleanUrl.match(/^\/stores\/\d+\/sales\/history$/)) {
    return getStorage(STORAGE_KEYS.SALES, DEMO_MANAGER_SALES);
  }

  // ---------------------------------------------------------------------------
  // 9. BUDGETS & EXPENSES (Dynamic Stores)
  // ---------------------------------------------------------------------------
  if (cleanUrl === '/admin/budgets' && httpMethod === 'GET') {
    const month = queryParams.monthYear || '2026-08';
    const stores = getStorage(STORAGE_KEYS.STORES, DEMO_STORES);
    const budgetsMap = getStorage(STORAGE_KEYS.BUDGETS, {});

    return stores.map((s, idx) => {
      const budgetKey = `${s.id}_${month}`;
      const customAmount = budgetsMap[budgetKey];
      return {
        id: idx + 1,
        storeId: s.id,
        storeCode: s.storeCode,
        storeName: s.name,
        monthYear: month,
        allocatedBudget: customAmount !== undefined ? customAmount : (150000 + idx * 10000),
        createdByName: 'Central Executive Admin',
      };
    });
  }

  if (cleanUrl === '/admin/budgets' && httpMethod === 'POST') {
    const budgetsMap = getStorage(STORAGE_KEYS.BUDGETS, {});
    const storeId = queryParams.storeId || data?.storeId;
    const month = queryParams.monthYear || data?.monthYear || '2026-08';
    const amount = Number(queryParams.amount || data?.amount || 150000);

    const budgetKey = `${storeId}_${month}`;
    budgetsMap[budgetKey] = amount;
    setStorage(STORAGE_KEYS.BUDGETS, budgetsMap);

    return { success: true, storeId, monthYear: month, allocatedBudget: amount };
  }

  // ---------------------------------------------------------------------------
  // 10. USERS & AUDIT LOGS
  // ---------------------------------------------------------------------------
  if (cleanUrl === '/admin/users' && httpMethod === 'GET') {
    return getStorage(STORAGE_KEYS.USERS, DEMO_USERS);
  }

  if (cleanUrl === '/admin/users' && httpMethod === 'POST') {
    const users = getStorage(STORAGE_KEYS.USERS, DEMO_USERS);
    const newUser = {
      id: users.length + 1,
      username: data.username,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber || '',
      role: data.role || 'ROLE_MANAGER',
      isActive: true,
    };
    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);
    return newUser;
  }

  if (cleanUrl === '/admin/audit-logs' && httpMethod === 'GET') {
    return [
      { id: 1, action: 'USER_LOGIN', entityName: 'User', entityId: '1', performedBy: 'admin', timestamp: new Date().toISOString(), details: 'Admin logged into portal' },
      { id: 2, action: 'CREATE_RAW_MATERIAL', entityName: 'RawMaterial', entityId: '10', performedBy: 'admin', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'Added new material' },
    ];
  }

  // ---------------------------------------------------------------------------
  // 11. ANALYTICS & EXECUTIVE DASHBOARD
  // ---------------------------------------------------------------------------
  if (cleanUrl === '/admin/analytics/dashboard-kpis') {
    return DEMO_ADMIN_KPIS;
  }
  if (cleanUrl === '/admin/analytics/revenue-by-store') {
    return DEMO_REVENUE_BY_STORE;
  }
  if (cleanUrl === '/admin/analytics/item-sales-ranking') {
    return DEMO_ITEM_RANKINGS;
  }

  return { success: true, message: 'Operation recorded successfully' };
}
