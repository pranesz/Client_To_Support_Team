import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login'; 
import DeveloperDashboard from './components/developer-Dashboard';
import UserDashboard from './components/user-dashbord';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>App</h1>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/developer-dashboard" element={<DeveloperDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
         
        </Routes>
      </div>
    </Router>
  );
}

export default App;
