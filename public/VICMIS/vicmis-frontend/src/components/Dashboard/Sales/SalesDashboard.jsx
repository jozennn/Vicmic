import React from 'react';
import './SalesDashboard.css'; // Reuse your existing dashboard styles

const SalesDashboard = ({ user, projects = [] }) => {
  // Mock data - in production, these would come from your Laravel API
  const stats = [
    { id: 1, label: 'Total Leads', value: '124', icon: '📈', color: '#3498db' },
    { id: 2, label: 'Converted Projects', value: projects.length, icon: '🏗️', color: '#2ecc71' },
    { id: 3, label: 'Pending Approvals', value: '8', icon: '⏳', color: '#f1c40f' },
    { id: 4, label: 'Win Rate', value: '24%', icon: '🏆', color: '#9b59b6' },
  ];

  return (
    <div className="dashboard-container">

      {/* Metric Grid - Matching HR/Eng style */}
      <div className="stats-grid">
        {stats.map(stat => (
          <div key={stat.id} className="stat-card" style={{ borderLeft: `5px solid ${stat.color}` }}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-main-grid">
        {/* Recent Leads Table */}
        <div className="dashboard-card main-table">
          <h3>Recent Leads</h3>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Project</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Alice Wonderland</td>
                <td>Tea Party Pavilion</td>
                <td><span className="badge pending">Proposal Sent</span></td>
                <td><button className="btn-small">View</button></td>
              </tr>
              {/* More rows here */}
            </tbody>
          </table>
        </div>

        {/* Pipeline Summary */}
        <div className="dashboard-card summary-chart">
          <h3>Pipeline Overview</h3>
          <div className="pipeline-item">
            <span>Inquiry</span>
            <div className="progress-bar"><div className="fill" style={{ width: '80%' }}></div></div>
          </div>
          <div className="pipeline-item">
            <span>Site Visit</span>
            <div className="progress-bar"><div className="fill" style={{ width: '45%' }}></div></div>
          </div>
          <div className="pipeline-item">
            <span>Contract Signed</span>
            <div className="progress-bar"><div className="fill" style={{ width: '20%' }}></div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;