import React, { useState, useEffect, useCallback } from 'react';
import api from '@/api/axios';
import { 
  ClipboardCheck, Scale, Truck, Ship, MapPin, User, 
  Package, Plus, X, AlertCircle, Loader2, RefreshCw
} from 'lucide-react';
import './AccountingDashboard.css';

const AccountingDashboard = ({ user }) => {
  const [deliveries, setDeliveries] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [payrollList, setPayrollList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', supplier: '', quantity: '', unit_price: '', description: '', unit: 'pcs'
  });

  const fetchSupplyChainData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      if (isSilent) setIsRefreshing(true);
      
      const [delRes, shipRes, payrollRes] = await Promise.all([
        api.get('/inventory/logistics'), 
        api.get('/inventory/shipments'),
        api.get('/payroll/pending') 
      ]);
      
      setDeliveries(delRes.data.slice(0, 5)); 
      setShipments(shipRes.data.slice(0, 5));
      setPayrollList(payrollRes.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSupplyChainData();
    const interval = setInterval(() => fetchSupplyChainData(true), 10000); 
    return () => clearInterval(interval);
  }, [fetchSupplyChainData]);

const handleReleaseFunds = async () => {
  if (!window.confirm(`Release funds for ${payrollList.length} employees?`)) return;
  setActionLoading(true);

  try {
    // We map the list to match the backend requirement: "payrolls.0.user_id"
    const payload = {
      payrolls: payrollList.map(item => ({
        id: item.id,
        user_id: item.user_id, // Use the user_id as requested
        total_amount: item.total_amount
      }))
    };

    await api.post('/payroll/approve-all', payload);
    
    alert("Funds released successfully!");
    setPayrollList([]);
    setShowPayrollModal(false);
  } catch (err) {
    console.error("Release Error:", err.response?.data);
    alert("Failed to release funds. Check console for validation errors.");
  } finally {
    setActionLoading(false);
  }
};

  const handleRejectPayroll = async () => {
    const note = prompt("Reason for rejection (this will be sent to HR):");
    if (!note) return;
    setActionLoading(true);
    try {
      await api.post('/payroll/reject-all', { note });
      alert("Payroll rejected and sent back to HR.");
      setPayrollList([]);
      setShowPayrollModal(false);
    } catch (err) {
      alert("Error rejecting payroll.");
    } finally {
      setActionLoading(false);
    }
  };

  const totalPayrollAmount = payrollList.reduce((sum, item) => sum + parseFloat(item.total_amount), 0);

  return (
    <div className="vision-accounting-wrapper">
      {/* PROFESSIONAL HEADER */}
      <header className="v-dashboard-header">
        <div>
          <h1>Accounting Control Center</h1>
          <p>Vision Logistics & Financial Oversight</p>
        </div>
        <button 
          className={`v-refresh-btn ${isRefreshing ? 'spinning' : ''}`} 
          onClick={() => fetchSupplyChainData()}
        >
          <RefreshCw size={18} />
        </button>
      </header>

      {/* TOP STATS STATS */}
      <div className="vision-stats-grid">
        <div className={`vision-stat-card border-red ${payrollList.length > 0 ? 'v-pulse-border' : ''}`}>
          <div className="v-stat-icon red-bg"><ClipboardCheck size={24} /></div>
          <div className="v-stat-info">
            <span className="v-label">Payroll Approval</span>
            <span className="v-value">{payrollList.length} Pending</span>
          </div>
        </div>
        <div className="vision-stat-card border-navy">
          <div className="v-stat-icon navy-bg"><Scale size={24} /></div>
          <div className="v-stat-info">
            <span className="v-label">Material Budget</span>
            <span className="v-value">₱1.2M Allocated</span>
          </div>
        </div>
        <div className="vision-stat-card border-blue">
          <div className="v-stat-icon blue-bg"><Truck size={24} /></div>
          <div className="v-stat-info">
            <span className="v-label">Active Deliveries</span>
            <span className="v-value">
              {deliveries.filter(d => d.status !== 'Delivered').length} In-Transit
            </span>
          </div>
        </div>
      </div>

      <div className="vision-main-layout">
        <div className="vision-left-col">
          {/* PAYROLL VALIDATION */}
          <div className="vision-card">
            <div className="v-card-header">
              <h3><span className="v-indicator red"></span> HR Payroll Validation</h3>
            </div>
            {payrollList.length > 0 ? (
                <div className="v-payroll-highlight-box">
                    <div className="v-payroll-summary-info">
                        <strong>Batch Dispersement Ready</strong>
                        <p>{payrollList.length} Staff | Total: ₱{totalPayrollAmount.toLocaleString()}</p>
                    </div>
                    <button className="v-btn-action-red" onClick={() => setShowPayrollModal(true)}>
                        Verify & Release
                    </button>
                </div>
            ) : (
                <div className="v-empty-box">No pending payroll requests.</div>
            )}
          </div>

          {/* BUDGET TABLE */}
          <div className="vision-card">
            <div className="v-card-header">
              <h3><span className="v-indicator navy"></span> Budget Approval Queue</h3>
            </div>
            <div className="v-table-container">
                <table className="v-modern-table">
                <thead>
                    <tr>
                      <th>Material</th>
                      <th>Quantity</th>
                      <th>Est. Cost</th>
                      <th className="text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                      <td><strong>Industrial Cement</strong></td>
                      <td>500 Bags</td>
                      <td>₱145,000.00</td>
                      <td className="text-right"><button className="v-btn-table-approve">Approve</button></td>
                    </tr>
                </tbody>
                </table>
            </div>
          </div>
        </div>

        <div className="vision-right-col">
          {/* SUPPLY CHAIN FEED */}
          <div className="vision-card">
            <div className="v-card-header">
              <h3><span className="v-indicator blue"></span> Supply Chain Logistics</h3>
            </div>
            
            <div className="v-timeline-feed">
              <h4 className="v-section-tag">Site Deliveries</h4>
              {deliveries.length > 0 ? (
                deliveries.map(del => (
                  <div key={del.id} className="v-timeline-item">
                    <div className="v-t-icon"><Truck size={14} /></div>
                    <div className="v-t-content">
                      <strong>{del.item_name}</strong>
                      <span><MapPin size={10} /> {del.destination}</span>
                    </div>
                    <span className={`v-status-tag ${del.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {del.status || 'Transit'}
                    </span>
                  </div>
                ))
              ) : <p className="v-none">No active deliveries</p>}

              <h4 className="v-section-tag mt-20">Incoming Shipments</h4>
              {shipments.length > 0 ? (
                shipments.map(ship => (
                  <div key={ship.id} className="v-timeline-item">
                    <div className="v-t-icon"><Package size={14} /></div>
                    <div className="v-t-content">
                      <strong>{ship.name}</strong>
                      <span><User size={10} /> {ship.supplier}</span>
                    </div>
                    <span className={`v-status-tag ${ship.status === 'Received' ? 'success' : 'pending'}`}>
                        {ship.status}
                    </span>
                  </div>
                ))
              ) : <p className="v-none">No pending shipments</p>}
            </div>
          </div>

          {/* QUICK ORDER */}
          <div className="vision-card">
            <div className="v-card-header">
              <h3><Plus size={18} /> Material Requisition</h3>
            </div>
            <form className="v-quick-form">
                <input className="v-input" placeholder="Material Name" />
                <input className="v-input" placeholder="Supplier" />
                <div className="v-form-row">
                    <input className="v-input" placeholder="Qty" type="number" />
                    <input className="v-input" placeholder="Price" type="number" />
                    <button type="button" className="v-btn-navy-action">Order</button>
                </div>
            </form>
          </div>
        </div>
      </div>

      {/* PROFESSIONAL PAYROLL MODAL */}
      {showPayrollModal && (
        <div className="v-overlay">
          <div className="v-modal">
            <div className="v-modal-head">
              <h2>Review Payroll Disbursement</h2>
              <button onClick={() => setShowPayrollModal(false)}><X /></button>
            </div>
            <div className="v-modal-body">
              <div className="v-warning-banner">
                <AlertCircle size={18} />
                <p>Verify bank details and staff attendance totals before final release.</p>
              </div>
              <div className="v-table-scroll">
                <table className="v-modern-table">
                  <thead>
                    <tr>
                      <th>Staff Name</th>
                      <th>Days</th>
                      <th className="text-right">Total Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollList.map(item => (
                      <tr key={item.id}>
                        <td>
                          <strong>
                            {/* Use user.name because you are using user_id logic */}
                            {item.user?.name || `Staff ID: ${item.user_id}`}
                          </strong>
                        </td>
                        <td>{item.days_present}</td>
                        <td className="text-right">₱{parseFloat(item.total_amount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="v-modal-foot">
               <button className="v-btn-secondary" onClick={handleRejectPayroll} disabled={actionLoading}>
                 Reject Batch
               </button>
               <button className="v-btn-primary-red" onClick={handleReleaseFunds} disabled={actionLoading}>
                 {actionLoading ? <Loader2 className="animate-spin" /> : <ClipboardCheck size={18} />}
                 Approve & Release Funds
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountingDashboard;