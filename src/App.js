import './App.css';
import React, { useState, useEffect } from "react";
import Heatmap from "./components/Heatmap";
import Trends from "./components/Trends";
import MostAffected from "./components/MostAffected";
import CrimeRateChange from "./components/CrimeRateChange";
import CrimeDistribution from "./components/CrimeDistribution";
import Login from "./components/Login";

function App() {
  const [selectedView, setSelectedView] = useState("Heatmap");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  } 

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <nav className="flex justify-between items-center bg-blue-600 text-white p-3 rounded-lg">
        <div className="flex space-x-6">
          {["Heatmap", "Trends", "Most Affected", "Crime Distribution", "Crime Rate Change"].map(view => (
            <button key={view} className={`px-4 py-3 text-lg font-bold ${selectedView === view ? "active" : ""}`} onClick={() => setSelectedView(view)}>
              {view}
            </button>
          ))}
        </div>
        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">Logout</button>
      </nav>

      <div className="mt-6 p-6 bg-white rounded-lg shadow">
        {selectedView === "Heatmap" && <Heatmap />}
        {selectedView === "Trends" && <Trends />}
        {selectedView === "Most Affected" && <MostAffected />}
        {selectedView === "Crime Distribution" && <CrimeDistribution />}
        {selectedView === "Crime Rate Change" && <CrimeRateChange />}
      </div>
    </div>
  );    
}

export default App;
