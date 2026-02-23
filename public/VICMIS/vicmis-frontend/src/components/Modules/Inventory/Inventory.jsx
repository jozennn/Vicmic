import React, { useState } from 'react';
import InventoryHome from './InventoryHome';
import ConstructionMat from './tab/ConstructionMat';
import OfficeMat from './tab/OfficeMat';
import IncomingShipment from './tab/IncomingShipment';
import DeliveryMat from './tab/DeliveryMat';
import MaterialRequest from './tab/MaterialRequest';

const Inventory = () => {
  const [currentView, setCurrentView] = useState('home');

  return (
    <div className="inventory-wrapper">
      {currentView === 'home' && <InventoryHome onSelectCategory={setCurrentView} />}
      
      {currentView === 'Construction Materials' && <ConstructionMat onBack={() => setCurrentView('home')} />}
      
      {currentView === 'Office Materials' && <OfficeMat onBack={() => setCurrentView('home')} />}
      
      {currentView === 'Incoming Shipment' && <IncomingShipment onBack={() => setCurrentView('home')} />}
      
      {currentView === 'Delivery Materials' && <DeliveryMat onBack={() => setCurrentView('home')} />}
      
      {currentView === 'Material Request' && <MaterialRequest onBack={() => setCurrentView('home')} />}
    </div>
  );
};

export default Inventory;