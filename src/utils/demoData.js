// Comprehensive Demo Data for Vercel Standalone & Demo Mode

export const DEMO_STORES = [
  { id: 1, storeCode: 'S001', name: 'Annam Anna Nagar', location: 'Chennai', address: 'Anna Nagar West, Chennai', phone: '044-26210001', managerName: 'Manager S001', isActive: true },
  { id: 2, storeCode: 'S002', name: 'Annam Adyar', location: 'Chennai', address: 'LB Road, Adyar, Chennai', phone: '044-24410002', managerName: 'Manager S002', isActive: true },
  { id: 3, storeCode: 'S003', name: 'Annam T. Nagar', location: 'Chennai', address: 'Usman Road, T. Nagar, Chennai', phone: '044-28150003', managerName: 'Manager S003', isActive: true },
  { id: 4, storeCode: 'S004', name: 'Annam Velachery', location: 'Chennai', address: '100 Feet Road, Velachery, Chennai', phone: '044-22430004', managerName: 'Manager S004', isActive: true },
  { id: 5, storeCode: 'S005', name: 'Annam OMR', location: 'Chennai', address: 'Perungudi, OMR, Chennai', phone: '044-24960005', managerName: 'Manager S005', isActive: true },
  { id: 6, storeCode: 'S006', name: 'Annam Porur', location: 'Chennai', address: 'Mount Poonamallee Rd, Porur, Chennai', phone: '044-24760006', managerName: 'Manager S006', isActive: true },
  { id: 7, storeCode: 'S007', name: 'Annam Tambaram', location: 'Chennai', address: 'GST Road, Tambaram, Chennai', phone: '044-22260007', managerName: 'Manager S007', isActive: true },
  { id: 8, storeCode: 'S008', name: 'Annam Coimbatore Main', location: 'Coimbatore', address: 'DB Road, RS Puram, Coimbatore', phone: '0422-2540008', managerName: 'Manager S008', isActive: true },
  { id: 9, storeCode: 'S009', name: 'Annam Gandhipuram', location: 'Coimbatore', address: 'Cross Cut Rd, Gandhipuram, Coimbatore', phone: '0422-2520009', managerName: 'Manager S009', isActive: true },
  { id: 10, storeCode: 'S010', name: 'Annam Peelamedu', location: 'Coimbatore', address: 'Avinashi Road, Peelamedu, Coimbatore', phone: '0422-2570010', managerName: 'Manager S010', isActive: true },
  { id: 11, storeCode: 'S011', name: 'Annam Madurai Town', location: 'Madurai', address: 'Town Hall Road, Madurai', phone: '0452-2340011', managerName: 'Manager S011', isActive: true },
  { id: 12, storeCode: 'S012', name: 'Annam Trichy Junction', location: 'Trichy', address: 'Cantonment, Trichy', phone: '0431-2410012', managerName: 'Manager S012', isActive: true },
  { id: 13, storeCode: 'S013', name: 'Annam Salem Central', location: 'Salem', address: 'Five Roads, Salem', phone: '0427-2440013', managerName: 'Manager S013', isActive: true },
  { id: 14, storeCode: 'S014', name: 'Annam Tiruppur', location: 'Tiruppur', address: 'Avinashi Road, Tiruppur', phone: '0421-2230014', managerName: 'Manager S014', isActive: true },
  { id: 15, storeCode: 'S015', name: 'Annam Pondicherry', location: 'Pondicherry', address: 'Mission Street, Pondicherry', phone: '0413-2330015', managerName: 'Manager S015', isActive: true }
];

export const DEMO_ADMIN_KPIS = {
  totalStores: 15,
  activeStores: 15,
  closedStoresTodayCount: 0,
  closedStoresTodayNames: [],
  todayRevenue: 487500,
  todayMaterialCost: 195000,
  todayNetProfit: 212500,
  pendingChangeRequests: 3,
  lowStockAlertsCount: 2,
  highestRevenueStoreName: 'Annam T. Nagar (S003)',
  highestRevenueAmount: 48500
};

export const DEMO_REVENUE_BY_STORE = DEMO_STORES.map((s, idx) => ({
  storeCode: s.storeCode,
  storeName: s.name,
  revenue: 25000 + (idx * 1650)
}));

export const DEMO_ITEM_RANKINGS = [
  { rank: 1, itemCode: 'ITM001', itemName: 'Ghee Roast Dosa', category: 'Tiffin', unitsSold: 1420, unitPrice: 80, revenue: 113600 },
  { rank: 2, itemCode: 'ITM005', itemName: 'South Indian Full Meals', category: 'Meals', unitsSold: 780, unitPrice: 150, revenue: 117000 },
  { rank: 3, itemCode: 'ITM007', itemName: 'Filter Coffee', category: 'Beverages', unitsSold: 2850, unitPrice: 30, revenue: 85500 },
  { rank: 4, itemCode: 'ITM002', itemName: 'Plain Idly (2 Pcs)', category: 'Tiffin', unitsSold: 1980, unitPrice: 30, revenue: 59400 },
  { rank: 5, itemCode: 'ITM003', itemName: 'Medu Vada', category: 'Tiffin', unitsSold: 1350, unitPrice: 35, revenue: 47250 },
  { rank: 6, itemCode: 'ITM010', itemName: 'Paneer Butter Masala', category: 'Main Course', unitsSold: 240, unitPrice: 180, revenue: 43200 },
  { rank: 7, itemCode: 'ITM004', itemName: 'Poori Masala', category: 'Tiffin', unitsSold: 520, unitPrice: 65, revenue: 33800 }
];

export const DEMO_PENDING_CLOSURES = [];

export const DEMO_RAW_MATERIALS = [
  { id: 1, materialCode: 'MAT001', name: 'Rice', unitOfMeasure: 'KG', costPerUnit: 55.00, reorderThreshold: 20.000, isActive: true },
  { id: 2, materialCode: 'MAT002', name: 'Toor Dal', unitOfMeasure: 'KG', costPerUnit: 140.00, reorderThreshold: 15.000, isActive: true },
  { id: 3, materialCode: 'MAT003', name: 'Cooking Oil', unitOfMeasure: 'LITRE', costPerUnit: 130.00, reorderThreshold: 10.000, isActive: true },
  { id: 4, materialCode: 'MAT004', name: 'Fresh Vegetables', unitOfMeasure: 'KG', costPerUnit: 40.00, reorderThreshold: 25.000, isActive: true },
  { id: 5, materialCode: 'MAT005', name: 'Wheat Flour', unitOfMeasure: 'KG', costPerUnit: 45.00, reorderThreshold: 15.000, isActive: true },
  { id: 6, materialCode: 'MAT006', name: 'Spices Mix', unitOfMeasure: 'KG', costPerUnit: 250.00, reorderThreshold: 5.000, isActive: true },
  { id: 7, materialCode: 'MAT007', name: 'Fresh Milk', unitOfMeasure: 'LITRE', costPerUnit: 50.00, reorderThreshold: 20.000, isActive: true },
  { id: 8, materialCode: 'MAT008', name: 'White Sugar', unitOfMeasure: 'KG', costPerUnit: 48.00, reorderThreshold: 15.000, isActive: true },
  { id: 9, materialCode: 'MAT016', name: 'Pure Cooking Ghee', unitOfMeasure: 'KG', costPerUnit: 620.00, reorderThreshold: 4.000, isActive: true },
  { id: 10, materialCode: 'MAT018', name: 'Filter Coffee Powder', unitOfMeasure: 'KG', costPerUnit: 540.00, reorderThreshold: 5.000, isActive: true }
];

export const DEMO_MANAGER_INVENTORY = [
  { id: 1, materialCode: 'MAT001', materialName: 'Rice', currentStock: 45.5, reorderThreshold: 20.0, unitOfMeasure: 'KG', isLowStock: false },
  { id: 2, materialCode: 'MAT002', materialName: 'Toor Dal', currentStock: 12.0, reorderThreshold: 15.0, unitOfMeasure: 'KG', isLowStock: true },
  { id: 3, materialCode: 'MAT003', materialName: 'Cooking Oil', currentStock: 25.0, reorderThreshold: 10.0, unitOfMeasure: 'LITRE', isLowStock: false },
  { id: 4, materialCode: 'MAT004', materialName: 'Fresh Vegetables', currentStock: 30.0, reorderThreshold: 25.0, unitOfMeasure: 'KG', isLowStock: false },
  { id: 5, materialCode: 'MAT005', materialName: 'Wheat Flour', currentStock: 8.5, reorderThreshold: 15.0, unitOfMeasure: 'KG', isLowStock: true },
  { id: 6, materialCode: 'MAT007', materialName: 'Fresh Milk', currentStock: 50.0, reorderThreshold: 20.0, unitOfMeasure: 'LITRE', isLowStock: false },
  { id: 7, materialCode: 'MAT016', materialName: 'Pure Cooking Ghee', currentStock: 15.0, reorderThreshold: 4.0, unitOfMeasure: 'KG', isLowStock: false },
  { id: 8, materialCode: 'MAT018', materialName: 'Filter Coffee Powder', currentStock: 9.0, reorderThreshold: 5.0, unitOfMeasure: 'KG', isLowStock: false }
];

export const DEMO_MANAGER_SALES = [
  { id: 101, saleDate: new Date().toISOString().split('T')[0], totalItemsSold: 420, totalAmount: 34500, submittedByName: 'Manager S001' },
  { id: 100, saleDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], totalItemsSold: 395, totalAmount: 31800, submittedByName: 'Manager S001' },
  { id: 99, saleDate: new Date(Date.now() - 172800000).toISOString().split('T')[0], totalItemsSold: 410, totalAmount: 33200, submittedByName: 'Manager S001' }
];

export const DEMO_ADMIN_SALES = DEMO_STORES.map((s, idx) => ({
  storeCode: s.storeCode,
  storeName: s.name,
  saleDate: new Date().toISOString().split('T')[0],
  totalItemsSold: 320 + (idx * 25),
  totalAmount: 25000 + (idx * 1650),
  submittedByName: `Manager ${s.storeCode}`
}));

export const DEMO_WORKFORCE_SUMMARY = {
  totalTargetStaff: 255,
  totalPresentStaff: 248,
  attendancePercentage: 97.2,
  storeCount: 15
};

export const DEMO_DISTRIBUTIONS = DEMO_STORES.map((s) => ({
  storeId: s.id,
  storeCode: s.storeCode,
  storeName: s.name,
  items: DEMO_RAW_MATERIALS.slice(0, 5).map(m => ({
    materialId: m.id,
    materialCode: m.materialCode,
    materialName: m.name,
    defaultQuantity: 15.0,
    unitOfMeasure: m.unitOfMeasure
  }))
}));

export const DEMO_CHANGE_REQUESTS = [
  { id: 1, storeCode: 'S001', storeName: 'Annam Anna Nagar', materialName: 'Rice', requestedQty: 50, currentQty: 10, unitOfMeasure: 'KG', reason: 'High weekend demand expected', status: 'PENDING', requestDate: new Date().toISOString().split('T')[0] },
  { id: 2, storeCode: 'S003', storeName: 'Annam T. Nagar', materialName: 'Pure Cooking Ghee', requestedQty: 15, currentQty: 2, unitOfMeasure: 'KG', reason: 'Low stock alert', status: 'PENDING', requestDate: new Date().toISOString().split('T')[0] },
  { id: 3, storeCode: 'S008', storeName: 'Annam Coimbatore Main', materialName: 'Filter Coffee Powder', requestedQty: 20, currentQty: 3, unitOfMeasure: 'KG', reason: 'Morning rush replenishment', status: 'PENDING', requestDate: new Date().toISOString().split('T')[0] }
];

export const DEMO_USERS = [
  { id: 1, username: 'admin', fullName: 'Central Executive Admin', role: 'ROLE_ADMIN', email: 'admin@geetham.com', phoneNumber: '9876543210', isActive: true },
  ...DEMO_STORES.map((s, idx) => ({
    id: idx + 2,
    username: `manager_${s.storeCode.toLowerCase()}`,
    fullName: `Manager ${s.name.replace('Annam ', '')}`,
    role: 'ROLE_MANAGER',
    email: `manager_${s.storeCode.toLowerCase()}@geetham.com`,
    phoneNumber: s.phone,
    isActive: true
  }))
];
