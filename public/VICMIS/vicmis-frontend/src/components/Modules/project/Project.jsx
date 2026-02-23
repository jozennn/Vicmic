import React, { useState } from 'react';
import ProjectManagementHome from './ProjectManagementHome.jsx';
import './css/Project.css'; 

const Project = ({ projects, setProjects }) => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedProject, setSelectedProject] = useState(null);
  const [openStep, setOpenStep] = useState(null);
  const [activePhaseTab, setActivePhaseTab] = useState(1);
  const [isApproved, setIsApproved] = useState(false); 

  // --- PERSONNEL STATE ---
  const [personnel, setPersonnel] = useState({
    engineer: 'Engr. Juan Dela Cruz', 
    salesRep: 'Maria Santos'
  });

  const [boqData, setBoqData] = useState({
    floorPlanFile: null,
    planMeasurement: '',
    planBOQ: '',
    actualMeasurement: '',
    finalBOQ: ''
  });

  const workflowPhases = [
    { id: 1, name: "Measurement & BOQ", color: "#3498db" },
    { 
      id: 2, 
      name: "Admin & Procurement", 
      color: "#f1c40f", 
      steps: [
        { id: 6, title: 'Purchase Order', dept: 'Sales', tasks: ['Client Confirmation', 'PO Issuance'] },
        { id: 7, title: 'P.O. & Work Order', dept: 'Sales Coor', tasks: ['Internal Processing', 'Work Order Generation'] },
        { id: 8, title: 'Initial Site Inspection', dept: 'Eng', tasks: ['Structural Check', 'Site Readiness'] },
        { id: 9, title: 'Checking Delivery', dept: 'Log/Ops', tasks: ['Material Arrival', 'Inventory Check'] },
      ]
    },
    { 
      id: 3, 
      name: "Execution & Monitoring", 
      color: "#e67e22", 
      steps: [
        { id: 10, title: 'Mobilization', dept: 'Ops', tasks: ['Manpower Deployment', 'Equipment Setup'] },
        { id: 11, title: 'Main Construction', dept: 'Eng', tasks: ['Foundation/Base', 'Main Structure Assembly'] },
        { id: 12, title: 'Weekly Reporting', dept: 'Eng', tasks: ['Progress Photos', 'Client Update'] }
      ] 
    },
    { 
      id: 4, 
      name: "QC & Completion", 
      color: "#2ecc71", 
      steps: [
        { id: 13, title: 'Quality Control', dept: 'QC Team', tasks: ['Snag List Creation', 'Rectification'] },
        { id: 14, title: 'Turnover', dept: 'Sales/Eng', tasks: ['Client Acceptance', 'Final Invoice'] }
      ] 
    }
  ];

  // --- LOGIC GATES ---
  const isPhase1Filled = () => {
    return boqData.planMeasurement && boqData.planBOQ && boqData.actualMeasurement && boqData.finalBOQ;
  };

  /**
   * FIX: Added check to ensure steps exist. 
   * A phase with 0 steps is NEVER "complete".
   */
  const isPhaseComplete = (phaseId, completedTasks) => {
    if (phaseId === 1) return isPhase1Filled() && isApproved;
    
    const phase = workflowPhases.find(p => p.id === phaseId);
    if (!phase.steps || phase.steps.length === 0) return false; 

    return phase.steps.every(step => 
      step.tasks.every(t => completedTasks?.includes(t))
    );
  };

  const handleTaskToggle = (projId, stepId, taskName) => {
    setProjects(prev => prev.map(proj => {
      if (proj.projectId === projId) {
        const isCompleted = proj.completedTasks?.includes(taskName);
        const newTasks = isCompleted 
          ? proj.completedTasks.filter(t => t !== taskName)
          : [...(proj.completedTasks || []), taskName];
        return { ...proj, completedTasks: newTasks };
      }
      return proj;
    }));
  };

  // --- VIEW: WORKFLOW DETAIL ---
  if (currentView === 'workflow-detail' && selectedProject) {
    const currentPhase = workflowPhases.find(p => p.id === activePhaseTab);

    return (
      <div className="project-module-container light-theme">
        <div className="module-header">
          <button onClick={() => setCurrentView('home')} className="btn-back-logic">← Back to Projects</button>
          <h2 className="header-title">Project: {selectedProject.projectName}</h2>
        </div>

        <div className="personnel-bar">
            <div className="person-info">
                <span className="label">Assigned Engineer:</span>
                <span className="value">👷 {personnel.engineer}</span>
            </div>
            <div className="person-info">
                <span className="label">Sales Representative:</span>
                <span className="value">💼 {personnel.salesRep}</span>
            </div>
        </div>

        <div className="phase-stepper">
            {workflowPhases.map((phase) => {
                // Dependency Logic: Phase 2 requires Phase 1 to be done, etc.
                const isPreviousPhaseDone = phase.id === 1 || isPhaseComplete(phase.id - 1, selectedProject.completedTasks);
                const isDone = isPhaseComplete(phase.id, selectedProject.completedTasks);
                
                return (
                    <div 
                        key={phase.id} 
                        className={`step-item ${activePhaseTab === phase.id ? 'active' : ''} ${isDone ? 'completed' : ''} ${!isPreviousPhaseDone ? 'disabled' : ''}`}
                        onClick={() => isPreviousPhaseDone && setActivePhaseTab(phase.id)}
                    >
                        <div className="step-number">{isDone ? '✓' : phase.id}</div>
                        <div className="step-label">{phase.name}</div>
                    </div>
                );
            })}
        </div>

        {activePhaseTab === 1 ? (
          <div className="boq-management-card">
              <div className="boq-header">
                  <h3>1. Measurement & BOQ Management</h3>
                  <div className="header-status">
                      {isApproved ? <span className="badge approved">APPROVED</span> : <span className="badge pending">AWAITING APPROVAL</span>}
                  </div>
              </div>
              <div className="boq-body">
                  <div className="boq-input-group full-width">
                      <label>Upload Floor Plan </label>
                      <input type="file" onChange={(e) => setBoqData({...boqData, floorPlanFile: e.target.files[0]})} disabled={isApproved}/>
                  </div>
                  <div className="boq-grid">
                      <div className="boq-input-group">
                          <label>Measurement Based on Plan</label>
                          <textarea value={boqData.planMeasurement} onChange={(e) => setBoqData({...boqData, planMeasurement: e.target.value})} disabled={isApproved}/>
                      </div>
                      <div className="boq-input-group">
                          <label>BOQ Based on Plan Measurement</label>
                          <textarea value={boqData.planBOQ} onChange={(e) => setBoqData({...boqData, planBOQ: e.target.value})} disabled={isApproved}/>
                      </div>
                      <div className="boq-input-group">
                          <label>Actual Measurement</label>
                          <textarea value={boqData.actualMeasurement} onChange={(e) => setBoqData({...boqData, actualMeasurement: e.target.value})} disabled={isApproved}/>
                      </div>
                      <div className="boq-input-group">
                          <label>Final BOQ Based on Actual Measurement</label>
                          <textarea value={boqData.finalBOQ} onChange={(e) => setBoqData({...boqData, finalBOQ: e.target.value})} disabled={isApproved}/>
                      </div>
                  </div>
              </div>
              <div className="boq-footer">
                  {!isApproved ? (
                      <button 
                        className={`approve-btn ${!isPhase1Filled() ? 'dimmed' : ''}`} 
                        onClick={() => isPhase1Filled() && setIsApproved(true)}
                      >
                        Verify & Approve Phase 1
                      </button>
                  ) : (
                      <p className="success-msg">✅ Phase 1 data has been locked and approved. Proceed to Phase 2.</p>
                  )}
              </div>
          </div>
        ) : (
          <div className="stage-grid">
              {currentPhase.steps?.map((step) => (
                  <div key={step.id} className={`sop-stage-card ${openStep === step.id ? 'expanded' : ''}`}>
                      <div className="sop-stage-header" onClick={() => setOpenStep(openStep === step.id ? null : step.id)}>
                          <div className="title-section">
                            <span className="chevron">{openStep === step.id ? '▼' : '▶'}</span>
                            <span>{step.title}</span>
                          </div>
                          <span className="dept-label">{step.dept}</span>
                      </div>
                      
                      {openStep === step.id && (
                        <div className="sop-task-list">
                          {step.tasks.map((task, idx) => (
                            <label key={idx} className="task-item">
                              <input 
                                type="checkbox" 
                                checked={selectedProject.completedTasks?.includes(task)}
                                onChange={() => handleTaskToggle(selectedProject.projectId, step.id, task)}
                              />
                              <span className="task-name">{task}</span>
                            </label>
                          ))}
                        </div>
                      )}
                  </div>
              ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="project-module-container light-theme">
      <ProjectManagementHome 
        projects={projects} 
        onSelectProject={(proj) => {
          setSelectedProject(proj);
          setCurrentView('workflow-detail');
        }} 
      />
    </div>
  );
};

export default Project;