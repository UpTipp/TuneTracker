import React, { useState } from 'react';
import HomePage from './containers/HomePage';
import Dashboard from './containers/Dashboard';
import About from './containers/About';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  
  return (
    <Router>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/about' element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;