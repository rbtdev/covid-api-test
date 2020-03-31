import React, { useEffect, useState } from 'react';
import SIRChart from './SIRChart';
import './App.css';

function App() {

  return (
    <div className="App">
      <div style={{ width: '75%' }}>
        <SIRChart  />
      </div>
    </div>
  );
}

export default App;
