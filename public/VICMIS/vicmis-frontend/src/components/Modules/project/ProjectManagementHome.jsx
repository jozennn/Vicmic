import React from "react";
import "./css/ProjectManagement.css"; 

// Change the prop name here to match what Project.jsx is sending
// OR update Project.jsx to send 'onSelectModule'. 
// Let's use 'onSelectProject' to match your parent component's logic.
const ProjectManagementHome = ({ projects, onSelectProject }) => {
  
  const activeModules = [
    { id: 'construction', title: 'Construction Project', icon: '🏗️' },
    { id: 'storyboard', title: 'Story Board', icon: '📋' },
  ];

  return (
    <div className="pm-grid">
      {/* 1. If you have projects, you might want to list them here, 
          OR keep these cards as 'Category' buttons. 
          If these are categories, clicking 'Construction' should show the list. */}
      
      {activeModules.map((item, index) => (
        <div 
          key={item.id} 
          className="pm-card" 
          onClick={() => {
            if (projects && projects.length > 0) {
              onSelectProject(projects[0]); 
            } else {
              alert("No projects available in the database yet.");
            }
          }}
        >
          <div className="card-icon">{item.icon}</div>
          <div className="card-title">{item.title}</div>
        </div>
      ))}
      
      <div 
        className="pm-card add-card"
        onClick={() => alert("Logic to add a new project/module would go here!")}
      >
        <div className="card-icon">➕</div>
        <div className="card-title">Add New Module</div>
      </div>
    </div>
  );
};

export default ProjectManagementHome;