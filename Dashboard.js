import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handlePredictDisease = () => {
    navigate("/predict");  // First, go to skin disease prediction
  };

  return (
    <div className="dashboard">
      <h2>Welcome to AI Healthcare</h2>
      <p>Start by predicting your skin disease.</p>
      <button className="predict-btn" onClick={handlePredictDisease}>
        Start Skin Disease Prediction
      </button>
    </div>
  );
};

export default Dashboard;
