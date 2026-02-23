import React, { useState } from 'react';
import './css/Management.css';

const ProjectManagementHome = ({ newProjectFromLead }) => {
  // activeStage 1 = Site Inspection unlocked, others locked.
  const [projects, setLeads] = useState([
    {
      ...newProjectFromLead,
      activeStage: 1, 
      completedTasks: [],
    }
  ]);

  const [openSOPStage, setOpenSOPStage] = useState(null);

  const sopFullDetails = [
    { 
      id: 1, 
      roman: 'I',
      title: 'SITE INSPECTION', 
      sections: [
        { id: 'itinerary', name: 'Itinerary Approval', details: 'Must be approved by Eng Head, Op Manager, GM, and President.' },
        { id: 'allowance', name: 'Allowance / Budget', details: '₱200.00 meal allowance. Needs approved itinerary.' },
        { id: 'coordination', name: 'Coordination', details: 'Coordinate with Sales, Client, and Eng Head.' },
        { id: 'measurement', name: 'Actual Measurement', details: 'Minimum 2 people. Use laser meter/50m tape.' }
      ]
    },
    { 
      id: 2, 
      roman: 'II',
      title: 'OFFICE MEASUREMENTS', 
      sections: [
        { id: 'qs', name: 'Assigned Person', details: 'Rhine Valeriano (QS) & Mysty Baysic (OE).' },
        { id: 'approval', name: 'Approval', details: 'Engr. Jeric Hernandez must approve all BOQs.' }
      ]
    },
    // ... Stages III to XIV follow the same pattern
  ];

  const handleTaskComplete = (projId, stageId, taskId) => {
    // Logic to save completion and check if all tasks in stage are done to increment activeStage
    alert(`Task ${taskId} completed. Once all Stage ${stageId} tasks are done, Stage ${stageId + 1} will unlock.`);
  };

  return (
    <div className="customer-container">
      <div className="customer-header">
        <div className="header-info">
          <h1>Project Management Home</h1>
          <p>Active SOP Trackers</p>
        </div>
      </div>

      <div className="lead-grid">
        {projects.map((proj) => (
          <div key={proj.id} className="lead-card">
            <div className="lead-card-header">
              <span className="status-badge contacted">SOP ACTIVE</span>
              <span className="lead-id">PROJ-{proj.id}</span>
            </div>
            <div className="lead-body">
              <h3 className="client-name">{proj.projectName}</h3>
              <p className="project-title">Current Phase: <strong>Stage {proj.activeStage}</strong></p>
            </div>

            <div className="sop-accordion-container">
              {sopFullDetails.map((stage) => {
                const isLocked = stage.id > proj.activeStage;
                return (
                  <div key={stage.id} className={`sop-step-item ${isLocked ? 'locked-stage' : ''}`}>
                    <div 
                      className="sop-step-header" 
                      onClick={() => !isLocked && setOpenSOPStage(openSOPStage === stage.id ? null : stage.id)}
                    >
                      <div className="step-number">{stage.roman}</div>
                      <div className="step-title">{stage.title} {isLocked && '🔒'}</div>
                    </div>

                    {!isLocked && openSOPStage === stage.id && (
                      <div className="sop-step-details">
                        {stage.sections.map((sec) => (
                          <div key={sec.id} className="detail-row">
                            <strong>{sec.name}</strong>
                            <p>{sec.details}</p>
                            <button 
                              className="btn-approve-step"
                              onClick={() => handleTaskComplete(proj.id, stage.id, sec.id)}
                            >
                              Confirm Completion
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectManagementHome;