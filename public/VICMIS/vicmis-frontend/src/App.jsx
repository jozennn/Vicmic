import React, { useState, useEffect, useCallback } from 'react';
import api from './api/axios'; 
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Document from './components/Modules/Document.jsx';
import Project from './components/Modules/project/Project.jsx';
import Settings from './components/Settings.jsx';
import HRDashboard from './components/Dashboard/HR/HRDashboard.jsx'; 
import EngineeringDashboard from './components/Dashboard/Engineering/EngineeringDashboard.jsx'; 
import SalesDashboard from './components/Dashboard/Sales/SalesDashboard.jsx';
import InventoryDashboard from './components/Dashboard/Inventory/InventoryDashboard.jsx';
import InventoryEmployeeDashboard from './components/Dashboard/Inventory/InventoryEmployeeDashboard.jsx';
import AccountingDashboard from './components/Dashboard/Accounting/AccountingDashboard.jsx';
import Workforce from './components/Modules/HRM/Workforce.jsx'; 
import Customer from './components/Modules/customer/Customer.jsx';
import Inventory from './components/Modules/Inventory/Inventory.jsx';
import Login from './components/Login.jsx'
import './App.css'; 
import { Toaster } from 'react-hot-toast'; // Import remained

const App = () => {
  // --- SESSION ISOLATION ---
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');
    return (savedUser && token) ? JSON.parse(savedUser) : null;
  });
  
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [attendanceData, setAttendanceData] = useState({}); 
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshAttendance, setRefreshAttendance] = useState(false);
  const [projects, setProjects] = useState([]);

  const triggerAttendanceRefresh = () => setRefreshAttendance(prev => !prev);

  const checkAccess = useCallback((moduleName) => {
    if (!user) return false;
    if (user.role === 'admin') return true; 
    return user.permissions?.includes(moduleName) || false;
  }, [user]);

  const syncSystemData = useCallback(async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
        const res = await api.get('/attendance/load', {
            params: { month: new Date().getMonth() + 1, year: new Date().getFullYear() }
        });
        setAttendanceData(res.data || {});
    } catch (err) {
        console.error("Sync Failed", err);
    } finally {
        setIsSyncing(false);
    }
  }, [user]); 

  useEffect(() => {
    if (user) syncSystemData();
  }, [user, syncSystemData, refreshAttendance]); // Added refreshAttendance here to trigger sync on approval

  const handleLoginSuccess = (userData) => {
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setActiveItem('Dashboard');
  };

  const handleLogout = () => {
    sessionStorage.clear(); 
    setUser(null);
    setActiveItem('Dashboard');
  };

  // --- DASHBOARD ROUTER ---
  const renderDashboard = () => {
    const dept = user.department?.toLowerCase();
    const isManagement = ['admin', 'manager', 'dept_head'].includes(user.role);

    const notifications = {
      inventoryCount: projects?.filter(p => p.activeStage === 2).length || 0,
      accountingCount: projects?.filter(p => p.activeStage === 4).length || 0
    };

    if (dept === 'accounting' || dept === 'procurement' || dept === 'accounting/procurement') {
      return <AccountingDashboard user={user} notifications={notifications} />;
    }
    if (dept === 'engineering' || user.name?.toLowerCase().includes('engr')) {
      return <EngineeringDashboard user={user} />;
    }
    if (dept === 'hr') {
      return <HRDashboard user={user} onApprovalSuccess={triggerAttendanceRefresh} />;
    }
    if (dept === 'sales') {
      return <SalesDashboard user={user} projects={projects} />;
    }
    if (dept === 'inventory' || dept === 'logistics') {
      return isManagement 
        ? <InventoryDashboard user={user} notifications={notifications} />
        : <InventoryEmployeeDashboard user={user} />;
    }

    return (
      <div className="p-20 text-center bg-white rounded-lg shadow m-6">
        <h2 className="text-xl font-semibold text-gray-800">Welcome, {user.name}</h2>
        <p className="text-gray-500 mt-2">Role: {user.role} | Dept: {user.department}</p>
      </div>
    );
  };

  const renderContent = () => {
    if (!user) return null;
    if (activeItem === 'Dashboard') return renderDashboard();
    if (!checkAccess(activeItem)) return <div className="p-20">Access Restricted</div>;

    switch (activeItem) {
      case 'Human Resource': 
        return (
          <Workforce 
            attendance={attendanceData} 
            setAttendance={setAttendanceData} 
          />
        );
      case 'Project': 
        return <Project projects={projects} setProjects={setProjects} />;
      case 'Customer': 
        return <Customer onProjectCreated={(p) => { setProjects([...projects, p]); setActiveItem('Project'); }} />;
      case 'Inventory': 
        return <Inventory />;
      case 'Documents': 
        return <Document />;
      case 'Setting': 
        return <Settings />;
      default: 
        return <div className="p-20">Module Under Development</div>;
    }
  };

  if (!user) return <Login onEnterSystem={handleLoginSuccess} />;

  return (
    <div className="app-container flex h-screen w-full overflow-hidden bg-gray-50">
      {/* --- GLOBAL TOAST NOTIFICATIONS --- */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#2D3748', // Dark background like your screenshot
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 24px',
          },
          success: {
            style: { borderLeft: '5px solid #48BB78' }, // Green accent
          },
          error: {
            style: { borderLeft: '5px solid #F56565' }, // Red accent
          }
        }}
      />

      <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} checkAccess={checkAccess} />
      <main className="content-area flex-1 h-full overflow-y-auto">
        <Header user={user} onLogout={handleLogout} />
        <div className="main-content-wrapper">
          {isSyncing && (
            <div className="sync-loader" style={{ color: '#FF1817', fontWeight: 'bold', padding: '10px' }}>
              Updating VISION Data...
            </div>
          )}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;