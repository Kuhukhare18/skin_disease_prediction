import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import SkinDiseasePredictor from "./components/SkinDiseasePredictor";
import BookAppointment from "./components/BookAppointment";

import Footer from "./components/Footer";
import "./styles.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/predict" element={<SkinDiseasePredictor />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
