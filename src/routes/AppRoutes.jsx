import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import StoreListPage from '../pages/admin/StoreListPage';
import StoreDetailPage from '../pages/admin/StoreDetailPage';
import AdminWorkforcePage from '../pages/admin/AdminWorkforcePage';
import RawMaterialPage from '../pages/admin/RawMaterialPage';
import DistributionPage from '../pages/admin/DistributionPage';
import AdminSalesPage from '../pages/admin/AdminSalesPage';
import ProfitAnalysisPage from '../pages/admin/ProfitAnalysisPage';
import BudgetExpensePage from '../pages/admin/BudgetExpensePage';
import AuditLogPage from '../pages/admin/AuditLogPage';
import UserManagementPage from '../pages/admin/UserManagementPage';

// Store Manager Pages
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import ManagerWorkforcePage from '../pages/manager/ManagerWorkforcePage';
import DailyInventoryPage from '../pages/manager/DailyInventoryPage';
import ChangeRequestPage from '../pages/manager/ChangeRequestPage';
import DailySalesPage from '../pages/manager/DailySalesPage';
import ManagerStoreAnalysisPage from '../pages/manager/ManagerStoreAnalysisPage';

const MainLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

const RootRedirect = () => {
  const { user, isAdmin, isManager } = useAuth();
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (isManager) return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<RootRedirect />} />

        {/* ADMIN ROUTES */}
        <Route element={<RoleRoute requiredRole="ROLE_ADMIN" />}>
          <Route path="/admin/dashboard" element={<MainLayout><AdminDashboard /></MainLayout>} />
          <Route path="/admin/stores" element={<MainLayout><StoreListPage /></MainLayout>} />
          <Route path="/admin/stores/:id" element={<MainLayout><StoreDetailPage /></MainLayout>} />
          <Route path="/admin/workforce" element={<MainLayout><AdminWorkforcePage /></MainLayout>} />
          <Route path="/admin/materials" element={<MainLayout><RawMaterialPage /></MainLayout>} />
          <Route path="/admin/distribution" element={<MainLayout><DistributionPage /></MainLayout>} />
          <Route path="/admin/sales" element={<MainLayout><AdminSalesPage /></MainLayout>} />
          <Route path="/admin/profit" element={<MainLayout><ProfitAnalysisPage /></MainLayout>} />
          <Route path="/admin/budgets" element={<MainLayout><BudgetExpensePage /></MainLayout>} />
          <Route path="/admin/audit-logs" element={<MainLayout><AuditLogPage /></MainLayout>} />
          <Route path="/admin/users" element={<MainLayout><UserManagementPage /></MainLayout>} />
        </Route>

        {/* STORE MANAGER ROUTES */}
        <Route element={<RoleRoute requiredRole="ROLE_MANAGER" />}>
          <Route path="/manager/dashboard" element={<MainLayout><ManagerDashboard /></MainLayout>} />
          <Route path="/manager/workforce" element={<MainLayout><ManagerWorkforcePage /></MainLayout>} />
          <Route path="/manager/inventory" element={<MainLayout><DailyInventoryPage /></MainLayout>} />
          <Route path="/manager/change-requests" element={<MainLayout><ChangeRequestPage /></MainLayout>} />
          <Route path="/manager/sales" element={<MainLayout><DailySalesPage /></MainLayout>} />
          <Route path="/manager/analysis" element={<MainLayout><ManagerStoreAnalysisPage /></MainLayout>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
