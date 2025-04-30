import React from "react";
import "./Header.css"; // Create this CSS file for styling

const Header = () => {
  return (
    <header className="header">
      <h1>AI Healthcare</h1>
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/doctors">Doctors</a></li>
          <li><a href="/appointments">Appointments</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
