import React, { useState } from 'react';
import HomePage from './containers/HomePage';
import Dashboard from './containers/Dashboard';
import About from './containers/About';
import User from './containers/User';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/user/:id' element={<User />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/about' element={<About />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;